import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface PhotoData {
  url: string;
  caption?: string;
  order: number;
}

export interface PropertyData {
  // Step 1
  propertyType?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  
  // Step 2
  monthlyRent?: number;
  securityDeposit?: number;
  leaseTerm?: string;
  moveInDate?: Date | string;
  utilitiesIncluded?: string[];

  // Step 3
  amenities?: string[];

  // Step 4
  houseRules?: Record<string, boolean>;

  // Step 5
  photos?: PhotoData[];

  // Step 6
  propertyDescription?: string;
  neighborhoodDescription?: string;
  transportationInfo?: string;
  nearbyAmenities?: string;

  // Step 7
  availableFrom?: Date | string;
  blockedDates?: string[];
}

@Entity('property_listing_drafts')
@Index(['landlordId', 'expiresAt'])
export class PropertyListingDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'landlord_id', type: 'uuid' })
  landlordId: string;

  @Column({
    type: 'jsonb',
    default: {},
  })
  data: PropertyData;

  @Column({ name: 'current_step', type: 'int', default: 1 })
  currentStep: number;

  @Column({
    name: 'completed_steps',
    type: 'simple-array',
    array: true,
    default: [],
  })
  completedSteps: number[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}
