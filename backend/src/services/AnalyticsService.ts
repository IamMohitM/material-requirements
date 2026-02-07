import { AppDataSource } from '@config/database';
import { PurchaseOrder } from '@entities/PurchaseOrder';
import { MaterialConsumption } from '@entities/MaterialConsumption';
import { VendorRateHistory } from '@entities/VendorRateHistory';
import { NotFoundError } from '@utils/errors';

export interface ProjectDashboard {
  project_id: string;
  total_budget: number;
  spent_amount: number;
  remaining_budget: number;
  utilization_percent: number;
  po_count: number;
  vendor_count: number;
}

export interface MaterialCost {
  material_id: string;
  material_name: string;
  total_quantity: number;
  total_cost: number;
  average_unit_cost: number;
}

export interface VendorPerformance {
  vendor_id: string;
  vendor_name: string;
  po_count: number;
  total_spend: number;
  average_po_amount: number;
  on_time_delivery_percent: number;
  quality_rating: number;
}

export class AnalyticsService {
  private poRepository = AppDataSource.getRepository(PurchaseOrder);
  private consumptionRepository = AppDataSource.getRepository(MaterialConsumption);
  private rateHistoryRepository = AppDataSource.getRepository(VendorRateHistory);

  /**
   * Get project dashboard metrics
   */
  async getProjectDashboard(project_id: string): Promise<ProjectDashboard> {
    // TODO: Get actual project data from ProjectService
    // For now, return stub

    const pos = await this.poRepository.find({
      where: { project_id },
    });

    const total_spend = pos.reduce((sum, po) => sum + po.total_amount, 0);

    return {
      project_id,
      total_budget: 0,
      spent_amount: total_spend,
      remaining_budget: 0,
      utilization_percent: 0,
      po_count: pos.length,
      vendor_count: 0, // TODO: Get unique vendor count
    };
  }

  /**
   * Get material costs for project
   */
  async getProjectMaterialCosts(
    project_id: string
  ): Promise<MaterialCost[]> {
    // TODO: Aggregate PO line items by material
    // Group by material_id, sum quantities and costs
    // Calculate average unit cost

    return [];
  }

  /**
   * Get material consumption for project
   */
  async getProjectMaterialConsumption(
    project_id: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MaterialCost[]> {
    // TODO: Get MaterialConsumption records
    // Group by material_id
    // Sum consumed quantities
    // Calculate costs from purchase history

    return [];
  }

  /**
   * Get vendor performance metrics
   */
  async getVendorPerformance(
    vendor_id: string
  ): Promise<VendorPerformance> {
    // TODO: Get vendor performance data
    // - Count of POs
    // - Total spend
    // - On-time delivery percentage
    // - Quality rating from deliveries

    return {
      vendor_id,
      vendor_name: '',
      po_count: 0,
      total_spend: 0,
      average_po_amount: 0,
      on_time_delivery_percent: 0,
      quality_rating: 0,
    };
  }

  /**
   * Get cross-project spending summary
   */
  async getCrossProjectSpending(): Promise<{
    total_spend: number;
    projects_count: number;
    average_project_spend: number;
    po_count: number;
  }> {
    // TODO: Get all POs across all projects
    // Sum totals, count projects, etc.

    return {
      total_spend: 0,
      projects_count: 0,
      average_project_spend: 0,
      po_count: 0,
    };
  }

  /**
   * Get spending trends over time
   */
  async getSpendingTrends(
    project_id: string,
    period: 'weekly' | 'monthly' | 'quarterly' = 'monthly'
  ): Promise<Array<{ period: string; amount: number }>> {
    // TODO: Group POs by time period
    // Calculate spending for each period
    // Return trend data

    return [];
  }

  /**
   * Get vendor comparison across projects
   */
  async getVendorComparison(): Promise<VendorPerformance[]> {
    // TODO: Get all vendors
    // Calculate performance metrics for each
    // Return sorted by total spend or rating

    return [];
  }

  /**
   * Get cost reduction opportunities
   */
  async getCostReductionOpportunities(): Promise<Array<{
    description: string;
    material_id?: string;
    vendor_id?: string;
    potential_savings: number;
    recommendation: string;
  }>> {
    // TODO: Analyze vendor rates
    // Find materials with high price variance
    // Find cheaper alternatives
    // Suggest volume discounts

    return [];
  }

  /**
   * Get approval efficiency metrics
   */
  async getApprovalMetrics(): Promise<{
    average_approval_time_hours: number;
    pending_approvals_count: number;
    pending_approvals_value: number;
    slow_approvers: Array<{ user_id: string; average_time_hours: number }>;
  }> {
    // TODO: Query audit logs
    // Track time between submission and approval
    // Identify slow approvers

    return {
      average_approval_time_hours: 0,
      pending_approvals_count: 0,
      pending_approvals_value: 0,
      slow_approvers: [],
    };
  }

  /**
   * Get rate history analysis for vendor-material
   */
  async getRateHistoryAnalysis(
    vendor_id: string,
    material_id: string
  ): Promise<{
    average_price: number;
    min_price: number;
    max_price: number;
    latest_price: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    const rateHistory = await this.rateHistoryRepository.find({
      where: { vendor_id, material_id },
      order: { effective_date: 'ASC' },
    });

    if (rateHistory.length === 0) {
      throw new NotFoundError('Rate history', `${vendor_id}-${material_id}`);
    }

    const prices = rateHistory.map((r) => r.price_per_unit);
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min_price = Math.min(...prices);
    const max_price = Math.max(...prices);
    const latest_price = rateHistory[rateHistory.length - 1].price_per_unit;

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (rateHistory.length >= 2) {
      const first = rateHistory[0].price_per_unit;
      const last = rateHistory[rateHistory.length - 1].price_per_unit;

      if (last > first * 1.05) trend = 'increasing';
      else if (last < first * 0.95) trend = 'decreasing';
    }

    return {
      average_price: average,
      min_price,
      max_price,
      latest_price,
      trend,
    };
  }
}

export default new AnalyticsService();
