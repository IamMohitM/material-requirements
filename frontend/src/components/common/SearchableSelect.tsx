import React, { useState, useEffect, useRef } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import './SearchableSelect.css';

interface Option {
  id: string;
  label: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  placeholder: string;
  options: Option[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSelect: (option: Option) => void;
  onCreateNew?: (name: string) => void;
  canCreate?: boolean;
  selectedLabel?: string;
  disabled?: boolean;
  getOptionLabel?: (option: Option) => string;
  getOptionValue?: (option: Option) => string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  placeholder,
  options,
  isLoading,
  onSearch,
  onSelect,
  onCreateNew,
  canCreate = false,
  selectedLabel,
  disabled = false,
  getOptionLabel = (opt) => opt.label,
  getOptionValue = (opt) => opt.id,
}) => {
  const [inputValue, setInputValue] = useState(selectedLabel || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(selectedLabel || '');
  }, [selectedLabel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    onSearch(value);
  };

  const handleSelect = (option: Option) => {
    setInputValue(getOptionLabel(option));
    setIsOpen(false);
    onSelect(option);
  };

  const handleCreateNew = () => {
    if (onCreateNew && inputValue.trim()) {
      onCreateNew(inputValue.trim());
      setInputValue('');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          // User highlighted an option with arrow keys
          handleSelect(options[highlightedIndex]);
        } else if (options.length === 1) {
          // Only one matching option - auto-select it
          handleSelect(options[0]);
        } else if (options.length > 0) {
          // Multiple options but none highlighted - highlight first one
          setHighlightedIndex(0);
        } else if (canCreate && inputValue.trim()) {
          // No matching options - create new if allowed
          handleCreateNew();
        }
        break;
      case 'Tab':
        // Tab should also select first matching option
        if (options.length === 1) {
          handleSelect(options[0]);
        } else if (options.length > 0 && highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex]);
        }
        setIsOpen(false);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const showCreateOption = canCreate && inputValue.trim() &&
    !options.some(opt => getOptionLabel(opt).toLowerCase() === inputValue.toLowerCase());

  return (
    <div ref={containerRef} className="searchable-select-container">
      <Form.Control
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        autoComplete="off"
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="searchable-select-dropdown"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: inputRef.current?.offsetWidth || 'auto',
          }}
        >
          {isLoading ? (
            <div className="p-3 text-center">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading...
            </div>
          ) : options.length === 0 && !showCreateOption ? (
            <div className="p-3 text-muted">No options found</div>
          ) : (
            <>
              <div className="searchable-select-list">
              {options.map((option, index) => (
                <div
                  key={getOptionValue(option)}
                  className={`searchable-select-item ${
                    index === highlightedIndex ? 'highlighted' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                  style={{ cursor: 'pointer', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f3f5' }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="font-weight-bold">
                        {getOptionLabel(option)}
                      </div>
                      {option.description && (
                        <small className="text-muted">{option.description}</small>
                      )}
                    </div>
                    {option.badge && (
                      <span className="badge bg-secondary">{option.badge}</span>
                    )}
                  </div>
                </div>
              ))}

              {showCreateOption && (
                <div
                  className={`searchable-select-item create-new ${
                    highlightedIndex === options.length ? 'highlighted' : ''
                  }`}
                  onClick={handleCreateNew}
                  style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '0.75rem 1rem' }}
                >
                  <div className="text-primary">
                    <strong>+ Create New:</strong> {inputValue}
                  </div>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
