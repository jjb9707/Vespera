import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Property, ListingStatus } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyAmenity } from './entities/property-amenity.entity';
import { RentalUnit } from './entities/rental-unit.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { PropertyQueryBuilder } from './property-query-builder';
import { CacheService } from '../../common/cache/cache.service';
import {
  CACHE_PREFIX_PROPERTIES_LIST,
  TTL_PUBLIC_PROPERTY_LIST_MS,
} from '../../common/cache/cache.constants';

@Injectable()
export class PropertiesService {
  findById(_propertyId: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyImage)
    private readonly imageRepository: Repository<PropertyImage>,
    @InjectRepository(PropertyAmenity)
    private readonly amenityRepository: Repository<PropertyAmenity>,
    @InjectRepository(RentalUnit)
    private readonly rentalUnitRepository: Repository<RentalUnit>,
    private readonly cacheService: CacheService,
  ) {}

  private generateCacheKey(query: QueryPropertyDto): string {
    const queryStr = JSON.stringify(query);
    const hash = crypto.createHash('md5').update(queryStr).digest('hex');
    return `${CACHE_PREFIX_PROPERTIES_LIST}:${hash}`;
  }

  async create(
    createPropertyDto: CreatePropertyDto,
    ownerId: string,
  ): Promise<Property> {
    const { images, amenities, rentalUnits, ...propertyData } =
      createPropertyDto;

    const property = this.propertyRepository.create({
      ...propertyData,
      ownerId,
      status: ListingStatus.DRAFT,
    });

    const savedProperty = await this.propertyRepository.save(property);

    if (images && images.length > 0) {
      const propertyImages = images.map((img) =>
        this.imageRepository.create({
          ...img,
          propertyId: savedProperty.id,
        }),
      );
      await this.imageRepository.save(propertyImages);
    }

    if (amenities && amenities.length > 0) {
      const propertyAmenities = amenities.map((amenity) =>
        this.amenityRepository.create({
          ...amenity,
          propertyId: savedProperty.id,
        }),
      );
      await this.amenityRepository.save(propertyAmenities);
    }

    if (rentalUnits && rentalUnits.length > 0) {
      const propertyUnits = rentalUnits.map((unit) =>
        this.rentalUnitRepository.create({
          ...unit,
          propertyId: savedProperty.id,
        }),
      );
      await this.rentalUnitRepository.save(propertyUnits);
    }

    await this.cacheService.invalidatePropertyDomainCaches(savedProperty.id);
    return this.findOne(savedProperty.id);
  }

  async findAll(query: QueryPropertyDto): Promise<{
    data: Property[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const isPublicListing =
      query.status === ListingStatus.PUBLISHED && !query.ownerId;

    if (isPublicListing) {
      const cacheKey = this.generateCacheKey(query);
      return this.cacheService.getOrSet(
        cacheKey,
        () => this.fetchListingsPage(query),
        TTL_PUBLIC_PROPERTY_LIST_MS,
      );
    }

    return this.fetchListingsPage(query);
  }

  private async fetchListingsPage(query: QueryPropertyDto): Promise<{
    data: Property[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;

    const baseQuery = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.images', 'images')
      .leftJoinAndSelect('property.amenities', 'amenities')
      .leftJoinAndSelect('property.owner', 'owner');

    const propertyQueryBuilder = new PropertyQueryBuilder(baseQuery);

    const [data, total] = await propertyQueryBuilder
      .applyFilters(filters)
      .applySorting(sortBy, sortOrder)
      .applyPagination(page, limit)
      .execute();

    return {
      data,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['images', 'amenities', 'rentalUnits', 'owner'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async findOnePublic(id: string): Promise<Property> {
    const property = await this.findOne(id);

    if (property.status !== ListingStatus.PUBLISHED) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    user: User,
  ): Promise<Property> {
    const property = await this.findOne(id);
    this.verifyOwnership(property, user);

    const { images, amenities, rentalUnits, ...propertyData } =
      updatePropertyDto;

    Object.assign(property, propertyData);
    await this.propertyRepository.save(property);

    if (images !== undefined) {
      await this.imageRepository.delete({ propertyId: id });
      if (images.length > 0) {
        const propertyImages = images.map((img) =>
          this.imageRepository.create({
            ...img,
            propertyId: id,
          }),
        );
        await this.imageRepository.save(propertyImages);
      }
    }

    if (amenities !== undefined) {
      await this.amenityRepository.delete({ propertyId: id });
      if (amenities.length > 0) {
        const propertyAmenities = amenities.map((amenity) =>
          this.amenityRepository.create({
            ...amenity,
            propertyId: id,
          }),
        );
        await this.amenityRepository.save(propertyAmenities);
      }
    }

    if (rentalUnits !== undefined) {
      await this.rentalUnitRepository.delete({ propertyId: id });
      if (rentalUnits.length > 0) {
        const propertyUnits = rentalUnits.map((unit) =>
          this.rentalUnitRepository.create({
            ...unit,
            propertyId: id,
          }),
        );
        await this.rentalUnitRepository.save(propertyUnits);
      }
    }

    await this.cacheService.invalidatePropertyDomainCaches(id);
    return this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const property = await this.findOne(id);
    this.verifyOwnership(property, user);
    await this.propertyRepository.remove(property);
    await this.cacheService.invalidatePropertyDomainCaches(id);
  }

  async publish(id: string, user: User): Promise<Property> {
    const property = await this.findOne(id);
    this.verifyOwnership(property, user);

    if (property.status === ListingStatus.PUBLISHED) {
      throw new BadRequestException('Property is already published');
    }

    if (property.status === ListingStatus.ARCHIVED) {
      throw new BadRequestException(
        'Cannot publish an archived property. Please create a new listing.',
      );
    }

    if (
      !property.title ||
      property.price === null ||
      property.price === undefined
    ) {
      throw new BadRequestException(
        'Property must have at least a title and price to be published',
      );
    }

    property.status = ListingStatus.PUBLISHED;
    const saved = await this.propertyRepository.save(property);
    await this.cacheService.invalidatePropertyDomainCaches(id);
    return saved;
  }

  async archive(id: string, user: User): Promise<Property> {
    const property = await this.findOne(id);
    this.verifyOwnership(property, user);
    property.status = ListingStatus.ARCHIVED;
    const saved = await this.propertyRepository.save(property);
    await this.cacheService.invalidatePropertyDomainCaches(id);
    return saved;
  }

  async markAsRented(id: string, user: User): Promise<Property> {
    const property = await this.findOne(id);
    this.verifyOwnership(property, user);
    property.status = ListingStatus.RENTED;
    const saved = await this.propertyRepository.save(property);
    await this.cacheService.invalidatePropertyDomainCaches(id);
    return saved;
  }

  private verifyOwnership(property: Property, user: User): void {
    if (property.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to modify this property',
      );
    }
  }
}
