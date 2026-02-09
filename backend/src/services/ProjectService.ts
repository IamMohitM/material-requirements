import { AppDataSource, withDatabaseConnection } from '@config/database';
import { Project } from '@entities/Project';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { ProjectStatus, PaginatedResponse } from '../types/index';

export class ProjectService {
  /**
   * Get repositories with lazy initialization
   */
  private getProjectRepository() {
    return AppDataSource.getRepository(Project);
  }


  

  /**
   * Create a new project
   */
  async createProject(
    name: string,
    budget: number,
    created_by_id: string,
    start_date?: Date,
    end_date?: Date,
    description?: string,
    status?: ProjectStatus
  ): Promise<Project> {
    return withDatabaseConnection(async () => {
      if (!name || budget <= 0) {
        throw new ValidationError('Project name and budget are required');
      }

      const project = this.getProjectRepository().create({
        name,
        budget,
        created_by_id,
        start_date: start_date || new Date(),
        end_date,
        status: status || ProjectStatus.PLANNING,
        description,
        is_active: true,
      });

      await this.getProjectRepository().save(project);
      return project;
    });
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project> {
    return withDatabaseConnection(async () => {
      const project = await this.getProjectRepository().findOne({
        where: { id },
      });

      if (!project) {
        throw new NotFoundError('Project', id);
      }

      return project;
    });
  }

  /**
   * Get all projects with pagination
   */
  async getProjects(options: {
    status?: ProjectStatus;
    created_by_id?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Project>> {
    return withDatabaseConnection(async () => {
      const { status, created_by_id, page = 1, pageSize = 20 } = options;
      const { offset, limit } = getPaginationParams(page, pageSize);

      const query = this.getProjectRepository()
        .createQueryBuilder('project')
        .where('project.is_active = :isActive', { isActive: true });

      if (status) {
        query.andWhere('project.status = :status', { status });
      }

      if (created_by_id) {
        query.andWhere('project.created_by_id = :created_by_id', { created_by_id });
      }

      const [items, total] = await query
        .orderBy('project.created_at', 'DESC')
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
    });
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    updates: {
      name?: string;
      budget?: number;
      status?: ProjectStatus;
      end_date?: Date;
      description?: string;
    }
  ): Promise<Project> {
    return withDatabaseConnection(async () => {
      const project = await this.getProjectById(id);

      if (updates.name) project.name = updates.name;
      if (updates.budget) project.budget = updates.budget;
      if (updates.status) project.status = updates.status;
      if (updates.end_date) project.end_date = updates.end_date;
      if (updates.description !== undefined) project.description = updates.description;

      await this.getProjectRepository().save(project);
      return project;
    });
  }

  /**
   * Delete project (soft delete - pause project)
   */
  async deleteProject(id: string): Promise<void> {
    return withDatabaseConnection(async () => {
      const project = await this.getProjectById(id);
      project.status = ProjectStatus.PAUSED;
      await this.getProjectRepository().save(project);
    });
  }
}

export default new ProjectService();
