import { NotificationContent, useAppState } from '@platform';
import {
  appIdentifierForCalendarEvents,
  appOrganizerForCalendarEvents,
} from '@utils';
import * as Calendar from 'expo-calendar';
import { useCallback } from 'react';

const defaultTimezone = 'America/Los_Angeles';

type CreateCalendarEventInput = {
  notes: NonNullable<NotificationContent['body']>;
  startDate: Date;
  title: NonNullable<NotificationContent['title']>;
};

type NewEvent = CreateCalendarEventInput &
  Pick<
    Calendar.Event,
    'availability' | 'endDate' | 'alarms' | 'organizer' | 'timeZone'
  >;

type CreateCalendarEvent = (
  event: CreateCalendarEventInput,
) => Promise<string | false>;
type DeleteCalendarEvent = (calendarEventId: string) => void;

export const useCalendarEvents = () => {
  const {
    calendarEvents: { calendar, events },
  } = useAppState();

  const createCalendarEvent: CreateCalendarEvent = useCallback(
    async event => {
      if (calendar) {
        const newEvent: NewEvent = {
          ...event,
          availability: 'busy',
          endDate: new Date(event.startDate.getTime() + 30 * 60000),
          alarms: [
            {
              relativeOffset: -30,
            },
            {
              relativeOffset: -15,
            },
          ],
          organizer: appOrganizerForCalendarEvents,
          timeZone: defaultTimezone,
          title: `${appIdentifierForCalendarEvents}:: ${event.title}`,
        };

        const calendarEventId = await Calendar.createEventAsync(
          calendar.id,
          newEvent,
        );
        console.log('newEvent::', newEvent, calendarEventId);
        return calendarEventId;
      }
      return false;
    },
    [calendar],
  );

  const deleteCalendarEvent: DeleteCalendarEvent = useCallback(
    calendarEventId => {
      console.log('calendarEventId:', calendarEventId);
      void Calendar.deleteEventAsync(calendarEventId);
    },
    [],
  );

  return { calendar, events, createCalendarEvent, deleteCalendarEvent };
};
