import { AppDataSource } from '@config/database';
import { Vendor } from '@entities/Vendor';
import { VendorRateHistory } from '@entities/VendorRateHistory';
import { NotFoundError, ValidationError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { PaginatedResponse, VerificationStatus } from '../types/index';

export class VendorService {
  /**
   * Get repositories with lazy initialization
   */
  private getVendorRepository() {
    return AppDataSource.getRepository(Vendor);
  }

  private getRateHistoryRepository() {
    return AppDataSource.getRepository(VendorRateHistory);
  }


  
  

  /**
   * Create a new vendor
   */
  async createVendor(
    name: string,
    contact_person?: string,
    email?: string,
    phone?: string,
    address?: string | Record<string, unknown>,
    is_active: boolean = true
  ): Promise<Vendor> {
    if (!name) {
      throw new ValidationError('Vendor name is required');
    }

    const addressStr = typeof address === 'string'
      ? address
      : (address ? JSON.stringify(address) : undefined);

    const vendor = this.getVendorRepository().create({
      id: generateId(),
      name,
      contact_person,
      email,
      phone,
      address: addressStr,
      rating: 0,
      is_active,
    });

    await this.getVendorRepository().save(vendor);
    return vendor;
  }

  /**
   * Get vendor by ID
   */
  async getVendorById(id: string): Promise<Vendor> {
    const vendor = await this.getVendorRepository().findOne({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundError('Vendor', id);
    }

    return vendor;
  }

  /**
   * Get all vendors with pagination
   */
  async getVendors(options: {
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Vendor>> {
    const { isActive = true, page = 1, pageSize = 20 } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getVendorRepository().createQueryBuilder('vendor');

    if (isActive !== undefined) {
      query.andWhere('vendor.is_active = :isActive', { isActive });
    }

    const [items, total] = await query
      .orderBy('vendor.name', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: calculateTotalPages(total, pageSize),
    };
  }

  /**
   * Update vendor
   */
  async updateVendor(
    id: string,
    updates: {
      name?: string;
      contact_person?: string;
      email?: string;
      phone?: string;
      address?: string | Record<string, unknown>;
      rating?: number;
      is_active?: boolean;
    }
  ): Promise<Vendor> {
    const vendor = await this.getVendorById(id);

    if (updates.name) vendor.name = updates.name;
    if (updates.contact_person) vendor.contact_person = updates.contact_person;
    if (updates.email) vendor.email = updates.email;
    if (updates.phone) vendor.phone = updates.phone;
    if (updates.address) {
      vendor.address = typeof updates.address === 'string'
        ? updates.address
        : JSON.stringify(updates.address);
    }
    if (updates.rating !== undefined) vendor.rating = updates.rating;
    if (updates.is_active !== undefined) vendor.is_active = updates.is_active;

    await this.getVendorRepository().save(vendor);
    return vendor;
  }

  /**
   * Record vendor rate for material
   */
  async recordRate(
    vendor_id: string,
    material_id: string,
    price_per_unit: number,
    notes?: string
  ): Promise<VendorRateHistory> {
    // Get previous rate
    const previousRate = await this.getRateHistoryRepository().findOne({
      where: { vendor_id, material_id },
      order: { effective_date: 'DESC' },
    });

    const change_from_previous = previousRate
      ? price_per_unit - previousRate.price_per_unit
      : undefined;

    const percent_change = previousRate
      ? (change_from_previous! / previousRate.price_per_unit) * 100
      : undefined;

    const rateRecord = this.getRateHistoryRepository().create({
      id: generateId(),
      vendor_id,
      material_id,
      price_per_unit,
      effective_date: new Date(),
      change_from_previous,
      percent_change,
      notes,
    });

    await this.getRateHistoryRepository().save(rateRecord);
    return rateRecord;
  }

  /**
   * Get vendor rate history for material
   */
  async getRateHistory(
    vendor_id: string,
    material_id: string,
    options?: { limit?: number }
  ): Promise<VendorRateHistory[]> {
    const limit = options?.limit || 10;

    return this.getRateHistoryRepository().find({
      where: { vendor_id, material_id },
      order: { effective_date: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get current rate for vendor-material
   */
  async getCurrentRate(
    vendor_id: string,
    material_id: string
  ): Promise<VendorRateHistory | null> {
    return this.getRateHistoryRepository().findOne({
      where: { vendor_id, material_id },
      order: { effective_date: 'DESC' },
    });
  }

  /**
   * Search vendors by name or code
   */
  async searchVendors(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Vendor>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const qb = this.getVendorRepository()
      .createQueryBuilder('vendor')
      .where('vendor.name ILIKE :query OR vendor.vendor_code ILIKE :query', {
        query: `%${query}%`,
      })
      .andWhere('vendor.is_active = true');

    const [items, total] = await qb
      .orderBy('vendor.name', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: calculateTotalPages(total, pageSize),
    };
  }
}

export default new VendorService();
