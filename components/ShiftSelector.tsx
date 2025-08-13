


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Shift } from '../types';

interface ShiftSelectorProps {
    shifts: Shift[];
    selectedShiftId: string;
    onShiftChange: (newShiftId: string) => void;
    disabled?: boolean;
    isCondensed?: boolean;
}

const shiftShortNames: Record<string, string> = {
    'a': 'A',
    'b': 'B',
    'c': 'C',
    'off': 'R'
};

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shifts, selectedShiftId, onShiftChange, disabled = false, isCondensed = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const options = shifts;

    const selectedShift = options.find(s => s.id === selectedShiftId);
    
    const openMenu = () => {
        if (disabled || !buttonRef.current) return;
        setHighlightedIndex(options.findIndex(o => o.id === selectedShiftId));
        const rect = buttonRef.current.getBoundingClientRect();

        const menuHeightEstimate = Math.min(options.length * (isCondensed ? 32 : 36), 240) + 16;
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

    const handleSelect = (newShiftId: string) => {
        onShiftChange(newShiftId);
        closeMenu();
    };
    
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

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0) {
            menuRef.current?.querySelector(`#shift-option-${highlightedIndex}`)?.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen, highlightedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0) {
                    handleSelect(options[highlightedIndex].id);
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

    const isRestDay = selectedShiftId === 'off';
    const activeDescendant = isOpen && highlightedIndex >= 0 ? `shift-option-${highlightedIndex}` : '';

    const MenuPortal = () => createPortal(
        <div ref={menuRef} style={menuStyle}>
            <ul
                className={`max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none ${isCondensed ? 'sm:text-xs' : 'sm:text-sm'} dark:bg-gray-700 dark:ring-white/10`}
                role="listbox"
                aria-activedescendant={activeDescendant}
            >
                {options.map((shift, index) => (
                    <li
                        key={shift.id}
                        id={`shift-option-${index}`}
                        className={`relative cursor-pointer select-none text-center text-gray-900 ${isCondensed ? 'py-1 px-2' : 'py-2 px-4'} ${highlightedIndex === index ? 'bg-gray-100 dark:bg-gray-600' : ''} dark:text-gray-100`}
                        role="option"
                        aria-selected={shift.id === selectedShiftId}
                        onClick={() => handleSelect(shift.id)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                    >
                        <span className={`block truncate ${shift.id === selectedShiftId ? 'font-semibold' : 'font-normal'}`}>
                            {shiftShortNames[shift.id] || shift.name}
                        </span>
                    </li>
                ))}
            </ul>
        </div>,
        document.body
    );

    return (
        <div className="relative w-full">
            <button
                ref={buttonRef}
                type="button"
                onKeyDown={handleKeyDown}
                onClick={openMenu}
                className={`relative w-full rounded-md border text-left shadow-sm focus:outline-none focus:ring-1 transition-colors ${ isCondensed ? 'py-1 pl-2 pr-6' : 'py-2 pl-3 pr-8'} ${
                    isOpen ? 'border-indigo-500 ring-1 ring-indigo-500 dark:border-indigo-400 dark:ring-indigo-400' : 'border-gray-300 dark:border-gray-600'
                } ${isRestDay ? 'bg-gray-100 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-700'}
                  ${disabled ? 'cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400' : 'cursor-pointer focus:ring-indigo-500'}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
            >
                <span className={`block truncate font-medium text-center ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {selectedShift ? (shiftShortNames[selectedShift.id] || selectedShift.name) : ''}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                    <svg className="h-5 w-5 text-gray-400 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>
            
            {isOpen && <MenuPortal />}
        </div>
    );
};

export default ShiftSelector;