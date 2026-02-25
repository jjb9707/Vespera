import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';
import { BlockchainSyncService } from './blockchain-sync.service';
import { EscrowIntegrationService } from './escrow-integration.service';
import { RentAgreement } from '../rent/entities/rent-contract.entity';
import { Payment } from '../rent/entities/payment.entity';
import { StellarEscrow } from '../stellar/entities/stellar-escrow.entity';

import { AuditModule } from '../audit/audit.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentAgreement, Payment, StellarEscrow]),
    AuditModule,
    ReviewsModule,
    StellarModule,
  ],
  controllers: [AgreementsController],
  providers: [
    AgreementsService,
    BlockchainSyncService,
    EscrowIntegrationService,
  ],
  exports: [AgreementsService, BlockchainSyncService, EscrowIntegrationService],
})
export class AgreementsModule {}
