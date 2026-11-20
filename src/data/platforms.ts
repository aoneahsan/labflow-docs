/**
 * Every place LabFlow is released — the ONLY place a store or surface URL lives in this docs site
 * (standard aoneahsan-cccs-platform-links). Each surface passed its release proof on `verified`:
 * the web app answered 200, the Play listing is on the owner's developer page.
 */
export type PlatformId = 'web' | 'android' | 'docs';

export interface Platform {
  id: PlatformId;
  /** Store or surface name (a proper name, not copy). */
  name: string;
  href: string;
  /** What this surface is for, in LabFlow's words. */
  title: string;
  text: string;
  cta: string;
  primary?: boolean;
  verified: string;
}

export const PLATFORMS: readonly Platform[] = [
  {id: 'web', name: 'LabFlow web app', href: 'https://labflow.aoneahsan.com', title: 'At the bench and the front desk', text: 'Register samples, run tests, review results and release reports from any computer in the lab.', cta: 'Open LabFlow', primary: true, verified: '2026-11-20'},
  {id: 'android', name: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.aoneahsan.labflow', title: 'On your Android phone', text: 'Check a sample, a pending result or today\'s worklist away from the workstation.', cta: 'Get it on Google Play', verified: '2026-11-20'},
  {id: 'docs', name: 'Documentation', href: 'https://labflow-docs.aoneahsan.com', title: 'These docs', text: 'The user guide, how the lab workflow fits together, and what is on the roadmap.', cta: 'Read the docs', verified: '2026-11-20'},
];

export const APPS_PAGE = {
  title: 'Get LabFlow',
  description: 'Every place LabFlow is released: the web app, the Android app on Google Play, and these docs.',
  lead: 'The lab on the workstation and in your pocket, with these guides a tab away.',
} as const;

/** This site is the docs surface. */
export const CURRENT_SURFACE: PlatformId = 'docs';
export const OTHER_PLATFORMS: readonly Platform[] = PLATFORMS.filter((platform) => platform.id !== CURRENT_SURFACE);
export const PRIMARY_PLATFORM: Platform = PLATFORMS.find((platform) => platform.primary) ?? PLATFORMS[0];
export function platformHref(id: PlatformId): string {
  const found = PLATFORMS.find((platform) => platform.id === id);
  if (!found) throw new Error(`Unknown platform: ${id}`);
  return found.href;
}
/** `/apps` changes only when this list does: its sitemap date is the newest proof date. */
export const APPS_LASTMOD: string = PLATFORMS.map((platform) => platform.verified).sort().at(-1) ?? '2026-11-20';
