import { Init } from '@platform';
import { appIdentifierForCalendarEvents, january2030, rightNow } from '@utils';
import * as Calendar from 'expo-calendar';
import { useEffect } from 'react';

const EVENT_EMAIL = 'keithcodes@gmail.com';
const DEFAULT_CALENDAR = 'Calendar';

export const useInitEvents: Init = providerActions => {
  useEffect(() => {
    void (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT,
        );

        const mainCalendar =
          calendars.find(calendar => calendar.title === EVENT_EMAIL) ??
          calendars.find(calendar => calendar.title === DEFAULT_CALENDAR);

        if (mainCalendar) {
          const mainCalendarEvents = await Calendar.getEventsAsync(
            calendars.map(c => c.id),
            rightNow,
            january2030,
          );

          const mainCalendarEventsFromUs = mainCalendarEvents.filter(event =>
            event.title.includes(appIdentifierForCalendarEvents),
          );

          providerActions.onSetMainCalendar(
            mainCalendar,
            mainCalendarEventsFromUs,
          );
        } else {
          console.log('no calendar found!');
        }
      }
    })();
  }, []);
};
