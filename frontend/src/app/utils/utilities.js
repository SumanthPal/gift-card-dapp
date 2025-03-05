import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";


export function cn(...args) {
    return twMerge(clsx(...args));
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString(
        'en-US',
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }
    )
}

export function isExpired(expiryDate) {
    return new Date(expiryDate).getTime() < new Date().getTime();
}

export function truncateAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function encryptGiftCardData(data, secretKey) {
    try {
        // Convert data to JSON string
        const jsonData = JSON.stringify(data);
        
        // Generate a hash of the secret key
        const key = CryptoJS.SHA256(secretKey).toString();
        
        // Encrypt the JSON string
        const encryptedData = CryptoJS.AES.encrypt(jsonData, key).toString();
        
        return encryptedData;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

export function decryptGiftCardData(encryptedData, secretKey) {
    try {
        if (!encryptedData || !secretKey) return null;
        
        // Generate a hash of the secret key
        const key = CryptoJS.SHA256(secretKey).toString();
        
        // Decrypt the data
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) throw new Error('Failed to decrypt data');
        
        // Parse the decrypted JSON
        return JSON.parse(decryptedText);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

