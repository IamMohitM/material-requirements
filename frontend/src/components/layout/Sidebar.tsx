/**
 * Sidebar Component
 * Navigation sidebar with sections and items
 */

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { NAVIGATION_SECTIONS } from '../../config/navigation';
import NavigationItem from './NavigationItem';
import styles from './Sidebar.module.css';

interface SidebarProps {
  open: boolean;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onNavigate }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter navigation items based on user role
  const visibleSections = useMemo(() => {
    return NAVIGATION_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.requiredRoles || item.requiredRoles.length === 0) {
          return true;
        }
        return user?.role && item.requiredRoles.includes(user.role);
      }),
    })).filter((section) => section.items.length > 0);
  }, [user?.role]);

  return (
    <div className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      <nav className={styles.sidebarContent}>
        {visibleSections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <div className={styles.items}>
              {section.items.map((item) => (
                <NavigationItem
                  key={item.path}
                  item={item}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
