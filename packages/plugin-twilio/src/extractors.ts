/**
 * Extracts a phone number from text using regex
 * @param text Text containing a phone number
 * @returns Extracted phone number or null if not found
 */
export function extractPhoneNumber(text: string): string | null {
    // Basic phone number extraction - can be enhanced based on needs
    const phoneRegex = /\+?1?\d{10,15}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : null;
}

/**
 * Validates a phone number format
 * @param phoneNumber Phone number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
}

/**
 * Formats a phone number to E.164 format
 * @param phoneNumber Phone number to format
 * @returns Formatted phone number or null if invalid
 */
export function formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");

    // Check if we have a valid number of digits
    if (digits.length < 10 || digits.length > 15) {
        return null;
    }

    // Add + prefix if needed
    return digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
}
