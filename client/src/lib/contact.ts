// Contact utilities for call and email functionality

export function initiatePhoneCall(phoneNumber: string) {
  if (!phoneNumber) {
    console.warn('No phone number provided');
    return;
  }
  
  // Clean the phone number (remove spaces, dashes, parentheses)
  const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Create tel: URL
  const telUrl = `tel:${cleanedNumber}`;
  
  // Open the dialer
  window.location.href = telUrl;
}

export function initiateEmail(emailAddress: string, subject?: string, body?: string) {
  if (!emailAddress) {
    console.warn('No email address provided');
    return;
  }
  
  // Build mailto URL
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  
  const paramString = params.toString();
  const mailtoUrl = `mailto:${emailAddress}${paramString ? '?' + paramString : ''}`;
  
  // Open email client
  window.location.href = mailtoUrl;
}

export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if it's a 10-digit US number
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if it doesn't match expected format
  return phoneNumber;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation for US phone numbers
  const phoneRegex = /^[\+]?[1]?[\-\s]?[\(]?[0-9]{3}[\)]?[\-\s]?[0-9]{3}[\-\s]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}