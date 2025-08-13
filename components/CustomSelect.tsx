


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

export interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: SelectOption[];
    selectedValue: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    allowClear?: boolean;
    disabled?: boolean;
    ['aria-label']?: string;
    ['aria-labelledby']?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, selectedValue, onChange, placeholder, className = '', allowClear = false, disabled = false, ...ariaProps }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    
    const selectedOption = options.find(opt => opt.value === selectedValue);

    const openMenu = () => {
        if (disabled || !buttonRef.current) return;
        setHighlightedIndex(options.findIndex(o => o.value === selectedValue));
        const rect = buttonRef.current.getBoundingClientRect();
        
        const menuHeightEstimate = Math.min(options.length * 40, 240) + 16;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const style: React.CSSProperties = {
            position: 'fixed',
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: 50,
        };

        if (spaceBelow < menuHeightEstimate && spaceAbove > spaceBelow) {
            style.bottom = `${window.innerHeight - rect.top + 4}px`;
        } else {
            style.top = `${rect.bottom + 4}px`;
        }
        
        setMenuStyle(style);
        setIsOpen(true);
    };

    const closeMenu = useCallback(() => {
        setIsOpen(false);
        setHighlightedIndex(-1);
    }, []);

    const handleSelect = useCallback((optionValue: string) => {
        onChange(optionValue);
        closeMenu();
    }, [onChange, closeMenu]);

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(disabled) return;
        onChange('');
        closeMenu();
    };

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0) {
            menuRef.current?.querySelector(`#option-${options[highlightedIndex].value}`)?.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen, highlightedIndex, options]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };
        const handleScroll = (event: Event) => {
            if (menuRef.current?.contains(event.target as Node)) return;
            closeMenu();
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen, closeMenu]);


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        switch(e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0) {
                    handleSelect(options[highlightedIndex].value);
                } else {
                    openMenu();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    openMenu();
                } else {
                    setHighlightedIndex(prev => (prev + 1) % options.length);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!isOpen) {
                    openMenu();
                } else {
                    setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
                }
                break;
            case 'Escape':
                if (isOpen) closeMenu();
                break;
            case 'Tab':
                if (isOpen) closeMenu();
                break;
        }
    };
    
    const activeDescendant = isOpen && highlightedIndex >= 0 ? `option-${options[highlightedIndex].value}` : '';

    const MenuPortal = () => createPortal(
        <div ref={menuRef} style={menuStyle}>
            <ul
                className="max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-700 dark:ring-white/10"
                role="listbox"
                aria-activedescendant={activeDescendant}
                {...ariaProps}
            >
                {options.map((option, index) => (
                    <li
                        key={option.value}
                        id={`option-${option.value}`}
                        className={`relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 ${highlightedIndex === index ? 'bg-gray-100 dark:bg-gray-600' : ''} dark:text-gray-100`}
                        role="option"
                        aria-selected={option.value === selectedValue}
                        onClick={() => handleSelect(option.value)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                    >
                        <span className={`block truncate ${option.value === selectedValue ? 'font-semibold' : 'font-normal'}`}>
                            {option.label}
                        </span>
                        {option.value === selectedValue && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                                <Icon icon="check" className="h-5 w-5" />
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>,
        document.body
    );

    return (
        <div className={`relative w-full ${className}`}>
            <button
                ref={buttonRef}
                type="button"
                onKeyDown={handleKeyDown}
                onClick={openMenu}
                className={`relative w-full rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500 dark:border-indigo-400 dark:ring-indigo-400' : 'border-gray-300 dark:border-gray-600'} ${disabled ? 'cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400' : 'cursor-pointer focus:ring-indigo-500 dark:bg-gray-700'}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
                {...ariaProps}
            >
                <span className={`block truncate ${selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {allowClear && selectedValue && !disabled && (
                        <button type="button" onClick={handleClear} className="pointer-events-auto mr-1 cursor-pointer rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-500" aria-label="Clear selection">
                            <Icon icon="x" className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    )}
                    <span className="pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </span>
            </button>
            
            {isOpen && <MenuPortal />}
        </div>
    );
};

export default CustomSelect;