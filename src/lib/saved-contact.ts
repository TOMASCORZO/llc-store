import { ContactDetails, parseContact } from './contact';
export const SAVED_CONTACT_KEY = 'justmyllc:registered-contact:v1';
export type SavedContact = { version: 1; contact: ContactDetails; email: string; phone: string };
export function parseSavedContact(raw: string | null): SavedContact | null {
  try {
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    const contact = parseContact(data.contact);
    if (!contact || typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || typeof data.phone !== 'string' || data.phone.length > 40) return null;
    return { version: 1, contact, email: data.email, phone: data.phone };
  } catch { return null; }
}
export function readSavedContact(): SavedContact | null {
  try { return parseSavedContact(localStorage.getItem(SAVED_CONTACT_KEY)); } catch { return null; }
}
// Call only after the order API confirms successful registration.
export function rememberRegisteredContact(contact: ContactDetails, email: string, phone: string) {
  try {
    const value = parseSavedContact(JSON.stringify({ version: 1, contact, email: email.trim(), phone: phone.trim() }));
    if (value) localStorage.setItem(SAVED_CONTACT_KEY, JSON.stringify(value));
  } catch { /* Storage failure must never interrupt checkout. */ }
}
export function forgetSavedContact() {
  try { localStorage.removeItem(SAVED_CONTACT_KEY); } catch { /* Storage may be unavailable. */ }
}
