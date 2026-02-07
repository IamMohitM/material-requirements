import { v4 as uuidv4 } from 'uuid';

/**
 * Helper functions
 */

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a unique request number
 * Format: REQ-YYYYMMDD-XXXXX
 */
export function generateRequestNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `REQ-${dateStr}-${random}`;
}

/**
 * Generate a unique PO number
 * Format: PO-YYYYMMDD-XXXXX
 */
export function generatePONumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PO-${dateStr}-${random}`;
}

/**
 * Generate a unique quote number
 * Format: QUOTE-YYYYMMDD-XXXXX
 */
export function generateQuoteNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `QUOTE-${dateStr}-${random}`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate pagination offset and limit
 */
export function getPaginationParams(page: number = 1, pageSize: number = 20) {
  const offset = (page - 1) * pageSize;
  return { offset, limit: pageSize };
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two objects are equal
 */
export function isEqual(obj1: unknown, obj2: unknown): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Get differences between two objects
 */
export function getDifferences(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const differences: Record<string, { old: unknown; new: unknown }> = {};

  const allKeys = new Set([
    ...Object.keys(oldObj),
    ...Object.keys(newObj),
  ]);

  for (const key of allKeys) {
    if (!isEqual(oldObj[key], newObj[key])) {
      differences[key] = {
        old: oldObj[key],
        new: newObj[key],
      };
    }
  }

  return differences;
}

/**
 * Extract changed fields for audit log
 */
export function getChangeSummary(
  oldState: Record<string, unknown>,
  newState: Record<string, unknown>
): Record<string, unknown> {
  const differences = getDifferences(oldState, newState);
  return Object.fromEntries(
    Object.entries(differences).map(([key, { old: oldVal, new: newVal }]) => [
      key,
      { old: oldVal, new: newVal },
    ])
  );
}
