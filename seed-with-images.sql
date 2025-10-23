-- Script de données d'exemple avec images
-- Exécuter APRÈS avoir fait la mise à jour avec database-update.sql

USE listing_app;

-- Vider les données existantes (attention : cela supprime tout !)
DELETE FROM reviews;
DELETE FROM promotions;
DELETE FROM establishments;
DELETE FROM sites;
DELETE FROM partners;
DELETE FROM users;

-- Insérer des utilisateurs avec des mots de passe hachés (password123)
INSERT INTO users (id, first_name, last_name, email, password, role) VALUES
('clzadmin001', 'Admin', 'System', 'admin@tourism.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('clzuser001', 'Marie', 'Dubois', 'marie.dubois@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('clzuser002', 'Pierre', 'Martin', 'pierre.martin@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('clzpartner001', 'Sophie', 'Bernard', 'sophie.bernard@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARTNER');

-- Insérer des partenaires avec informations complètes
INSERT INTO partners (id, name, email, phone, description, website, address, status, validated_by, validated_at) VALUES
('clzpartner01', 'Luxe Hotels Paris', 'contact@luxehotels.com', '+33 1 42 86 87 88', 
 'Chaîne d\'hôtels de luxe spécialisée dans l\'hospitalité haut de gamme', 
 'https://www.luxehotels.com', '15 Avenue des Champs-Élysées, 75008 Paris', 
 'APPROVED', 'clzadmin001', NOW()),
 
('clzpartner02', 'Saveurs de France', 'info@saveursdefrance.fr', '+33 1 45 67 89 10', 
 'Groupe de restauration authentique française', 
 'https://www.saveursdefrance.fr', '28 Rue de la Paix, 75001 Paris', 
 'APPROVED', 'clzadmin001', NOW()),
 
('clzpartner03', 'Cafés & Bistros Parisiens', 'contact@cafesbistros.fr', '+33 1 34 56 78 90', 
 'Réseau de cafés et bistros traditionnels parisiens', 
 'https://www.cafesbistros.fr', '42 Boulevard Saint-Germain, 75005 Paris', 
 'APPROVED', 'clzadmin001', NOW());

-- Insérer des établissements avec des images
INSERT INTO establishments (id, name, description, type, price, images, address, phone, email, website, latitude, longitude, amenities, menu, availability, is_active, partner_id) VALUES
('clzestab001', 'Hôtel Le Meurice', 
 'Palace parisien situé face au jardin des Tuileries, alliant art de vivre français et raffinement contemporain.', 
 'HOTEL', 650.00, 
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=center'
 ),
 '228 Rue de Rivoli, 75001 Paris', '+33 1 44 58 10 10', 'reservations@lemeurice.com', 
 'https://www.dorchestercollection.com/paris/le-meurice', 48.8647, 2.3310,
 JSON_ARRAY('WiFi gratuit', 'Spa', 'Restaurant étoilé', 'Salle de fitness', 'Concierge', 'Room service 24h/24'),
 JSON_OBJECT('type', 'hotel', 'services', JSON_ARRAY('Petit-déjeuner', 'Room service', 'Conciergerie')),
 JSON_OBJECT('disponible', '24h/24', 'check-in', '15h00', 'check-out', '12h00'),
 true, 'clzpartner01'),

('clzestab002', 'Restaurant Le Grand Véfour', 
 'Restaurant gastronomique mythique du Palais-Royal, temple de la haute cuisine française depuis 1784.', 
 'RESTAURANT', 290.00,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&crop=center'
 ),
 '17 Rue de Beaujolais, 75001 Paris', '+33 1 42 96 56 27', 'contact@grand-vefour.com',
 'https://www.grand-vefour.com', 48.8634, 2.3360,
 JSON_ARRAY('Menu dégustation', 'Cave à vins', 'Service premium', 'Cuisine gastronomique'),
 JSON_OBJECT('Menu dégustation', '290€', 'Menu prestige', '390€', 'À la carte', 'Variable'),
 JSON_OBJECT('lun-ven', '12h00-14h00, 19h30-21h30', 'fermé', 'samedi-dimanche'),
 true, 'clzpartner02'),

