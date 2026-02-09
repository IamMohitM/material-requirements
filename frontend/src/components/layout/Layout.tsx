/**
 * Layout Component
 * Main application layout wrapper with header and sidebar
 * Wraps all authenticated pages
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

/**
 * Map routes to page titles
 */
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/requests': 'Requests',
  '/quotes': 'Quotes',
  '/pos': 'Purchase Orders',
  '/vendors': 'Vendors',
  '/deliveries': 'Deliveries',
  '/invoices': 'Invoices',
};

export const Layout: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const [pageTitle, setPageTitle] = useState<string>('Material Requirements');

  // Update page title based on current route
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || 'Material Requirements';
    setPageTitle(title);
  }, [location.pathname]);

  const handleHamburgerClick = () => {
    dispatch(toggleSidebar());
  };

  const handleSidebarNavigate = () => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 768 && sidebarOpen) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Header - spans full width */}
      <Header
        onHamburgerClick={handleHamburgerClick}
        sidebarOpen={sidebarOpen}
        pageTitle={pageTitle}
      />

      {/* Main content area */}
      <div className={styles.mainContent}>
        {/* Sidebar - conditionally visible */}
        <Sidebar open={sidebarOpen} onNavigate={handleSidebarNavigate} />

        {/* Page content - outlet for nested routes */}
        <main className={styles.content}>
          <Outlet />
        </main>

        {/* Mobile overlay backdrop when sidebar is open */}
        {sidebarOpen && (
          <div
            className={styles.backdrop}
            onClick={() => dispatch(toggleSidebar())}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
