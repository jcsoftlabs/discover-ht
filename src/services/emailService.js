const nodemailer = require('nodemailer');

/**
 * Service d'envoi d'emails
 * Gère l'envoi d'emails via SMTP
 */

// Configuration du transporteur SMTP
let transporter;

const initEmailService = () => {
    // Configuration pour différents environnements
    const emailConfig = {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false, // Accepter les certificats auto-signés
            minVersion: 'TLSv1.2' // Version minimale de TLS
        },
        connectionTimeout: 10000, // 10 secondes
        greetingTimeout: 10000,
        socketTimeout: 20000
    };

    // Pour le développement, utiliser Ethereal Email (service de test)
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        console.log('🔧 Mode développement: utilisation d\'un service email de test');
        // La configuration sera faite dynamiquement dans sendEmail
        return null;
    }

    try {
        transporter = nodemailer.createTransport(emailConfig);
        console.log('📧 Service email initialisé avec succès');
        console.log('   Host:', emailConfig.host);
        console.log('   Port:', emailConfig.port);
        console.log('   Secure:', emailConfig.secure);
        
        // Vérifier la connexion (async, ne bloque pas le démarrage)
        transporter.verify().then(() => {
            console.log('✅ Connexion SMTP vérifiée et fonctionnelle');
        }).catch((error) => {
            console.error('⚠️ Erreur de vérification SMTP:', error.message);
            console.error('   Les emails pourraient ne pas être envoyés correctement');
        });
        
        return transporter;
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du service email:', error);
        return null;
    }
};