('clzestab003', 'Café de Flore', 
 'Café mythique de Saint-Germain-des-Prés, lieu de rendez-vous des intellectuels et artistes depuis 1887.', 
 'CAFE', 25.00,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop&crop=center'
 ),
 '172 Boulevard Saint-Germain, 75006 Paris', '+33 1 45 48 55 26', 'info@cafedeflore.fr',
 'https://www.cafedeflore.fr', 48.8542, 2.3320,
 JSON_ARRAY('Terrasse', 'WiFi', 'Journaux', 'Ambiance historique'),
 JSON_OBJECT('Petit-déjeuner', '12-18€', 'Déjeuner', '18-28€', 'Boissons', '4-12€'),
 JSON_OBJECT('lun-dim', '07h00-01h00'),
 true, 'clzpartner03'),

('clzestab004', 'Harry\'s Bar Paris', 
 'Bar américain légendaire, berceau de cocktails mythiques comme le Bloody Mary et le Side Car.', 
 'BAR', 45.00,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop&crop=center'
 ),
 '5 Rue Daunou, 75002 Paris', '+33 1 42 61 71 14', 'contact@harrysbar.fr',
 'https://www.harrysbar.fr', 48.8695, 2.3315,
 JSON_ARRAY('Cocktails d\'exception', 'Ambiance vintage', 'Piano bar', 'Terrasse'),
 JSON_OBJECT('Cocktails signature', '18-25€', 'Cocktails classiques', '12-18€', 'Spiritueux', '8-35€'),
 JSON_OBJECT('lun-sam', '17h00-02h00', 'dim', '17h00-00h00'),
 true, 'clzpartner03'),

('clzestab005', 'Musée d\'Orsay Boutique', 
 'Boutique officielle du musée proposant des reproductions d\'art, livres et souvenirs culturels.', 
 'SHOP', 35.00,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center'
 ),
 '62 Rue de Lille, 75007 Paris', '+33 1 40 49 48 14', 'boutique@musee-orsay.fr',
 'https://www.musee-orsay.fr/boutique', 48.8600, 2.3266,
 JSON_ARRAY('Reproductions d\'art', 'Livres d\'art', 'Souvenirs culturels', 'Cadeaux'),
 JSON_OBJECT('Reproductions', '15-150€', 'Livres', '10-80€', 'Souvenirs', '5-50€'),
 JSON_OBJECT('mar-dim', '09h00-18h00', 'fermé', 'lundi'),
 true, 'clzpartner02');

-- Insérer des sites touristiques avec des images
INSERT INTO sites (id, name, description, address, latitude, longitude, images, category, opening_hours, entry_fee, website, phone, is_active, created_by) VALUES
('clzsite001', 'Tour Eiffel', 
 'Monument emblématique de Paris et symbole de la France, cette tour de fer de 330 mètres offre une vue panoramique exceptionnelle sur la capitale.', 
 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', 48.8584, 2.2945,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center'
 ),
 'MONUMENT', 
 JSON_OBJECT('lun-dim', '09h30-23h45', 'été', '09h00-00h45'),
 29.40, 'https://www.toureiffel.paris', '+33 8 92 70 12 39', 
 true, 'clzadmin001'),

('clzsite002', 'Musée du Louvre', 
 'Plus grand musée du monde et monument historique, abritant des œuvres d\'art inestimables dont La Joconde et la Vénus de Milo.', 
 'Rue de Rivoli, 75001 Paris', 48.8606, 2.3376,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1566139992507-833c9b8c3bb1?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&crop=center'
 ),
 'MUSEUM', 
 JSON_OBJECT('lun', 'Fermé', 'mar', '09h00-18h00', 'mer', '09h00-21h45', 'jeu-dim', '09h00-18h00'),
 17.00, 'https://www.louvre.fr', '+33 1 40 20 50 50', 
 true, 'clzadmin001'),

