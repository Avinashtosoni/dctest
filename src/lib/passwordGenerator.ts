/**
 * Secure Password Generator
 * Generates cryptographically secure random passwords
 */

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*';

/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns Secure random password
 */
export function generateSecurePassword(length: number = 12): string {
    const allChars = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;
    const array = new Uint8Array(length);

    // Use crypto API for cryptographically secure random values
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
    } else {
        // Fallback for Node.js environment
        const crypto = require('crypto');
        crypto.randomFillSync(array);
    }

    let password = '';

    // Ensure password has at least one of each type
    password += UPPERCASE[array[0] % UPPERCASE.length];
    password += LOWERCASE[array[1] % LOWERCASE.length];
    password += NUMBERS[array[2] % NUMBERS.length];
    password += SYMBOLS[array[3] % SYMBOLS.length];

    // Fill remaining characters
    for (let i = 4; i < length; i++) {
        password += allChars[array[i] % allChars.length];
    }

    // Shuffle the password to randomize positions
    return shuffleString(password);
}

/**
 * Shuffle a string randomly
 */
function shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns true if strong, false otherwise
 */
export function isPasswordStrong(password: string): boolean {
    if (password.length < 8) return false;

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*]/.test(password);

    return hasUppercase && hasLowercase && hasNumber && hasSymbol;
}
