/**
 * Navigation Item Component
 * Individual navigation menu item with active state highlighting
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { NavigationItem as NavItemType } from '../../types/navigation';
import styles from './NavigationItem.module.css';

interface NavigationItemProps {
  item: NavItemType;
  onClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ item, onClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location.pathname === item.path;

  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Link;

  const handleClick = () => {
    navigate(item.path);
    onClick?.();
  };

  return (
    <button
      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      title={item.label}
    >
      <IconComponent className={styles.icon} size={20} />
      <span className={styles.label}>{item.label}</span>
      {item.badge && item.badge > 0 && (
        <span className={styles.badge}>{item.badge}</span>
      )}
    </button>
  );
};

export default NavigationItem;
