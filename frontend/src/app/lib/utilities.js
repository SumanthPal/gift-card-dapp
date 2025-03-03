import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";


export function cn(...args) {
    return twMerge(clsx(...args));
}

export function formatDate(date) {
    return new Date(data).toLocaleDateString(
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

export function decryptData(encryptedData, privateKey) {
    try {
        if (!userKey || !encryptedData) return null;
        const key = CryptoJS.SHA256(userKey).toString();
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) throw new Error('Failed to decrypt data');
        
        return JSON.parse(decryptedText);
    } catch (error) {
        console.error(error);
        return null;
    }
    
}

