import { appIdentifierForCalendarEvents, appOrganizerForCalendarEvents } from '../identifiers';

describe('identifiers', () => {
  it('should have the correct app identifier for calendar events', () => {
    expect(appIdentifierForCalendarEvents).toBe('Sc|Af');
  });

  it('should have the correct app organizer for calendar events', () => {
    expect(appOrganizerForCalendarEvents).toBe('keithcodes@gmail.com');
  });
});
