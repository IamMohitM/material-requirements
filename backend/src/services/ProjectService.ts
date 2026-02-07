import { AppDataSource } from '@config/database';
import { Project } from '@entities/Project';
import { NotFoundError, ValidationError, BadRequestError } from '@utils/errors';
import {
  generateId,
  getPaginationParams,
  calculateTotalPages,
} from '@utils/helpers';
import { ProjectStatus, PaginatedResponse } from '../types/index';

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);

  /**
   * Create a new project
   */
  async createProject(
    name: string,
    location: string,
    budget: number,
    company_id: string,
    created_by: string,
    start_date?: Date,
    end_date?: Date,
    description?: string
  ): Promise<Project> {
    if (!name || budget <= 0) {
      throw new ValidationError('Project name and budget are required');
    }

    const project = this.projectRepository.create({
      id: generateId(),
      name,
      location,
      budget,
      company_id,
      created_by,
      start_date: start_date || new Date(),
      end_date,
      status: ProjectStatus.PLANNING,
      description,
    });

    await this.projectRepository.save(project);
    return project;
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundError('Project', id);
    }

    return project;
  }

  /**
   * Get all projects with pagination
   */
  async getProjects(options: {
    status?: ProjectStatus;
    owner_id?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Project>> {
    const { status, owner_id, page = 1, pageSize = 20 } = options;
    const { offset, limit } = getPaginationParams(page, pageSize);

    const query = this.projectRepository.createQueryBuilder('project');

    if (status) {
      query.andWhere('project.status = :status', { status });
    }

    if (owner_id) {
      query.andWhere('project.owner_id = :owner_id', { owner_id });
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
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    updates: {
      name?: string;
      location?: string;
      budget?: number;
      status?: ProjectStatus;
      end_date?: Date;
    }
  ): Promise<Project> {
    const project = await this.getProjectById(id);

    if (updates.name) project.name = updates.name;
    if (updates.location) project.location = updates.location;
    if (updates.budget) project.budget = updates.budget;
    if (updates.status) project.status = updates.status;
    if (updates.end_date) project.end_date = updates.end_date;

    await this.projectRepository.save(project);
    return project;
  }

  /**
   * Delete project (soft delete - pause project)
   */
  async deleteProject(id: string): Promise<void> {
    const project = await this.getProjectById(id);
    project.status = ProjectStatus.PAUSED;
    await this.projectRepository.save(project);
  }
}

export default new ProjectService();
