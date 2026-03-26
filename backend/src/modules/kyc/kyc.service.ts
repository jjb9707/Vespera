import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kyc, KycStatus } from './kyc.entity';
import { SubmitKycDto, KycWebhookDto } from './kyc.dto';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../security/encryption.service';
import {
  decryptSensitiveKycFields,
  encryptSensitiveKycFields,
} from './kyc-encryption.util';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(Kyc)
    private readonly kycRepository: Repository<Kyc>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async submitKyc(userId: string, dto: SubmitKycDto): Promise<Kyc> {
    try {
      this.logger.log(`Submitting KYC for user ${userId}`);

      // Encrypt KYC data before saving
      const encryptedKycData = encryptSensitiveKycFields(
        dto.kycData,
        this.encryptionService,
      );

      const kyc = this.kycRepository.create({
        userId,
        encryptedKycData,
        status: KycStatus.PENDING,
      });

      await this.usersService.setKycStatus(userId, KycStatus.PENDING);
      const savedKyc = await this.kycRepository.save(kyc);

      this.logger.log(`KYC submitted successfully for user ${userId}`);
      return savedKyc;
    } catch (error) {
      this.logger.error(`Failed to submit KYC for user ${userId}`, error);
      throw error;
    }
  }

  async getKycStatus(userId: string): Promise<Kyc | null> {
    try {
      const kyc = await this.kycRepository.findOne({ where: { userId } });

      if (kyc && kyc.encryptedKycData) {
        // Decrypt KYC data for retrieval
        kyc.encryptedKycData = decryptSensitiveKycFields(
          kyc.encryptedKycData,
          this.encryptionService,
        );
      }

      return kyc;
    } catch (error) {
      this.logger.error(`Failed to get KYC status for user ${userId}`, error);
      throw error;
    }
  }

  async handleWebhook(dto: KycWebhookDto): Promise<void> {
    const kyc = await this.kycRepository.findOne({
      where: { providerReference: dto.providerReference },
    });
    if (!kyc) return;
    kyc.status = dto.status;
    await this.kycRepository.save(kyc);
    await this.usersService.setKycStatus(kyc.userId, dto.status);
  }
}
