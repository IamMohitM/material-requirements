/**
 * Navigation System Types
 * Defines interfaces for navigation structure, items, and configuration
 */

/**
 * Individual navigation menu item
 */
export interface NavigationItem {
  label: string;
  path: string;
  icon: string;              // Lucide icon name
  section: 'procurement' | 'fulfillment' | 'admin';
  requiredRoles?: string[];  // For role-based access control
  badge?: number;            // Optional notification badge count
}

/**
 * Navigation section containing multiple items
 */
export interface NavigationSection {
  title: string;
  items: NavigationItem[];
  collapsible?: boolean;
}

/**
 * Layout context for managing header/sidebar state
 */
export interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPath: string;
  pageTitle: string;
  setPageTitle: (title: string) => void;
}
