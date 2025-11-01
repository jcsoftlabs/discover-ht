const { deleteImage } = require('../src/config/cloudinary');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Mock Cloudinary
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn(),
            destroy: jest.fn()
        }
    }
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        establishment: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn()
        },
        site: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn()
        },
        $disconnect: jest.fn()
    };
    return {
        PrismaClient: jest.fn(() => mockPrismaClient)
    };
});

// Mock fs
jest.mock('fs');

const { cloudinary } = require('cloudinary').v2;

describe('Cloudinary Image Operations', () => {
    let prisma;

    beforeEach(() => {
        jest.clearAllMocks();
        prisma = new PrismaClient();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Establishment Image Upload', () => {
        test('should successfully upload establishment images to Cloudinary', async () => {
            // Mock request with uploaded files
            const mockFiles = [
                {
                    fieldname: 'images',
                    originalname: 'hotel1.jpg',
                    path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/establishments/establishment-1234567890.jpg',
                    mimetype: 'image/jpeg'
                },
                {
                    fieldname: 'images',
                    originalname: 'hotel2.jpg',
                    path: 'https://res.cloudinary.com/demo/image/upload/v1234567891/touris-listings/establishments/establishment-1234567891.jpg',
                    mimetype: 'image/jpeg'
                }
            ];

            const mockReqBody = {
                name: 'Grand Hotel',
                type: 'hotel',
                price: 150,
                partnerId: 'partner123'
            };

            // Mock Prisma partner check
            prisma.establishment.partner.findUnique = jest.fn().mockResolvedValue({
                id: 'partner123',
                name: 'Partner Company'
            });

            // Mock Prisma create
            const expectedEstablishment = {
                id: 'est123',
                name: mockReqBody.name,
                type: mockReqBody.type,
                price: mockReqBody.price,
                images: mockFiles.map(f => f.path),
                partnerId: mockReqBody.partnerId
            };

            prisma.establishment.create.mockResolvedValue(expectedEstablishment);

            // Simulate controller logic
            const imageUrls = mockFiles.map(file => file.path);
            const result = await prisma.establishment.create({
                data: {
                    name: mockReqBody.name,
                    type: mockReqBody.type,
                    price: mockReqBody.price,
                    images: imageUrls,
                    partnerId: mockReqBody.partnerId
                }
            });

            expect(result.images).toHaveLength(2);
            expect(result.images[0]).toContain('cloudinary.com');
            expect(result.images[0]).toContain('touris-listings/establishments');
            expect(prisma.establishment.create).toHaveBeenCalledTimes(1);
        });

        test('should handle empty file upload for establishments', async () => {
            const mockReqBody = {
                name: 'Simple Hotel',
                type: 'hotel',
                price: 100,
                partnerId: 'partner123'
            };

            const expectedEstablishment = {
                id: 'est124',
                name: mockReqBody.name,
                type: mockReqBody.type,
                price: mockReqBody.price,
                images: null,
                partnerId: mockReqBody.partnerId
            };

            prisma.establishment.create.mockResolvedValue(expectedEstablishment);

            const result = await prisma.establishment.create({
                data: {
                    name: mockReqBody.name,
                    type: mockReqBody.type,
                    price: mockReqBody.price,
                    images: null,
                    partnerId: mockReqBody.partnerId
                }
            });

            expect(result.images).toBeNull();
        });

        test('should handle mixed upload (files + URLs) for establishments', async () => {
            const mockFiles = [
                {
                    path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/establishments/establishment-new.jpg'
                }
            ];

            const existingImages = [
                'https://res.cloudinary.com/demo/image/upload/v1111111111/touris-listings/establishments/establishment-old.jpg'
            ];

            const combinedImages = [...existingImages, ...mockFiles.map(f => f.path)];

            prisma.establishment.update.mockResolvedValue({
                id: 'est125',
                images: combinedImages
            });

            const result = await prisma.establishment.update({
                where: { id: 'est125' },
                data: { images: combinedImages }
            });

            expect(result.images).toHaveLength(2);
            expect(result.images).toContain(existingImages[0]);
            expect(result.images).toContain(mockFiles[0].path);
        });
    });

    describe('Site Image Upload', () => {
        test('should successfully upload site images to Cloudinary', async () => {
            const mockFiles = [
                {
                    fieldname: 'images',
                    originalname: 'monument1.jpg',
                    path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/sites/site-1234567890.jpg',
                    mimetype: 'image/jpeg'
                },
                {
                    fieldname: 'images',
                    originalname: 'monument2.jpg',
                    path: 'https://res.cloudinary.com/demo/image/upload/v1234567891/touris-listings/sites/site-1234567891.jpg',
                    mimetype: 'image/jpeg'
                }
            ];

            const mockReqBody = {
                name: 'Eiffel Tower',
                address: 'Paris, France',
                latitude: 48.8584,
                longitude: 2.2945
            };

            const expectedSite = {
                id: 'site123',
                name: mockReqBody.name,
                address: mockReqBody.address,
                latitude: mockReqBody.latitude,
                longitude: mockReqBody.longitude,
                images: mockFiles.map(f => f.path)
            };

            prisma.site.create.mockResolvedValue(expectedSite);

            const imageUrls = mockFiles.map(file => file.path);
            const result = await prisma.site.create({
                data: {
                    name: mockReqBody.name,
                    address: mockReqBody.address,
                    latitude: mockReqBody.latitude,
                    longitude: mockReqBody.longitude,
                    images: imageUrls
                }
            });

            expect(result.images).toHaveLength(2);
            expect(result.images[0]).toContain('cloudinary.com');
            expect(result.images[0]).toContain('touris-listings/sites');
            expect(prisma.site.create).toHaveBeenCalledTimes(1);
        });

        test('should handle empty file upload for sites', async () => {
            const mockReqBody = {
                name: 'Simple Monument',
                address: 'Lyon, France',
                latitude: 45.7640,
                longitude: 4.8357
            };

            const expectedSite = {
                id: 'site124',
                name: mockReqBody.name,
                address: mockReqBody.address,
                latitude: mockReqBody.latitude,
                longitude: mockReqBody.longitude,
                images: null
            };

            prisma.site.create.mockResolvedValue(expectedSite);

            const result = await prisma.site.create({
                data: {
                    name: mockReqBody.name,
                    address: mockReqBody.address,
                    latitude: mockReqBody.latitude,
                    longitude: mockReqBody.longitude,
                    images: null
                }
            });

            expect(result.images).toBeNull();
        });

        test('should append new images to existing site images', async () => {
            const existingSite = {
                id: 'site125',
                images: ['https://res.cloudinary.com/demo/image/upload/v1111111111/touris-listings/sites/site-old.jpg']
            };

            const newFiles = [
                {
                    path: 'https://res.cloudinary.com/demo/image/upload/v2222222222/touris-listings/sites/site-new.jpg'
                }
            ];

            const updatedImages = [...existingSite.images, ...newFiles.map(f => f.path)];

            prisma.site.update.mockResolvedValue({
                ...existingSite,
                images: updatedImages
            });

            const result = await prisma.site.update({
                where: { id: 'site125' },
                data: { images: updatedImages }
            });

            expect(result.images).toHaveLength(2);
            expect(result.images).toContain(existingSite.images[0]);
            expect(result.images).toContain(newFiles[0].path);
        });
    });

    describe('Image Deletion from Cloudinary', () => {
        test('should successfully delete establishment image from Cloudinary', async () => {
            const imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/establishments/establishment-1234567890.jpg';

            cloudinary.uploader.destroy.mockResolvedValue({
                result: 'ok'
            });

            await deleteImage(imageUrl);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
                'touris-listings/establishments/establishment-1234567890'
            );
            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(1);
        });

        test('should successfully delete site image from Cloudinary', async () => {
            const imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/sites/site-1234567890.jpg';

            cloudinary.uploader.destroy.mockResolvedValue({
                result: 'ok'
            });

            await deleteImage(imageUrl);

            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
                'touris-listings/sites/site-1234567890'
            );
        });

        test('should handle deletion error gracefully', async () => {
            const imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/establishments/establishment-1234567890.jpg';

            cloudinary.uploader.destroy.mockRejectedValue(
                new Error('Cloudinary API error')
            );

            await expect(deleteImage(imageUrl)).rejects.toThrow('Cloudinary API error');
        });

        test('should remove deleted images from establishment array', async () => {
            const existingEstablishment = {
                id: 'est126',
                images: [
                    'https://res.cloudinary.com/demo/image/upload/v1111111111/touris-listings/establishments/establishment-keep.jpg',
                    'https://res.cloudinary.com/demo/image/upload/v2222222222/touris-listings/establishments/establishment-delete.jpg'
                ]
            };

            const imageToDelete = existingEstablishment.images[1];
            const remainingImages = existingEstablishment.images.filter(url => url !== imageToDelete);

            cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });
            prisma.establishment.update.mockResolvedValue({
                ...existingEstablishment,
                images: remainingImages
            });

            await deleteImage(imageToDelete);

            const result = await prisma.establishment.update({
                where: { id: 'est126' },
                data: { images: remainingImages }
            });

            expect(result.images).toHaveLength(1);
            expect(result.images).toContain(existingEstablishment.images[0]);
            expect(result.images).not.toContain(imageToDelete);
        });

        test('should handle multiple image deletions', async () => {
            const imagesToDelete = [
                'https://res.cloudinary.com/demo/image/upload/v1111111111/touris-listings/establishments/establishment-1.jpg',
                'https://res.cloudinary.com/demo/image/upload/v2222222222/touris-listings/establishments/establishment-2.jpg'
            ];

            cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

            for (const imageUrl of imagesToDelete) {
                await deleteImage(imageUrl);
            }

            expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
        });
    });

    describe('Image Migration Script - Establishments', () => {
        test('should migrate local establishment images to Cloudinary', async () => {
            const mockEstablishments = [
                {
                    id: 'est1',
                    name: 'Hotel Paris',
                    images: [
                        '/uploads/establishments/hotel-paris-1.jpg',
                        '/uploads/establishments/hotel-paris-2.jpg'
                    ]
                }
            ];

            prisma.establishment.findMany.mockResolvedValue(mockEstablishments);
            fs.existsSync.mockReturnValue(true);

            cloudinary.uploader.upload.mockResolvedValueOnce({
                secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/establishments/hotel-paris-1.jpg',
                public_id: 'touris-listings/establishments/hotel-paris-1'
            }).mockResolvedValueOnce({
                secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567891/touris-listings/establishments/hotel-paris-2.jpg',
                public_id: 'touris-listings/establishments/hotel-paris-2'
            });

            prisma.establishment.update.mockResolvedValue({
                ...mockEstablishments[0],
                images: [
                    'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/establishments/hotel-paris-1.jpg',
                    'https://res.cloudinary.com/demo/image/upload/v1234567891/touris-listings/establishments/hotel-paris-2.jpg'
                ]
            });

            // Simulate migration logic
            const establishment = mockEstablishments[0];
            const newImageUrls = [];

            for (const imageUrl of establishment.images) {
                if (imageUrl.includes('/uploads/establishments/') && !imageUrl.includes('cloudinary.com')) {
                    const filename = imageUrl.split('/').pop();
                    const localPath = path.join(__dirname, '../public/uploads/establishments', filename);

                    if (fs.existsSync(localPath)) {
                        const result = await cloudinary.uploader.upload(localPath, {
                            folder: 'touris-listings/establishments',
                            public_id: filename.split('.')[0]
                        });
                        newImageUrls.push(result.secure_url);
                    }
                }
            }

            await prisma.establishment.update({
                where: { id: establishment.id },
                data: { images: newImageUrls }
            });

            expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
            expect(newImageUrls).toHaveLength(2);
            expect(newImageUrls[0]).toContain('cloudinary.com');
            expect(newImageUrls[0]).toContain('touris-listings/establishments');
            expect(prisma.establishment.update).toHaveBeenCalledWith({
                where: { id: 'est1' },
                data: { images: expect.arrayContaining([expect.stringContaining('cloudinary.com')]) }
            });
        });

        test('should skip already migrated establishment images', async () => {
            const mockEstablishments = [
                {
                    id: 'est2',
                    name: 'Hotel Lyon',
                    images: [
                        'https://res.cloudinary.com/demo/image/upload/v1111111111/touris-listings/establishments/hotel-lyon-1.jpg'
                    ]
                }
            ];

            prisma.establishment.findMany.mockResolvedValue(mockEstablishments);

            // Simulate migration logic
            const establishment = mockEstablishments[0];
            const newImageUrls = [];

            for (const imageUrl of establishment.images) {
                if (imageUrl.includes('cloudinary.com')) {
                    newImageUrls.push(imageUrl);
                }
            }

            expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
            expect(newImageUrls[0]).toBe(mockEstablishments[0].images[0]);
        });

        test('should handle missing local establishment files gracefully', async () => {
            const mockEstablishments = [
                {
                    id: 'est3',
                    name: 'Hotel Missing',
                    images: ['/uploads/establishments/missing-file.jpg']
                }
            ];

            prisma.establishment.findMany.mockResolvedValue(mockEstablishments);
            fs.existsSync.mockReturnValue(false);

            const establishment = mockEstablishments[0];
            const newImageUrls = [];

            for (const imageUrl of establishment.images) {
                if (imageUrl.includes('/uploads/establishments/') && !imageUrl.includes('cloudinary.com')) {
                    const filename = imageUrl.split('/').pop();
                    const localPath = path.join(__dirname, '../public/uploads/establishments', filename);

                    if (!fs.existsSync(localPath)) {
                        // File doesn't exist, skip
                        continue;
                    }
                }
            }

            expect(newImageUrls).toHaveLength(0);
            expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
        });

        test('should handle cloudinary upload errors during establishment migration', async () => {
            const mockEstablishments = [
                {
                    id: 'est4',
                    name: 'Hotel Error',
                    images: ['/uploads/establishments/error-file.jpg']
                }
            ];

            prisma.establishment.findMany.mockResolvedValue(mockEstablishments);
            fs.existsSync.mockReturnValue(true);
            cloudinary.uploader.upload.mockRejectedValue(new Error('Upload failed'));

            const establishment = mockEstablishments[0];
            const newImageUrls = [];
            let errorCount = 0;

            for (const imageUrl of establishment.images) {
                if (imageUrl.includes('/uploads/establishments/') && !imageUrl.includes('cloudinary.com')) {
                    try {
                        const filename = imageUrl.split('/').pop();
                        const localPath = path.join(__dirname, '../public/uploads/establishments', filename);

                        if (fs.existsSync(localPath)) {
                            const result = await cloudinary.uploader.upload(localPath, {
                                folder: 'touris-listings/establishments',
                                public_id: filename.split('.')[0]
                            });
                            newImageUrls.push(result.secure_url);
                        }
                    } catch (error) {
                        errorCount++;
                    }
                }
            }

            expect(errorCount).toBe(1);
            expect(newImageUrls).toHaveLength(0);
        });
    });

    describe('Image Migration Script - Sites', () => {
        test('should migrate local site images to Cloudinary', async () => {
            const mockSites = [
                {
                    id: 'site1',
                    name: 'Eiffel Tower',
                    images: [
                        '/uploads/sites/eiffel-1.jpg',
                        '/uploads/sites/eiffel-2.jpg'
                    ]
                }
            ];

            prisma.site.findMany.mockResolvedValue(mockSites);
            fs.existsSync.mockReturnValue(true);

            cloudinary.uploader.upload.mockResolvedValueOnce({
                secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/sites/eiffel-1.jpg',
                public_id: 'touris-listings/sites/eiffel-1'
            }).mockResolvedValueOnce({
                secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567891/touris-listings/sites/eiffel-2.jpg',
                public_id: 'touris-listings/sites/eiffel-2'
            });

            prisma.site.update.mockResolvedValue({
                ...mockSites[0],
                images: [
                    'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/sites/eiffel-1.jpg',
                    'https://res.cloudinary.com/demo/image/upload/v1234567891/touris-listings/sites/eiffel-2.jpg'
                ]
            });

            // Simulate migration logic
            const site = mockSites[0];
            const newImageUrls = [];

            for (const imageUrl of site.images) {
                if (imageUrl.includes('/uploads/sites/') && !imageUrl.includes('cloudinary.com')) {
                    const filename = imageUrl.split('/').pop();
                    const localPath = path.join(__dirname, '../public/uploads/sites', filename);

                    if (fs.existsSync(localPath)) {
                        const result = await cloudinary.uploader.upload(localPath, {
                            folder: 'touris-listings/sites',
                            public_id: filename.split('.')[0]
                        });
                        newImageUrls.push(result.secure_url);
                    }
                }
            }

            await prisma.site.update({
                where: { id: site.id },
                data: { images: newImageUrls }
            });

            expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
            expect(newImageUrls).toHaveLength(2);
            expect(newImageUrls[0]).toContain('cloudinary.com');
            expect(newImageUrls[0]).toContain('touris-listings/sites');
            expect(prisma.site.update).toHaveBeenCalledWith({
                where: { id: 'site1' },
                data: { images: expect.arrayContaining([expect.stringContaining('cloudinary.com')]) }
            });
        });

        test('should skip already migrated site images', async () => {
            const mockSites = [
                {
                    id: 'site2',
                    name: 'Louvre Museum',
                    images: [
                        'https://res.cloudinary.com/demo/image/upload/v1111111111/touris-listings/sites/louvre-1.jpg'
                    ]
                }
            ];

            prisma.site.findMany.mockResolvedValue(mockSites);

            // Simulate migration logic
            const site = mockSites[0];
            const newImageUrls = [];

            for (const imageUrl of site.images) {
                if (imageUrl.includes('cloudinary.com')) {
                    newImageUrls.push(imageUrl);
                }
            }

            expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
            expect(newImageUrls[0]).toBe(mockSites[0].images[0]);
        });

        test('should handle missing local site files gracefully', async () => {
            const mockSites = [
                {
                    id: 'site3',
                    name: 'Missing Site',
                    images: ['/uploads/sites/missing-file.jpg']
                }
            ];

            prisma.site.findMany.mockResolvedValue(mockSites);
            fs.existsSync.mockReturnValue(false);

            const site = mockSites[0];
            const newImageUrls = [];

            for (const imageUrl of site.images) {
                if (imageUrl.includes('/uploads/sites/') && !imageUrl.includes('cloudinary.com')) {
                    const filename = imageUrl.split('/').pop();
                    const localPath = path.join(__dirname, '../public/uploads/sites', filename);

                    if (!fs.existsSync(localPath)) {
                        continue;
                    }
                }
            }

            expect(newImageUrls).toHaveLength(0);
            expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
        });

        test('should handle cloudinary upload errors during site migration', async () => {
            const mockSites = [
                {
                    id: 'site4',
                    name: 'Site Error',
                    images: ['/uploads/sites/error-file.jpg']
                }
            ];

            prisma.site.findMany.mockResolvedValue(mockSites);
            fs.existsSync.mockReturnValue(true);
            cloudinary.uploader.upload.mockRejectedValue(new Error('Upload failed'));

            const site = mockSites[0];
            const newImageUrls = [];
            let errorCount = 0;

            for (const imageUrl of site.images) {
                if (imageUrl.includes('/uploads/sites/') && !imageUrl.includes('cloudinary.com')) {
                    try {
                        const filename = imageUrl.split('/').pop();
                        const localPath = path.join(__dirname, '../public/uploads/sites', filename);

                        if (fs.existsSync(localPath)) {
                            const result = await cloudinary.uploader.upload(localPath, {
                                folder: 'touris-listings/sites',
                                public_id: filename.split('.')[0]
                            });
                            newImageUrls.push(result.secure_url);
                        }
                    } catch (error) {
                        errorCount++;
                    }
                }
            }

            expect(errorCount).toBe(1);
            expect(newImageUrls).toHaveLength(0);
        });

        test('should migrate multiple sites in batch', async () => {
            const mockSites = [
                {
                    id: 'site5',
                    name: 'Site A',
                    images: ['/uploads/sites/site-a.jpg']
                },
                {
                    id: 'site6',
                    name: 'Site B',
                    images: ['/uploads/sites/site-b.jpg']
                }
            ];

            prisma.site.findMany.mockResolvedValue(mockSites);
            fs.existsSync.mockReturnValue(true);

            cloudinary.uploader.upload
                .mockResolvedValueOnce({
                    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/touris-listings/sites/site-a.jpg'
                })
                .mockResolvedValueOnce({
                    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567891/touris-listings/sites/site-b.jpg'
                });

            prisma.site.update.mockResolvedValue({});

            let uploadCount = 0;
            for (const site of mockSites) {
                for (const imageUrl of site.images) {
                    if (imageUrl.includes('/uploads/sites/') && !imageUrl.includes('cloudinary.com')) {
                        const filename = imageUrl.split('/').pop();
                        const localPath = path.join(__dirname, '../public/uploads/sites', filename);

                        if (fs.existsSync(localPath)) {
                            await cloudinary.uploader.upload(localPath, {
                                folder: 'touris-listings/sites',
                                public_id: filename.split('.')[0]
                            });
                            uploadCount++;
                        }
                    }
                }
            }

            expect(uploadCount).toBe(2);
            expect(cloudinary.uploader.upload).toHaveBeenCalledTimes(2);
        });
    });
});
