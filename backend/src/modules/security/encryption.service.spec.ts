import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('EncryptionService', () => {
  let service: EncryptionService;

  const mockConfigService = {
    get: jest
      .fn()
      .mockReturnValue(
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with valid encryption key', () => {
      expect(service).toBeDefined();
    });

    it('should throw error if encryption key is missing', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => {
        new EncryptionService(mockConfigService as any);
      }).toThrow('SECURITY_ENCRYPTION_KEY is required');
    });

    it('should throw error if encryption key is too short', () => {
      mockConfigService.get.mockReturnValue('short');

      expect(() => {
        new EncryptionService(mockConfigService as any);
      }).toThrow(
        'SECURITY_ENCRYPTION_KEY must be at least 64 hex characters (256-bit)',
      );
    });
  });

  describe('encrypt', () => {
    it('should encrypt plaintext successfully', () => {
      const plaintext = 'sensitive data';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(typeof encrypted).toBe('string');
    });

    it('should produce different ciphertext for same plaintext (random IV)', () => {
      const plaintext = 'test data';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty strings', () => {
      const encrypted = service.encrypt('');
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });

    it('should handle special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = '你好世界🔐🌍';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data correctly', () => {
      const plaintext = 'sensitive information';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty string decryption', () => {
      const encrypted = service.encrypt('');
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => service.decrypt('invalid-base64-data')).toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw error for corrupted ciphertext', () => {
      const encrypted = service.encrypt('test');
      const corrupted = encrypted.slice(0, -10) + 'corrupted==';

      expect(() => service.decrypt(corrupted)).toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle special characters correctly', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters correctly', () => {
      const plaintext = '你好世界🔐🌍';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('hash', () => {
    it('should generate deterministic hash', () => {
      const value = 'test@example.com';
      const hash1 = service.hash(value);
      const hash2 = service.hash(value);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(value);
    });

    it('should be case-insensitive', () => {
      const hash1 = service.hash('TEST@EXAMPLE.COM');
      const hash2 = service.hash('test@example.com');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different values', () => {
      const hash1 = service.hash('value1');
      const hash2 = service.hash('value2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = service.hash('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('generateSecureToken', () => {
    it('should generate random token', () => {
      const token = service.generateSecureToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should generate different tokens each time', () => {
      const token1 = service.generateSecureToken();
      const token2 = service.generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it('should respect custom byte length', () => {
      const token = service.generateSecureToken(16);

      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });
  });

  describe('generateSignedToken', () => {
    it('should generate signed token', () => {
      const payload = 'user-123';
      const token = service.generateSignedToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = service.generateSignedToken('payload1');
      const token2 = service.generateSignedToken('payload2');

      expect(token1).not.toBe(token2);
    });

    it('should respect expiration time', () => {
      const payload = 'test';
      const token = service.generateSignedToken(payload, 3600);

      expect(token).toBeDefined();
    });
  });

  describe('verifySignedToken', () => {
    it('should verify valid signed token', () => {
      const payload = 'user-456';
      const token = service.generateSignedToken(payload, 3600);
      const isValid = service.verifySignedToken(token, payload);

      expect(isValid).toBe(true);
    });

    it('should reject token with wrong payload', () => {
      const token = service.generateSignedToken('payload1', 3600);
      const isValid = service.verifySignedToken(token, 'payload2');

      expect(isValid).toBe(false);
    });

    it('should reject expired token', () => {
      const payload = 'test';
      const token = service.generateSignedToken(payload, -1); // Already expired
      const isValid = service.verifySignedToken(token, payload);

      expect(isValid).toBe(false);
    });

    it('should reject malformed token', () => {
      const isValid = service.verifySignedToken('invalid-token', 'payload');

      expect(isValid).toBe(false);
    });

    it('should reject tampered token', () => {
      const payload = 'test';
      const token = service.generateSignedToken(payload, 3600);
      const tampered = token.slice(0, -5) + 'xxxxx';
      const isValid = service.verifySignedToken(tampered, payload);

      expect(isValid).toBe(false);
    });
  });

  describe('KYC data encryption scenarios', () => {
    it('should encrypt and decrypt KYC sensitive fields', () => {
      const kycData = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        id_number: 'ID123456789',
        address: '123 Main Street',
        phone_number: '+1234567890',
      };

      const encryptedData: Record<string, string> = {};
      for (const [key, value] of Object.entries(kycData)) {
        encryptedData[key] = service.encrypt(value);
      }

      // Verify all fields are encrypted
      for (const [key, value] of Object.entries(encryptedData)) {
        expect(value).not.toBe(kycData[key as keyof typeof kycData]);
      }

      // Decrypt and verify
      const decryptedData: Record<string, string> = {};
      for (const [key, value] of Object.entries(encryptedData)) {
        decryptedData[key] = service.decrypt(value);
      }

      expect(decryptedData).toEqual(kycData);
    });

    it('should handle partial KYC data encryption', () => {
      const partialKycData = {
        first_name: 'Jane',
        email: 'jane@example.com', // Not typically encrypted
      };

      const encryptedFirstName = service.encrypt(partialKycData.first_name);
      const decryptedFirstName = service.decrypt(encryptedFirstName);

      expect(decryptedFirstName).toBe(partialKycData.first_name);
      expect(partialKycData.email).toBe('jane@example.com'); // Unchanged
    });

    it('should maintain data integrity across multiple encrypt/decrypt cycles', () => {
      const originalData = 'Sensitive KYC Information';

      // Encrypt and decrypt multiple times
      let data = originalData;
      for (let i = 0; i < 5; i++) {
        const encrypted = service.encrypt(data);
        data = service.decrypt(encrypted);
      }

      expect(data).toBe(originalData);
    });
  });

  describe('key rotation scenarios', () => {
    it('should fail to decrypt with different key', () => {
      const plaintext = 'test data';
      const encrypted = service.encrypt(plaintext);

      // Create new service with different key
      const differentKeyConfig = {
        get: jest
          .fn()
          .mockReturnValue(
            'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
          ),
      };
      const serviceWithDifferentKey = new EncryptionService(
        differentKeyConfig as any,
      );

      expect(() => serviceWithDifferentKey.decrypt(encrypted)).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('performance', () => {
    it('should encrypt large dataset efficiently', () => {
      const startTime = Date.now();
      const largeData = 'x'.repeat(100000); // 100KB

      service.encrypt(largeData);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should decrypt large dataset efficiently', () => {
      const largeData = 'x'.repeat(100000);
      const encrypted = service.encrypt(largeData);

      const startTime = Date.now();
      service.decrypt(encrypted);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });
  });
});
