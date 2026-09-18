import React from 'react';

/**
 * Utility functions for Philippine mobile phone numbers.
 * Standard format: 11 digits starting with 09 (e.g., 09171234567).
 */

/**
 * Strips all non-digit characters and standardizes PH numbers (e.g., handles pasted +63/63 or 9xx numbers).
 * Truncates to a maximum of 11 digits.
 */
export function sanitizePhPhone(input: string): string {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');

  // Handle +63 / 63 prefix (e.g. 639171234567 -> 09171234567)
  if (digits.startsWith('63') && digits.length >= 12) {
    digits = '0' + digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith('9')) {
    // e.g. 9171234567 -> 09171234567
    digits = '0' + digits;
  }

  return digits.slice(0, 11);
}

/**
 * Validates whether the given string is a valid 11-digit Philippine mobile phone number starting with 09.
 */
export function isValidPhPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return /^09\d{9}$/.test(digits);
}

/**
 * Formats a sanitized 11-digit PH phone number for display (e.g., 0917 123 4567).
 */
export function formatPhPhoneDisplay(phone: string): string {
  const digits = sanitizePhPhone(phone);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}

/**
 * Keyboard event handler to ensure only numeric digits and control/editing keys can be entered.
 */
export function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  // Allow standard control/navigation keys
  if (
    [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ].includes(e.key) ||
    // Allow modifier shortcuts (Ctrl/Cmd + A, C, V, X, Z)
    ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))
  ) {
    return;
  }

  // Block any non-digit character
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Returns structured validation status and user-friendly helper feedback for PH phone input.
 */
export function getPhPhoneValidationState(phone: string): {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'warning' | 'success';
} {
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    return { isValid: false };
  }
  if (!digits.startsWith('09')) {
    if (digits.startsWith('9')) {
      return {
        isValid: false,
        message: 'Philippine numbers start with 09 (e.g. 09171234567)',
        type: 'warning'
      };
    }
    return {
      isValid: false,
      message: 'Must start with 09 (e.g. 09171234567)',
      type: 'error'
    };
  }
  if (digits.length < 11) {
    return {
      isValid: false,
      message: `Must be exactly 11 digits (${digits.length}/11)`,
      type: 'warning'
    };
  }
  if (digits.length === 11 && isValidPhPhone(digits)) {
    return {
      isValid: true,
      message: 'Valid PH mobile number',
      type: 'success'
    };
  }
  return {
    isValid: false,
    message: 'Invalid Philippine phone number',
    type: 'error'
  };
}
