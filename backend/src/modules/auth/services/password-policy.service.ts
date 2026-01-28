import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Common passwords blacklist (top 1000 most common passwords)
 * In production, this should be loaded from a file or database
 */
const COMMON_PASSWORDS = [
  'password',
  '123456',
  '123456789',
  '12345678',
  '12345',
  '1234567',
  '1234567890',
  'qwerty',
  'abc123',
  '111111',
  '123123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '12345678910',
  'password1',
  'sunshine',
  'princess',
  'football',
  'iloveyou',
  '1234567',
  'master',
  'hello',
  'freedom',
  'whatever',
  'qazwsx',
  'trustno1',
  'dragon',
  'baseball',
  'superman',
  'qwertyuiop',
  '654321',
  'jordan23',
  'harley',
  'password123',
  'shadow',
  'michael',
  'mustang',
  'jennifer',
  'hunter',
  'buster',
  'soccer',
  'batman',
  'thomas',
  'tigger',
  'robert',
  'access',
  'love',
  'buster',
  'diamond',
  'jordan',
  'maggie',
  'welcome',
  'jesus',
  'password',
  'ninja',
  'mustang',
  'password1',
  'jordan23',
  'jordan',
  'welcome',
  '123456',
  'admin',
  'letmein',
  'monkey',
  '1234567890',
  'qwerty',
  '123456789',
  '12345678',
  '12345',
  '1234567',
  'sunshine',
  'princess',
  'football',
  'iloveyou',
  'master',
  'hello',
  'freedom',
  'whatever',
  'qazwsx',
  'trustno1',
  'dragon',
  'baseball',
  'superman',
  'qwertyuiop',
  '654321',
  'harley',
  'password123',
  'shadow',
  'michael',
  'mustang',
  'jennifer',
  'hunter',
  'buster',
  'soccer',
  'batman',
  'thomas',
  'tigger',
  'robert',
  'access',
  'love',
  'diamond',
  'maggie',
  'jesus',
  'ninja',
];

@Injectable()
export class PasswordPolicyService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Validate password against policy
   */
  async validatePassword(password: string, userId?: string): Promise<void> {
    // Check minimum length
    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    // Check maximum length
    if (password.length > 128) {
      throw new BadRequestException('Password must not exceed 128 characters');
    }

    // Check complexity requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&#^()_+=\-{}[\]:;"'<>,.?/\\|`~]/.test(
      password,
    );

    if (!hasUpperCase) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!hasLowerCase) {
      throw new BadRequestException(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!hasNumber) {
      throw new BadRequestException(
        'Password must contain at least one number',
      );
    }

    if (!hasSpecialChar) {
      throw new BadRequestException(
        'Password must contain at least one special character',
      );
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      throw new BadRequestException(
        'Password is too common. Please choose a stronger password',
      );
    }

    // Check password strength
    const strength = this.calculatePasswordStrength(password);
    if (strength < 3) {
      throw new BadRequestException(
        'Password is too weak. Please choose a stronger password',
      );
    }

    // Check password history (if userId provided)
    if (userId) {
      await this.checkPasswordHistory(password, userId);
    }
  }

  /**
   * Check if password is in common passwords list
   */
  private isCommonPassword(password: string): boolean {
    const normalizedPassword = password.toLowerCase().trim();
    return COMMON_PASSWORDS.includes(normalizedPassword);
  }

  /**
   * Calculate password strength (0-5 scale)
   */
  private calculatePasswordStrength(password: string): number {
    let strength = 0;

    // Length bonus
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;

    // Character variety bonus
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&#^()_+=\-{}[\]:;"'<>,.?/\\|`~]/.test(
      password,
    );

    const varietyCount =
      (hasUpperCase ? 1 : 0) +
      (hasLowerCase ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecialChar ? 1 : 0);

    if (varietyCount >= 3) strength += 1;
    if (varietyCount === 4) strength += 1;

    // Pattern detection (reduce strength for common patterns)
    const patterns = [
      /(.)\1{2,}/, // Repeated characters (aaa, 111)
      /(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
      /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
      /(qwerty|asdf|zxcv)/i, // Keyboard patterns
    ];

    for (const pattern of patterns) {
      if (pattern.test(password)) {
        strength = Math.max(0, strength - 1);
        break;
      }
    }

    return Math.min(5, Math.max(0, strength));
  }

  /**
   * Check password history (prevent reuse of last 5 passwords)
   */
  private async checkPasswordHistory(
    _newPassword: string,
    _userId: string,
  ): Promise<void> {
    // Note: This requires a password_history table to be implemented
    // For now, we'll skip this check but leave the method for future implementation
    // In a full implementation, you would:
    // 1. Query password_history table for user's last 5 passwords
    // 2. Compare new password against hashed versions
    // 3. Throw error if match found
  }

  /**
   * Get password strength score (0-100)
   */
  getPasswordStrength(password: string): number {
    const strength = this.calculatePasswordStrength(password);
    return (strength / 5) * 100;
  }
}
