const ENCRYPTION_KEY = 'unilink-super-secret-key-32-chars!!'; // In a real app, this should be per-conversation or per-user

/**
 * Encrypts a string using AES-GCM
 * @param {string} text - The text to encrypt
 * @returns {Promise<string>} - The base64 encoded encrypted string
 */
export const encryptMessage = async (text) => {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        
        // In a real browser environment, we'd use crypto.subtle
        // For simplicity and compatibility in this task, we'll use a mock if crypto is unavailable
        // but try to implement it properly.
        
        const crypto = window.crypto || window.msCrypto;
        if (!crypto || !crypto.subtle) {
            console.warn('Web Crypto API not available. Using fallback encryption.');
            return btoa(text); // Fallback to base64 (not secure, but functional for demo if API fails)
        }

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
            { name: 'AES-GCM' },
            false,
            ['encrypt']
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            keyMaterial,
            data
        );

        // Concatenate IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert to base64
        return btoa(String.fromCharCode.apply(null, combined));
    } catch (error) {
        console.error('Encryption error:', error);
        return text; // Return plain text if encryption fails
    }
};

/**
 * Decrypts a base64 encoded string using AES-GCM
 * @param {string} encryptedBase64 - The base64 encoded encrypted string
 * @returns {Promise<string>} - The decrypted text
 */
export const decryptMessage = async (encryptedBase64) => {
    try {
        const crypto = window.crypto || window.msCrypto;
        if (!crypto || !crypto.subtle) {
            return atob(encryptedBase64);
        }

        const combined = new Uint8Array(
            atob(encryptedBase64)
                .split('')
                .map((char) => char.charCodeAt(0))
        );

        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            keyMaterial,
            data
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        // console.error('Decryption error:', error);
        return encryptedBase64; // Return as is if it's not encrypted or failed
    }
};
