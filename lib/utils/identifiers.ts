/** Canonical app name (Xcode target, HTTP attribution, etc.). */
export const appName = 'ScheduledAffirmations';

/** Client attribution for APIs that accept X-Referrer / similar headers. */
export const appHttpReferrer = appName;

/**
 * Short marker embedded in calendar event titles.
 * Do not change lightly — existing events are matched with this substring.
 */
export const appIdentifierForCalendarEvents = 'Sc|Af';

export const appOrganizerForCalendarEvents = 'keithcodes@gmail.com';