// Template HTML pour l'email de réinitialisation
const getPasswordResetTemplate = (firstName, resetLink, expiresIn = 30) => {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 30px;
            }
            .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .reset-button:hover {
                transform: translateY(-2px);
            }
            .expiration {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 4px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                font-size: 14px;
                color: #6c757d;
                border-top: 1px solid #e9ecef;
            }
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    margin: 10px;
                    width: auto;
                }
                .content {
                    padding: 20px;
                }
                .header {
                    padding: 30px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            
            <div class="content">
                <div class="greeting">Bonjour ${firstName},</div>
                
                <div class="message">
                    Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur notre plateforme de tourisme.
                </div>
                
                <div class="message">
                    Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                </div>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="reset-button">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                
                <div class="expiration">
                    ⏰ <strong>Important :</strong> Ce lien expire dans ${expiresIn} minutes pour des raisons de sécurité.
                </div>
                
                <div class="message">
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel reste inchangé.
                </div>
                
                <div class="message">
                    Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
                    <br>
                    <code style="background: #f1f3f4; padding: 5px; border-radius: 3px; word-break: break-all;">${resetLink}</code>
                </div>
            </div>
            
            <div class="footer">
                <p>
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                    <br>
                    Pour toute question, contactez-nous à <a href="mailto:support@touris-app.com">support@touris-app.com</a>
                </p>
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                    © 2025 Tourism Platform - Tous droits réservés
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Fonction principale d'envoi d'email
const sendEmail = async (options) => {
    try {
        // Pour le développement, créer un compte de test Ethereal si aucun SMTP configuré
        if (process.env.NODE_ENV === 'development' && !transporter) {
            const testAccount = await nodemailer.createTestAccount();
            
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            
            console.log('📧 Compte de test Ethereal créé:', testAccount.user);
        }

        if (!transporter) {
            throw new Error('Service email non configuré');
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || '"Tourism Platform" <noreply@touris-app.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text // Version texte optionnelle
        };

        const info = await transporter.sendMail(mailOptions);

        // Log différent selon l'environnement
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 Email envoyé:', info.messageId);
            console.log('🔗 URL de prévisualisation:', nodemailer.getTestMessageUrl(info));
        } else {
            console.log('📧 Email envoyé avec succès à:', options.to);
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };

    } catch (error) {
        console.error('❌ Erreur envoi email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Template HTML pour l'email de bienvenue
const getWelcomeEmailTemplate = (firstName, userEmail) => {
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur Tourism Platform</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 20px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
            }
            .features {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .feature-item {
                margin: 15px 0;
                padding-left: 30px;
                position: relative;
            }
            .feature-item:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
                font-size: 20px;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                font-size: 14px;
                color: #6c757d;
                border-top: 1px solid #e9ecef;
            }
            .footer a {
                color: #667eea;
                text-decoration: none;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    margin: 10px;
                    width: auto;
                }
                .content {
                    padding: 20px;
                }
                .header {
                    padding: 30px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bienvenue sur Tourism Platform !</h1>
            </div>
            
            <div class="content">
                <div class="greeting">Bonjour ${firstName},</div>
                
                <div class="message">
                    Nous sommes ravis de vous accueillir sur <strong>Tourism Platform</strong>, votre nouvelle destination pour découvrir les meilleurs établissements et sites touristiques !
                </div>
                
                <div class="message">
                    Votre compte a été créé avec succès avec l'adresse email : <strong>${userEmail}</strong>
                </div>
                
                <div class="features">
                    <h3 style="margin-top: 0; color: #2c3e50;">🌟 Ce que vous pouvez faire :</h3>
                    <div class="feature-item">Découvrir des hôtels, restaurants et attractions</div>
                    <div class="feature-item">Consulter les avis et évaluations des utilisateurs</div>
                    <div class="feature-item">Ajouter vos établissements favoris</div>
                    <div class="feature-item">Partager vos propres expériences et avis</div>
                    <div class="feature-item">Profiter de promotions exclusives</div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
                        Commencer à explorer
                    </a>
                </div>
                
                <div class="message">
                    Si vous avez des questions ou besoin d'aide, notre équipe de support est là pour vous accompagner.
                </div>
                
                <div class="message" style="font-size: 14px; color: #777; margin-top: 30px;">
                    <strong>Conseil :</strong> Complétez votre profil pour personnaliser votre expérience et recevoir des recommandations adaptées à vos préférences.
                </div>
            </div>
            
            <div class="footer">
                <p>
                    Cet email a été envoyé automatiquement suite à votre inscription.
                    <br>
                    Pour toute question, contactez-nous à <a href="mailto:support@touris-app.com">support@touris-app.com</a>
                </p>
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                    © 2025 Tourism Platform - Tous droits réservés
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Fonction spécialisée pour l'envoi d'email de bienvenue
const sendWelcomeEmail = async (userEmail, firstName) => {
    const htmlContent = getWelcomeEmailTemplate(firstName, userEmail);
    
    // Version texte simple
    const textContent = `
Bonjour ${firstName},

Nous sommes ravis de vous accueillir sur Tourism Platform !

Votre compte a été créé avec succès avec l'adresse email : ${userEmail}

Ce que vous pouvez faire :
- Découvrir des hôtels, restaurants et attractions
- Consulter les avis et évaluations des utilisateurs
- Ajouter vos établissements favoris
- Partager vos propres expériences et avis
- Profiter de promotions exclusives

Commencez dès maintenant : ${process.env.FRONTEND_URL || 'http://localhost:3000'}

Si vous avez des questions, contactez-nous à support@touris-app.com

---
Tourism Platform
    `.trim();

    return await sendEmail({
        to: userEmail,
        subject: '🎉 Bienvenue sur Tourism Platform !',
        html: htmlContent,
        text: textContent
    });
};

// Fonction spécialisée pour l'envoi d'email de réinitialisation
const sendPasswordResetEmail = async (userEmail, firstName, resetToken) => {
    // URL de l'application frontend (à adapter selon votre config)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const htmlContent = getPasswordResetTemplate(firstName, resetLink, 30);
    
    // Version texte simple
    const textContent = `
Bonjour ${firstName},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expire dans 30 minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

---
Tourism Platform
    `.trim();

    return await sendEmail({
        to: userEmail,
        subject: '🔐 Réinitialisation de votre mot de passe - Tourism Platform',
        html: htmlContent,
        text: textContent
    });
};

// Vérifier la configuration email
const verifyEmailConfig = async () => {
    if (!transporter) {
        return { success: false, error: 'Service email non initialisé' };
    }

    try {
        await transporter.verify();
        return { success: true, message: 'Configuration email valide' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    initEmailService,
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    verifyEmailConfig
};
