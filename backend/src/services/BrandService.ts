import { AppDataSource } from '@config/database';
import { Brand } from '@entities/Brand';
import { NotFoundError, ValidationError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { PaginatedResponse } from '../types/index';

export class BrandService {
  /**
   * Get repositories with lazy initialization
   */
  private getBrandRepository() {
    return AppDataSource.getRepository(Brand);
  }


  

  /**
   * Create a new brand
   */
  async createBrand(
    material_id: string,
    vendor_id: string,
    brand_name: string,
    specifications?: Record<string, unknown>,
    cost_impact: number = 0
  ): Promise<Brand> {
    if (!material_id || !vendor_id || !brand_name) {
      throw new ValidationError(
        'Material ID, Vendor ID, and Brand name are required'
      );
    }

    const brand = this.getBrandRepository().create({
      id: generateId(),
      material_id,
      vendor_id,
      brand_name,
      specifications,
      cost_impact,
      is_active: true,
    });

    await this.getBrandRepository().save(brand);
    return brand;
  }

  /**
   * Get brand by ID
   */
  async getBrandById(id: string): Promise<Brand> {
    const brand = await this.getBrandRepository().findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundError('Brand', id);
    }

    return brand;
  }

  /**
   * Get brands for a material
   */
  async getBrandsForMaterial(
    material_id: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Brand>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getBrandRepository()
      .createQueryBuilder('brand')
      .where('brand.material_id = :material_id', { material_id })
      .andWhere('brand.is_active = true')
      .orderBy('brand.brand_name', 'ASC')
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
   * Get brands for a vendor
   */
  async getBrandsForVendor(
    vendor_id: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Brand>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const [items, total] = await this.getBrandRepository()
      .createQueryBuilder('brand')
      .where('brand.vendor_id = :vendor_id', { vendor_id })
      .andWhere('brand.is_active = true')
      .orderBy('brand.brand_name', 'ASC')
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
   * Get brands for material-vendor combination
   */
  async getBrandsForMaterialVendor(
    material_id: string,
    vendor_id: string
  ): Promise<Brand[]> {
    return this.getBrandRepository().find({
      where: {
        material_id,
        vendor_id,
        is_active: true,
      },
      order: { brand_name: 'ASC' },
    });
  }

  /**
   * Update brand
   */
  async updateBrand(
    id: string,
    updates: {
      brand_name?: string;
      specifications?: Record<string, unknown>;
      cost_impact?: number;
      is_active?: boolean;
    }
  ): Promise<Brand> {
    const brand = await this.getBrandById(id);

    if (updates.brand_name) brand.brand_name = updates.brand_name;
    if (updates.specifications) brand.specifications = updates.specifications;
    if (updates.cost_impact !== undefined) brand.cost_impact = updates.cost_impact;
    if (updates.is_active !== undefined) brand.is_active = updates.is_active;

    await this.getBrandRepository().save(brand);
    return brand;
  }

  /**
   * Get all brands with pagination
   */
  async getBrands(options: {
    is_active?: boolean;
    material_id?: string;
    vendor_id?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Brand>> {
    const {
      is_active = true,
      material_id,
      vendor_id,
      page = 1,
      pageSize = 20,
    } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getBrandRepository().createQueryBuilder('brand');

    if (is_active !== undefined) {
      query.andWhere('brand.is_active = :is_active', { is_active });
    }

    if (material_id) {
      query.andWhere('brand.material_id = :material_id', { material_id });
    }

    if (vendor_id) {
      query.andWhere('brand.vendor_id = :vendor_id', { vendor_id });
    }

    const [items, total] = await query
      .orderBy('brand.brand_name', 'ASC')
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
   * Deactivate brand
   */
  async deactivateBrand(id: string): Promise<Brand> {
    return this.updateBrand(id, { is_active: false });
  }
}

export default new BrandService();
