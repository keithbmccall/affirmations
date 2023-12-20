import { Calendar, Event } from 'expo-calendar';

export type CalendarEvents = {
  calendar: Calendar | null;
  events: Event[];
};
