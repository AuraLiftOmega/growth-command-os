/**
 * Super Admin Configuration
 * These emails have permanent god-mode access to MASTER_OS.
 * They bypass all credit checks, paywalls, and feature gates.
 */
export const SUPER_ADMIN_EMAILS: readonly string[] = [
  'ryanauralift@gmail.com',
  'ryanpuddy@profitreaper.com',
  'rfloweroflife@gmail.com',
  'ryanandsimba@gmail.com',
] as const;

export function isSuperAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}
