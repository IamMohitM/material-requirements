/**
 * Header Component
 * Top navigation header with logo, title, hamburger menu, and user menu
 */

import React from 'react';
import { Menu, X } from 'lucide-react';
import UserMenu from './UserMenu';
import styles from './Header.module.css';

interface HeaderProps {
  onHamburgerClick: () => void;
  sidebarOpen: boolean;
  pageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onHamburgerClick,
  sidebarOpen,
  pageTitle = 'Material Requirements',
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.hamburger}
          onClick={onHamburgerClick}
          aria-label="Toggle navigation"
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={styles.brand}>
          <div className={styles.logo}>MRMS</div>
          <div className={styles.brandName}>Material Requirements</div>
        </div>

        <div className={styles.pageTitle}>{pageTitle}</div>
      </div>

      <div className={styles.headerRight}>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
