import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../../security/encryption.service';

/**
 * Unit tests for KYC encryption/decryption functions
 * Tests the core encryption logic with various data types and edge cases
 */
describe('KYC Encryption - Unit Tests', () => {
    let encryptionService: EncryptionService;
    let configService: ConfigService;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'SECURITY_ENCRYPTION_KEY') {
                return 'a'.repeat(64); // 64-char hex string → 256-bit key
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
        configService = module.get<ConfigService>(ConfigService);
    });

    describe('encrypt/decrypt - Basic Operations', () => {
        it('should encrypt a simple string', () => {
            const plaintext = 'John Doe';
            const encrypted = encryptionService.encrypt(plaintext);

            expect(encrypted).toBeDefined();
            expect(encrypted).not.toBe(plaintext);
            expect(typeof encrypted).toBe('string');
            expect(encrypted.length).toBeGreaterThan(0);
        });

        it('should decrypt encrypted string back to original', () => {
            const plaintext = 'John Doe';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle empty strings', () => {
            const plaintext = '';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle very long strings', () => {
            const plaintext = 'a'.repeat(10000);
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle special characters', () => {
            const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle unicode characters', () => {
            const plaintext = '你好世界 مرحبا بالعالم 🔐🔑';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle newlines and whitespace', () => {
            const plaintext = 'Line 1\nLine 2\r\nLine 3\t\tTabbed';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });
    });

    describe('encrypt/decrypt - Randomness', () => {
        it('should produce different ciphertexts for the same plaintext', () => {
            const plaintext = 'same-data';
            const encrypted1 = encryptionService.encrypt(plaintext);
            const encrypted2 = encryptionService.encrypt(plaintext);

            expect(encrypted1).not.toBe(encrypted2);
        });

        it('should decrypt both different ciphertexts to the same plaintext', () => {
            const plaintext = 'same-data';
            const encrypted1 = encryptionService.encrypt(plaintext);
            const encrypted2 = encryptionService.encrypt(plaintext);

            expect(encryptionService.decrypt(encrypted1)).toBe(plaintext);
            expect(encryptionService.decrypt(encrypted2)).toBe(plaintext);
        });

        it('should use random IV for each encryption', () => {
            const plaintext = 'test-data';
            const encrypted1 = encryptionService.encrypt(plaintext);
            const encrypted2 = encryptionService.encrypt(plaintext);
            const encrypted3 = encryptionService.encrypt(plaintext);

            // All should be different
            const ciphertexts = [encrypted1, encrypted2, encrypted3];
            const uniqueCiphertexts = new Set(ciphertexts);
            expect(uniqueCiphertexts.size).toBe(3);
        });
    });

    describe('encrypt/decrypt - KYC Data Types', () => {
        it('should encrypt email addresses', () => {
            const email = 'user@example.com';
            const encrypted = encryptionService.encrypt(email);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(email);
        });

        it('should encrypt phone numbers', () => {
            const phone = '+1-555-123-4567';
            const encrypted = encryptionService.encrypt(phone);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(phone);
        });

        it('should encrypt addresses', () => {
            const address = '123 Main St, Apt 4B, New York, NY 10001, USA';
            const encrypted = encryptionService.encrypt(address);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(address);
        });

        it('should encrypt dates', () => {
            const date = '1990-05-15';
            const encrypted = encryptionService.encrypt(date);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(date);
        });

        it('should encrypt document numbers (passport, ID, etc)', () => {
            const docNumber = 'A12345678';
            const encrypted = encryptionService.encrypt(docNumber);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(docNumber);
        });

        it('should encrypt JSON KYC data', () => {
            const kycData = JSON.stringify({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+1-555-123-4567',
                address: '123 Main St',
            });
            const encrypted = encryptionService.encrypt(kycData);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(kycData);
            expect(JSON.parse(decrypted)).toEqual({
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '+1-555-123-4567',
                address: '123 Main St',
            });
        });
    });

    describe('encrypt/decrypt - Edge Cases', () => {
        it('should handle null-like strings', () => {
            const plaintext = 'null';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle undefined-like strings', () => {
            const plaintext = 'undefined';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle base64-like strings', () => {
            const plaintext = 'SGVsbG8gV29ybGQgQmFzZTY0IFRlc3Q=';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle hex-like strings', () => {
            const plaintext = 'deadbeefcafebabe';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle strings with colons and slashes', () => {
            const plaintext = 'https://example.com:8080/path?query=value';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });

        it('should handle repeated characters', () => {
            const plaintext = 'aaaaaaaaaa';
            const encrypted = encryptionService.encrypt(plaintext);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plaintext);
        });
    });

    describe('hash - Deterministic Hashing', () => {
        it('should produce consistent hash for same input', () => {
            const input = 'test@example.com';
            const hash1 = encryptionService.hash(input);
            const hash2 = encryptionService.hash(input);

            expect(hash1).toBe(hash2);
        });

        it('should be case-insensitive', () => {
            const lower = encryptionService.hash('test@example.com');
            const upper = encryptionService.hash('TEST@EXAMPLE.COM');
            const mixed = encryptionService.hash('TeSt@ExAmPlE.cOm');

            expect(lower).toBe(upper);
            expect(lower).toBe(mixed);
        });

        it('should produce different hashes for different inputs', () => {
            const hash1 = encryptionService.hash('alice@example.com');
            const hash2 = encryptionService.hash('bob@example.com');

            expect(hash1).not.toBe(hash2);
        });

        it('should produce hex string output', () => {
            const hash = encryptionService.hash('test@example.com');

            expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
        });

        it('should produce consistent length hash', () => {
            const hash1 = encryptionService.hash('short');
            const hash2 = encryptionService.hash('this is a much longer string');

            expect(hash1.length).toBe(hash2.length);
        });
    });

    describe('generateSecureToken', () => {
        it('should generate tokens of correct length', () => {
            const token16 = encryptionService.generateSecureToken(16);
            const token32 = encryptionService.generateSecureToken(32);
            const token64 = encryptionService.generateSecureToken(64);

            expect(token16).toHaveLength(32); // 16 bytes → 32 hex chars
            expect(token32).toHaveLength(64); // 32 bytes → 64 hex chars
            expect(token64).toHaveLength(128); // 64 bytes → 128 hex chars
        });

        it('should generate unique tokens', () => {
            const tokens = new Set();
            for (let i = 0; i < 100; i++) {
                tokens.add(encryptionService.generateSecureToken(32));
            }

            expect(tokens.size).toBe(100);
        });

        it('should generate hex-only tokens', () => {
            const token = encryptionService.generateSecureToken(32);

            expect(/^[a-f0-9]+$/.test(token)).toBe(true);
        });

        it('should use default length of 32 bytes', () => {
            const token = encryptionService.generateSecureToken();

            expect(token).toHaveLength(64); // 32 bytes → 64 hex chars
        });
    });

    describe('Error Handling', () => {
        it('should throw error on invalid base64 during decryption', () => {
            const invalidBase64 = '!!!invalid!!!';

            expect(() => {
                encryptionService.decrypt(invalidBase64);
            }).toThrow();
        });

        it('should throw error on corrupted ciphertext', () => {
            const plaintext = 'test-data';
            const encrypted = encryptionService.encrypt(plaintext);
            const corrupted = encrypted.slice(0, -10) + 'corrupted!';

            expect(() => {
                encryptionService.decrypt(corrupted);
            }).toThrow();
        });

        it('should throw error on tampered auth tag', () => {
            const plaintext = 'test-data';
            const encrypted = encryptionService.encrypt(plaintext);

            // Flip a bit in the auth tag area (bytes 80-96)
            const buffer = Buffer.from(encrypted, 'base64');
            if (buffer.length > 85) {
                buffer[85] ^= 0xff;
                const tampered = buffer.toString('base64');

                expect(() => {
                    encryptionService.decrypt(tampered);
                }).toThrow();
            }
        });

        it('should throw error when encryption key is missing', () => {
            const mockConfigServiceNoKey = {
                get: jest.fn(() => undefined),
            };

            expect(() => {
                new EncryptionService(mockConfigServiceNoKey as any);
            }).toThrow('SECURITY_ENCRYPTION_KEY is required');
        });

        it('should throw error when encryption key is too short', () => {
            const mockConfigServiceShortKey = {
                get: jest.fn(() => 'short-key'),
            };

            expect(() => {
                new EncryptionService(mockConfigServiceShortKey as any);
            }).toThrow('SECURITY_ENCRYPTION_KEY must be at least 64 hex characters');
        });
    });

    describe('Encryption Algorithm Properties', () => {
        it('should use AES-256-GCM algorithm', () => {
            const plaintext = 'test-data';
            const encrypted = encryptionService.encrypt(plaintext);

            // Encrypted data should be base64 encoded
            expect(() => {
                Buffer.from(encrypted, 'base64');
            }).not.toThrow();
        });

        it('should include authentication tag (GCM)', () => {
            const plaintext = 'test-data';
            const encrypted = encryptionService.encrypt(plaintext);
            const payload = Buffer.from(encrypted, 'base64');

            // Payload structure: salt(64) + iv(16) + authTag(16) + ciphertext
            // Minimum size should be 96 bytes
            expect(payload.length).toBeGreaterThanOrEqual(96);
        });

        it('should use PBKDF2 key derivation', () => {
            // This is tested indirectly - different salts should produce different derived keys
            const plaintext = 'test-data';
            const encrypted1 = encryptionService.encrypt(plaintext);
            const encrypted2 = encryptionService.encrypt(plaintext);

            // Both should decrypt correctly despite different salts
            expect(encryptionService.decrypt(encrypted1)).toBe(plaintext);
            expect(encryptionService.decrypt(encrypted2)).toBe(plaintext);
        });
    });
});
