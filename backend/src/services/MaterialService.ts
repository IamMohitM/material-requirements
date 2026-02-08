import { AppDataSource } from '@config/database';
import { Material } from '@entities/Material';
import { NotFoundError, ValidationError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { PaginatedResponse } from '../types/index';

export class MaterialService {
  /**
   * Get repositories with lazy initialization
   */
  private getMaterialRepository() {
    return AppDataSource.getRepository(Material);
  }


  

  /**
   * Create a new material
   */
  async createMaterial(
    name: string,
    category: string,
    unit_of_measure: string,
    description?: string
  ): Promise<Material> {
    if (!name || !unit_of_measure) {
      throw new ValidationError(
        'Material name and unit of measure are required'
      );
    }

    const material = this.getMaterialRepository().create({
      id: generateId(),
      name,
      category,
      unit_of_measure,
      description,
      is_active: true,
    });

    await this.getMaterialRepository().save(material);
    return material;
  }

  /**
   * Get material by ID
   */
  async getMaterialById(id: string): Promise<Material> {
    const material = await this.getMaterialRepository().findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundError('Material', id);
    }

    return material;
  }

  /**
   * Get material by name
   */
  async getMaterialByName(name: string): Promise<Material> {
    const material = await this.getMaterialRepository().findOne({
      where: { name },
    });

    if (!material) {
      throw new NotFoundError('Material', name);
    }

    return material;
  }

  /**
   * Get all materials with pagination and filtering
   */
  async getMaterials(options: {
    category?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Material>> {
    const { category, isActive = true, page = 1, pageSize = 20 } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.getMaterialRepository().createQueryBuilder('material');

    if (category) {
      query.andWhere('material.category = :category', { category });
    }

    query.andWhere('material.is_active = :isActive', { isActive });

    const [items, total] = await query
      .orderBy('material.name', 'ASC')
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
   * Update material
   */
  async updateMaterial(
    id: string,
    updates: {
      name?: string;
      category?: string;
      unit_of_measure?: string;
      description?: string;
      is_active?: boolean;
    }
  ): Promise<Material> {
    const material = await this.getMaterialById(id);

    if (updates.name) material.name = updates.name;
    if (updates.category) material.category = updates.category;
    if (updates.unit_of_measure) material.unit_of_measure = updates.unit_of_measure;
    if (updates.description) material.description = updates.description;
    if (updates.is_active !== undefined) material.is_active = updates.is_active;

    await this.getMaterialRepository().save(material);
    return material;
  }

  /**
   * Get materials by category
   */
  async getMaterialsByCategory(
    category: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Material>> {
    return this.getMaterials({ category, page, pageSize });
  }

  /**
   * Search materials by name or code
   */
  async searchMaterials(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Material>> {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const qb = this.getMaterialRepository()
      .createQueryBuilder('material')
      .where('material.name ILIKE :query OR material.material_code ILIKE :query', {
        query: `%${query}%`,
      })
      .andWhere('material.is_active = true');

    const [items, total] = await qb
      .orderBy('material.name', 'ASC')
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

export default new MaterialService();