('clzsite003', 'Notre-Dame de Paris', 
 'Cathédrale gothique emblématique située sur l\'Île de la Cité, chef-d\'œuvre de l\'architecture médiévale française.', 
 '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris', 48.8530, 2.3499,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1585159650914-1a56fc0d8cb7?w=800&h=600&fit=crop&crop=center'
 ),
 'RELIGIOUS', 
 JSON_OBJECT('lun-ven', '08h00-18h45', 'sam-dim', '08h00-19h15'),
 0.00, 'https://www.notredamedeparis.fr', '+33 1 42 34 56 10', 
 true, 'clzadmin001'),

('clzsite004', 'Sacré-Cœur de Montmartre', 
 'Basilique romano-byzantine perchée au sommet de la butte Montmartre, offrant l\'une des plus belles vues sur Paris.', 
 '35 Rue du Chevalier de la Barre, 75018 Paris', 48.8867, 2.3431,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1585159650914-1a56fc0d8cb7?w=800&h=600&fit=crop&crop=center'
 ),
 'RELIGIOUS', 
 JSON_OBJECT('lun-dim', '06h00-22h30'),
 0.00, 'https://www.sacre-coeur-montmartre.com', '+33 1 53 41 89 00', 
 true, 'clzadmin001'),

('clzsite005', 'Arc de Triomphe', 
 'Monument emblématique situé au centre de la place Charles-de-Gaulle, symbole des victoires militaires françaises.', 
 'Place Charles de Gaulle, 75008 Paris', 48.8738, 2.2950,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1585159650914-1a56fc0d8cb7?w=800&h=600&fit=crop&crop=center'
 ),
 'MONUMENT', 
 JSON_OBJECT('lun-dim', '10h00-23h00'),
 13.00, 'https://www.paris-arc-de-triomphe.fr', '+33 1 55 37 73 77', 
 true, 'clzadmin001'),

('clzsite006', 'Jardin du Luxembourg', 
 'Magnifique jardin à la française de 25 hectares, parfait pour se détendre avec ses parterres, ses statues et son bassin.', 
 '6ème arrondissement de Paris', 48.8462, 2.3371,
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center',
   'https://images.unsplash.com/photo-1585159650914-1a56fc0d8cb7?w=800&h=600&fit=crop&crop=center'
 ),
 'PARK', 
 JSON_OBJECT('lun-dim', '07h30-21h30'),
 0.00, 'https://www.senat.fr/visite/jardin', '+33 1 42 34 20 00', 
 true, 'clzadmin001');

-- Insérer quelques avis
INSERT INTO reviews (id, rating, comment, status, user_id, establishment_id, moderated_by, moderated_at) VALUES
('clzreview001', 5, 'Expérience exceptionnelle ! Service impeccable et cadre somptueux.', 'APPROVED', 'clzuser001', 'clzestab001', 'clzadmin001', NOW()),
('clzreview002', 4, 'Très bonne cuisine, ambiance chaleureuse. Je recommande !', 'APPROVED', 'clzuser002', 'clzestab002', 'clzadmin001', NOW()),
('clzreview003', 5, 'Café mythique avec une atmosphère unique. Incontournable !', 'APPROVED', 'clzuser001', 'clzestab003', 'clzadmin001', NOW());

-- Insérer quelques promotions
INSERT INTO promotions (id, title, description, discount, valid_from, valid_until, establishment_id) VALUES
('clzpromo001', 'Offre Spéciale Été', 'Profitez de 20% de réduction sur votre séjour en réservant avant la fin du mois.', 20.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'clzestab001'),
('clzpromo002', 'Menu Découverte', 'Découvrez notre menu dégustation avec 15% de réduction pour les nouveaux clients.', 15.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'clzestab002');

-- Vérifier les données insérées
SELECT 'USERS' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'PARTNERS', COUNT(*) FROM partners
UNION ALL  
SELECT 'ESTABLISHMENTS', COUNT(*) FROM establishments
UNION ALL
SELECT 'SITES', COUNT(*) FROM sites
UNION ALL
SELECT 'REVIEWS', COUNT(*) FROM reviews
UNION ALL
SELECT 'PROMOTIONS', COUNT(*) FROM promotions;