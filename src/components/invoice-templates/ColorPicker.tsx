'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  className?: string;
}

/**
 * Palette de couleurs pré-définies pour faciliter la sélection
 */
const DEFAULT_PRESET_COLORS = [
  // Bleus
  '#2c5aa0', '#3b82f6', '#1e40af', '#0ea5e9', '#06b6d4',
  // Verts
  '#059669', '#10b981', '#22c55e', '#84cc16', '#65a30d',
  // Rouges/Oranges
  '#ef4444', '#f97316', '#fb923c', '#f59e0b', '#eab308',
  // Violets/Roses
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  // Neutres
  '#000000', '#1a1a1a', '#374151', '#6b7280', '#9ca3af',
  '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb', '#ffffff',
  // Spéciaux
  '#d4af37', '#c0c0c0', '#cd7f32', '#ffd700', '#ff6b6b',
];

/**
 * Composant ColorPicker avec palette de couleurs et sélecteur natif
 * 
 * @example
 * <ColorPicker
 *   label="Couleur principale"
 *   value={colors.primary}
 *   onChange={(color) => setColors({ ...colors, primary: color })}
 * />
 */
export function ColorPicker({
  label,
  value,
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  className = '',
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchroniser l'input avec la valeur externe
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setInputValue(color);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Valider le format hex
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // Revenir à la dernière valeur valide si l'input est invalide
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value);
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value.toUpperCase();
    onChange(color);
    setInputValue(color);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Compact inline layout */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-700 w-16 sm:w-20 flex-shrink-0 truncate">
          {label}
        </label>
        
        {/* Color preview + hex value */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 min-w-0 h-8 px-2 border-2 border-gray-700 rounded-lg hover:border-gray-600 transition-colors flex items-center gap-2 bg-gray-800/50"
        >
          <div
            className="w-5 h-5 rounded border border-gray-600 shadow-sm flex-shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs font-mono text-gray-300 flex-1 text-left truncate">{value}</span>
        </button>

        {/* Native color picker */}
        <div className="relative flex-shrink-0">
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={handleNativePickerChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-8 h-8 border-2 border-gray-700 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center bg-gray-800/50"
            title="Pipette"
          >
            <Palette className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Dropdown palette - Compact & Responsive */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-xl left-0 right-0 animate-fade-in max-w-[280px]"
        >
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className="relative w-6 h-6 rounded border-2 border-gray-600 hover:border-blue-500 transition-all hover:scale-110 focus:outline-none"
                style={{ backgroundColor: color }}
                title={color}
              >
                {value.toLowerCase() === color.toLowerCase() && (
                  <Check
                    className="absolute inset-0 m-auto text-white drop-shadow"
                    size={12}
                    strokeWidth={3}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
