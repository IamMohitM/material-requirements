/**
 * Navigation Menu Configuration
 * Centralized navigation structure organized by workflow sections
 */

import { NavigationSection } from '../types/navigation';

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: 'PROCUREMENT',
    collapsible: false,
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        section: 'procurement',
      },
      {
        label: 'Requests',
        path: '/requests',
        icon: 'ClipboardList',
        section: 'procurement',
      },
      {
        label: 'Quotes',
        path: '/quotes',
        icon: 'DollarSign',
        section: 'procurement',
      },
      {
        label: 'Purchase Orders',
        path: '/pos',
        icon: 'FileText',
        section: 'procurement',
      },
    ],
  },
  {
    title: 'FULFILLMENT',
    collapsible: false,
    items: [
      {
        label: 'Deliveries',
        path: '/deliveries',
        icon: 'Truck',
        section: 'fulfillment',
      },
      {
        label: 'Invoices',
        path: '/invoices',
        icon: 'Receipt',
        section: 'fulfillment',
      },
    ],
  },
  {
    title: 'ADMIN',
    collapsible: false,
    items: [
      {
        label: 'Vendors',
        path: '/vendors',
        icon: 'Building2',
        section: 'admin',
        requiredRoles: ['admin', 'finance_officer'],
      },
    ],
  },
];
