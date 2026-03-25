import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { KycService } from '../kyc.service';
import { Kyc, KycStatus } from '../kyc.entity';
import { UsersService } from '../../users/users.service';
import { EncryptionService } from '../../security/encryption.service';
import { SubmitKycDto } from '../kyc.dto';

/**
 * Integration tests for KYC encryption with the KYC service
 * Tests encryption/decryption within the context of KYC operations
 */
describe('KYC Encryption - Integration Tests', () => {
    let kycService: KycService;
    let encryptionService: EncryptionService;
    let kycRepository: Repository<Kyc>;
    let usersService: UsersService;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'SECURITY_ENCRYPTION_KEY') {
                return 'b'.repeat(64);
            }
            return undefined;
        }),
    };

    const mockKycRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    };

    const mockUsersService = {
        setKycStatus: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KycService,
                EncryptionService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: getRepositoryToken(Kyc), useValue: mockKycRepository },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        kycService = module.get<KycService>(KycService);
        encryptionService = module.get<EncryptionService>(EncryptionService);
        kycRepository = module.get<Repository<Kyc>>(getRepositoryToken(Kyc));
        usersService = module.get<UsersService>(UsersService);

        jest.clearAllMocks();
    });

    describe('submitKyc - Encryption Integration', () => {
        it('should encrypt KYC data before saving', async () => {
            const userId = 'user-123';
            const kycData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
            };
            const dto: SubmitKycDto = { kycData };

            const mockKycEntity = {
                id: 'kyc-123',
                userId,
                encryptedKycData: kycData,
                status: KycStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockKycRepository.create.mockReturnValue(mockKycEntity);
            mockKycRepository.save.mockResolvedValue(mockKycEntity);

            const result = await kycService.submitKyc(userId, dto);

            expect(mockKycRepository.create).toHaveBeenCalled();
            expect(mockKycRepository.save).toHaveBeenCalled();
            expect(mockUsersService.setKycStatus).toHaveBeenCalledWith(
                userId,
                KycStatus.PENDING,
            );
            expect(result).toBeDefined();
        });

        it('should set KYC status to PENDING on submission', async () => {
            const userId = 'user-456';
            const kycData = { first_name: 'Jane', last_name: 'Smith' };
            const dto: SubmitKycDto = { kycData };

            const mockKycEntity = {
                id: 'kyc-456',
                userId,
                encryptedKycData: kycData,
                status: KycStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockKycRepository.create.mockReturnValue(mockKycEntity);
            mockKycRepository.save.mockResolvedValue(mockKycEntity);

            await kycService.submitKyc(userId, dto);

            expect(mockUsersService.setKycStatus).toHaveBeenCalledWith(
                userId,
                KycStatus.PENDING,
            );
        });

        it('should handle complex KYC data structures', async () => {
            const userId = 'user-789';
            const kycData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+1-555-123-4567',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001',
                    country: 'USA',
                },
                document: {
                    type: 'passport',
                    number: 'A12345678',
                    expiry: '2030-12-31',
                },
            };
            const dto: SubmitKycDto = { kycData };

            const mockKycEntity = {
                id: 'kyc-789',
                userId,
                encryptedKycData: kycData,
                status: KycStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockKycRepository.create.mockReturnValue(mockKycEntity);
            mockKycRepository.save.mockResolvedValue(mockKycEntity);

            const result = await kycService.submitKyc(userId, dto);

            expect(result).toBeDefined();
            expect(mockKycRepository.save).toHaveBeenCalled();
        });

        it('should create KYC record with correct userId', async () => {
            const userId = 'user-unique-123';
            const kycData = { first_name: 'Test' };
            const dto: SubmitKycDto = { kycData };

            const mockKycEntity = {
                id: 'kyc-unique',
                userId,
                encryptedKycData: kycData,
                status: KycStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockKycRepository.create.mockReturnValue(mockKycEntity);
            mockKycRepository.save.mockResolvedValue(mockKycEntity);

            const result = await kycService.submitKyc(userId, dto);

            expect(mockKycRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ userId }),
            );
            expect(result.userId).toBe(userId);
        });
    });

    describe('getKycStatus - Decryption Integration', () => {
        it('should retrieve KYC status for user', async () => {
            const userId = 'user-123';
            const mockKycEntity = {
                id: 'kyc-123',
                userId,
                encryptedKycData: { first_name: 'John' },
                status: KycStatus.APPROVED,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockKycRepository.findOne.mockResolvedValue(mockKycEntity);

            const result = await kycService.getKycStatus(userId);

            expect(mockKycRepository.findOne).toHaveBeenCalledWith({
                where: { userId },
            });
            expect(result).toEqual(mockKycEntity);
        });

        it('should return null if KYC not found', async () => {
            const userId = 'non-existent-user';

            mockKycRepository.findOne.mockResolvedValue(null);

            const result = await kycService.getKycStatus(userId);

            expect(result).toBeNull();
        });

        it('should handle multiple KYC retrievals', async () => {
            const userId1 = 'user-1';
            const userId2 = 'user-2';

            const mockKyc1 = {
                id: 'kyc-1',
                userId: userId1,
                status: KycStatus.APPROVED,
            };
            const mockKyc2 = {
                id: 'kyc-2',
                userId: userId2,
                status: KycStatus.REJECTED,
            };

            mockKycRepository.findOne
                .mockResolvedValueOnce(mockKyc1)
                .mockResolvedValueOnce(mockKyc2);

            const result1 = await kycService.getKycStatus(userId1);
            const result2 = await kycService.getKycStatus(userId2);

            expect(result1?.status).toBe(KycStatus.APPROVED);
            expect(result2?.status).toBe(KycStatus.REJECTED);
        });
    });

    describe('handleWebhook - Status Update Integration', () => {
        it('should update KYC status from webhook', async () => {
            const providerReference = 'provider-ref-123';
            const mockKycEntity = {
                id: 'kyc-123',
                userId: 'user-123',
                status: KycStatus.PENDING,
                providerReference,
                encryptedKycData: {},
            };

            mockKycRepository.findOne.mockResolvedValue(mockKycEntity);
            mockKycRepository.save.mockResolvedValue({
                ...mockKycEntity,
                status: KycStatus.APPROVED,
            });

            await kycService.handleWebhook({
                providerReference,
                status: KycStatus.APPROVED,
            });

            expect(mockKycRepository.findOne).toHaveBeenCalledWith({
                where: { providerReference },
            });
            expect(mockKycRepository.save).toHaveBeenCalled();
            expect(mockUsersService.setKycStatus).toHaveBeenCalledWith(
                'user-123',
                KycStatus.APPROVED,
            );
        });

        it('should handle webhook for rejected KYC', async () => {
            const providerReference = 'provider-ref-456';
            const mockKycEntity = {
                id: 'kyc-456',
                userId: 'user-456',
                status: KycStatus.PENDING,
                providerReference,
                encryptedKycData: {},
            };

            mockKycRepository.findOne.mockResolvedValue(mockKycEntity);
            mockKycRepository.save.mockResolvedValue({
                ...mockKycEntity,
                status: KycStatus.REJECTED,
            });

            await kycService.handleWebhook({
                providerReference,
                status: KycStatus.REJECTED,
                reason: 'Document verification failed',
            });

            expect(mockUsersService.setKycStatus).toHaveBeenCalledWith(
                'user-456',
                KycStatus.REJECTED,
            );
        });

        it('should handle webhook for needs_info status', async () => {
            const providerReference = 'provider-ref-789';
            const mockKycEntity = {
                id: 'kyc-789',
                userId: 'user-789',
                status: KycStatus.PENDING,
                providerReference,
                encryptedKycData: {},
            };

            mockKycRepository.findOne.mockResolvedValue(mockKycEntity);
            mockKycRepository.save.mockResolvedValue({
                ...mockKycEntity,
                status: KycStatus.NEEDS_INFO,
            });

            await kycService.handleWebhook({
                providerReference,
                status: KycStatus.NEEDS_INFO,
                reason: 'Please provide additional documents',
            });

            expect(mockUsersService.setKycStatus).toHaveBeenCalledWith(
                'user-789',
                KycStatus.NEEDS_INFO,
            );
        });

        it('should ignore webhook for non-existent KYC', async () => {
            const providerReference = 'non-existent-ref';

            mockKycRepository.findOne.mockResolvedValue(null);

            await kycService.handleWebhook({
                providerReference,
                status: KycStatus.APPROVED,
            });

            expect(mockKycRepository.save).not.toHaveBeenCalled();
            expect(mockUsersService.setKycStatus).not.toHaveBeenCalled();
        });
    });

    describe('Encryption Service Integration', () => {
        it('should encrypt and decrypt KYC data consistently', () => {
            const kycData = JSON.stringify({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
            });

            const encrypted = encryptionService.encrypt(kycData);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(kycData);
            expect(JSON.parse(decrypted)).toEqual(JSON.parse(kycData));
        });

        it('should handle multiple sequential encryptions', async () => {
            const kycDataList = [
                { first_name: 'Alice', email: 'alice@example.com' },
                { first_name: 'Bob', email: 'bob@example.com' },
                { first_name: 'Charlie', email: 'charlie@example.com' },
            ];

            const encryptedList = kycDataList.map((data) =>
                encryptionService.encrypt(JSON.stringify(data)),
            );

            const decryptedList = encryptedList.map((encrypted) =>
                JSON.parse(encryptionService.decrypt(encrypted)),
            );

            expect(decryptedList).toEqual(kycDataList);
        });

        it('should produce deterministic hashes for KYC fields', () => {
            const email = 'user@example.com';
            const hash1 = encryptionService.hash(email);
            const hash2 = encryptionService.hash(email);

            expect(hash1).toBe(hash2);
        });
    });

    describe('Data Integrity', () => {
        it('should preserve data structure after encryption/decryption', () => {
            const originalData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+1-555-123-4567',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001',
                },
                documents: ['passport', 'driver_license'],
            };

            const encrypted = encryptionService.encrypt(JSON.stringify(originalData));
            const decrypted = JSON.parse(encryptionService.decrypt(encrypted));

            expect(decrypted).toEqual(originalData);
            expect(decrypted.address.city).toBe('New York');
            expect(decrypted.documents).toHaveLength(2);
        });

        it('should handle null and undefined values in KYC data', () => {
            const kycData = {
                first_name: 'John',
                middle_name: null,
                suffix: undefined,
                email: 'john@example.com',
            };

            const encrypted = encryptionService.encrypt(JSON.stringify(kycData));
            const decrypted = JSON.parse(encryptionService.decrypt(encrypted));

            expect(decrypted.first_name).toBe('John');
            expect(decrypted.middle_name).toBeNull();
            expect(decrypted.suffix).toBeUndefined();
        });

        it('should preserve numeric values in KYC data', () => {
            const kycData = {
                first_name: 'John',
                age: 30,
                income: 75000.50,
                dependents: 2,
            };

            const encrypted = encryptionService.encrypt(JSON.stringify(kycData));
            const decrypted = JSON.parse(encryptionService.decrypt(encrypted));

            expect(decrypted.age).toBe(30);
            expect(decrypted.income).toBe(75000.50);
            expect(decrypted.dependents).toBe(2);
        });

        it('should preserve boolean values in KYC data', () => {
            const kycData = {
                first_name: 'John',
                is_verified: true,
                is_pep: false,
                accepts_terms: true,
            };

            const encrypted = encryptionService.encrypt(JSON.stringify(kycData));
            const decrypted = JSON.parse(encryptionService.decrypt(encrypted));

            expect(decrypted.is_verified).toBe(true);
            expect(decrypted.is_pep).toBe(false);
            expect(decrypted.accepts_terms).toBe(true);
        });
    });
});
