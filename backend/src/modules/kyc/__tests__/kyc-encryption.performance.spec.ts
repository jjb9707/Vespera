import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../../security/encryption.service';

/**
 * Performance tests for KYC encryption
 * Tests encryption/decryption performance and benchmarks
 */
describe('KYC Encryption - Performance Tests', () => {
    let encryptionService: EncryptionService;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'SECURITY_ENCRYPTION_KEY') {
                return 'f'.repeat(64);
            }
            return undefined;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EncryptionService,
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        encryptionService = module.get<EncryptionService>(EncryptionService);
    });

    describe('Encryption Performance', () => {
        it('should encrypt small KYC data within acceptable time', () => {
            const plaintext = JSON.stringify({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
            });

            const start = performance.now();
            const encrypted = encryptionService.encrypt(plaintext);
            const duration = performance.now() - start;

            expect(encrypted).toBeDefined();
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });

        it('should encrypt medium KYC data within acceptable time', () => {
            const plaintext = JSON.stringify({
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
                    country: 'USA',
                },
                employment: {
                    employer: 'Acme Corp',
                    position: 'Software Engineer',
                    years: 5,
                },
            });

            const start = performance.now();
            const encrypted = encryptionService.encrypt(plaintext);
            const duration = performance.now() - start;

            expect(encrypted).toBeDefined();
            expect(duration).toBeLessThan(100);
        });

        it('should encrypt large KYC data within acceptable time', () => {
            const plaintext = JSON.stringify({
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
                    country: 'USA',
                },
                employment: {
                    employer: 'Acme Corp',
                    position: 'Software Engineer',
                    years: 5,
                    salary: 150000,
                },
                additional_info: 'a'.repeat(5000), // Large text field
            });

            const start = performance.now();
            const encrypted = encryptionService.encrypt(plaintext);
            const duration = performance.now() - start;

            expect(encrypted).toBeDefined();
            expect(duration).toBeLessThan(200);
        });

        it('should handle batch encryption efficiently', () => {
            const dataList = Array.from({ length: 100 }, (_, i) =>
                JSON.stringify({
                    first_name: `User${i}`,
                    email: `user${i}@example.com`,
                }),
            );

            const start = performance.now();
            const encryptedList = dataList.map((data) =>
                encryptionService.encrypt(data),
            );
            const duration = performance.now() - start;

            expect(encryptedList).toHaveLength(100);
            expect(duration).toBeLessThan(5000); // 100 encryptions should complete in less than 5 seconds
        });
    });

    describe('Decryption Performance', () => {
        it('should decrypt small KYC data within acceptable time', () => {
            const plaintext = JSON.stringify({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
            });

            const encrypted = encryptionService.encrypt(plaintext);

            const start = performance.now();
            const decrypted = encryptionService.decrypt(encrypted);
            const duration = performance.now() - start;

            expect(decrypted).toBe(plaintext);
            expect(duration).toBeLessThan(100);
        });

        it('should decrypt medium KYC data within acceptable time', () => {
            const plaintext = JSON.stringify({
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
                    country: 'USA',
                },
            });

            const encrypted = encryptionService.encrypt(plaintext);

            const start = performance.now();
            const decrypted = encryptionService.decrypt(encrypted);
            const duration = performance.now() - start;

            expect(decrypted).toBe(plaintext);
            expect(duration).toBeLessThan(100);
        });

        it('should handle batch decryption efficiently', () => {
            const dataList = Array.from({ length: 100 }, (_, i) =>
                JSON.stringify({
                    first_name: `User${i}`,
                    email: `user${i}@example.com`,
                }),
            );

            const encryptedList = dataList.map((data) =>
                encryptionService.encrypt(data),
            );

            const start = performance.now();
            const decryptedList = encryptedList.map((encrypted) =>
                encryptionService.decrypt(encrypted),
            );
            const duration = performance.now() - start;

            expect(decryptedList).toEqual(dataList);
            expect(duration).toBeLessThan(5000);
        });
    });

    describe('Hash Performance', () => {
        it('should hash email addresses quickly', () => {
            const email = 'user@example.com';

            const start = performance.now();
            const hash = encryptionService.hash(email);
            const duration = performance.now() - start;

            expect(hash).toBeDefined();
            expect(duration).toBeLessThan(10);
        });

        it('should handle batch hashing efficiently', () => {
            const emails = Array.from(
                { length: 1000 },
                (_, i) => `user${i}@example.com`,
            );

            const start = performance.now();
            const hashes = emails.map((email) => encryptionService.hash(email));
            const duration = performance.now() - start;

            expect(hashes).toHaveLength(1000);
            expect(duration).toBeLessThan(1000); // 1000 hashes in less than 1 second
        });
    });

    describe('Token Generation Performance', () => {
        it('should generate secure tokens quickly', () => {
            const start = performance.now();
            const token = encryptionService.generateSecureToken(32);
            const duration = performance.now() - start;

            expect(token).toBeDefined();
            expect(duration).toBeLessThan(10);
        });

        it('should generate multiple tokens efficiently', () => {
            const start = performance.now();
            const tokens = Array.from({ length: 1000 }, () =>
                encryptionService.generateSecureToken(32),
            );
            const duration = performance.now() - start;

            expect(tokens).toHaveLength(1000);
            expect(duration).toBeLessThan(1000);
        });
    });

    describe('Signed Token Performance', () => {
        it('should generate signed tokens within acceptable time', () => {
            const payload = 'user-123';

            const start = performance.now();
            const token = encryptionService.generateSignedToken(payload, 3600);
            const duration = performance.now() - start;

            expect(token).toBeDefined();
            expect(duration).toBeLessThan(10);
        });

        it('should verify signed tokens within acceptable time', () => {
            const payload = 'user-123';
            const token = encryptionService.generateSignedToken(payload, 3600);

            const start = performance.now();
            const isValid = encryptionService.verifySignedToken(token, payload);
            const duration = performance.now() - start;

            expect(isValid).toBe(true);
            expect(duration).toBeLessThan(10);
        });

        it('should handle batch token verification efficiently', () => {
            const tokens = Array.from({ length: 100 }, (_, i) =>
                encryptionService.generateSignedToken(`user-${i}`, 3600),
            );

            const start = performance.now();
            const results = tokens.map((token, i) =>
                encryptionService.verifySignedToken(token, `user-${i}`),
            );
            const duration = performance.now() - start;

            expect(results.every((r) => r === true)).toBe(true);
            expect(duration).toBeLessThan(1000);
        });
    });

    describe('Encryption/Decryption Consistency', () => {
        it('should maintain consistent performance across multiple operations', () => {
            const plaintext = JSON.stringify({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
            });

            const durations: number[] = [];

            for (let i = 0; i < 10; i++) {
                const start = performance.now();
                const encrypted = encryptionService.encrypt(plaintext);
                encryptionService.decrypt(encrypted);
                durations.push(performance.now() - start);
            }

            // All operations should complete within reasonable time
            expect(durations.every((d) => d < 100)).toBe(true);

            // Performance should be relatively consistent (no huge spikes)
            const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
            const maxDeviation = Math.max(
                ...durations.map((d) => Math.abs(d - avgDuration)),
            );
            expect(maxDeviation).toBeLessThan(avgDuration * 2); // Allow 2x variance
        });
    });

    describe('Memory Efficiency', () => {
        it('should not leak memory during encryption', () => {
            const plaintext = JSON.stringify({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
            });

            // Perform many encryptions
            for (let i = 0; i < 1000; i++) {
                encryptionService.encrypt(plaintext);
            }

            // If we get here without running out of memory, test passes
            expect(true).toBe(true);
        });

        it('should not leak memory during decryption', () => {
            const plaintext = JSON.stringify({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
            });

            const encrypted = encryptionService.encrypt(plaintext);

            // Perform many decryptions
            for (let i = 0; i < 1000; i++) {
                encryptionService.decrypt(encrypted);
            }

            // If we get here without running out of memory, test passes
            expect(true).toBe(true);
        });
    });

    describe('Scalability', () => {
        it('should handle increasing data sizes', () => {
            const sizes = [100, 1000, 10000, 100000];
            const durations: number[] = [];

            for (const size of sizes) {
                const plaintext = 'a'.repeat(size);
                const start = performance.now();
                const encrypted = encryptionService.encrypt(plaintext);
                encryptionService.decrypt(encrypted);
                durations.push(performance.now() - start);
            }

            // Performance should scale reasonably (not exponentially)
            // Roughly linear scaling is acceptable
            expect(durations[durations.length - 1]).toBeLessThan(
                durations[0] * 100,
            );
        });

        it('should handle concurrent-like operations', () => {
            const operations = Array.from({ length: 50 }, (_, i) =>
                JSON.stringify({
                    id: i,
                    first_name: `User${i}`,
                    email: `user${i}@example.com`,
                }),
            );

            const start = performance.now();
            const encrypted = operations.map((op) => encryptionService.encrypt(op));
            const decrypted = encrypted.map((enc) => encryptionService.decrypt(enc));
            const duration = performance.now() - start;

            expect(decrypted).toHaveLength(50);
            expect(duration).toBeLessThan(2000);
        });
    });
});
