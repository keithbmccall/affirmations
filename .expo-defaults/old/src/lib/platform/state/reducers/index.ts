import { ExpoPushToken } from 'expo-notifications';
import {
  CalendarEvents,
  HistoryNotification,
  Modal,
  NotificationWithData,
  QuotesObject,
} from '../../types';
import { Action } from '../actions';

export interface StateType {
  app: {
    notificationToken: ExpoPushToken;
    currentlyScheduledNotifications: NotificationWithData[];
    historyNotifications: HistoryNotification[];
    calendarEvents: CalendarEvents;
    quotes: QuotesObject;
    modal: Modal;
  };
}

export const initialState: StateType = {
  app: {
    notificationToken: {
      type: 'expo',
      data: '',
    },
    currentlyScheduledNotifications: [],
    historyNotifications: [],
    calendarEvents: {
      calendar: null,
      events: [],
    },
    quotes: { list: [], sentQuoteCount: 0 },
    modal: {
      openModal: null,
      withData: {},
    },
  },
};

export const stateReducer = (
  state = initialState,
  action: Action,
): StateType => {
  console.log({
    action,
  });
  switch (action.type) {
    case 'SET_NOTIFICATION_TOKEN':
      return {
        ...state,
        app: {
          ...state.app,
          notificationToken: action.payload,
        },
      };
    case 'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS':
      return {
        ...state,
        app: {
          ...state.app,
          currentlyScheduledNotifications: action.payload,
        },
      };
    case 'SET_ADD_HISTORY_NOTIFICATION':
      return {
        ...state,
        app: {
          ...state.app,
          historyNotifications: [
            ...state.app.historyNotifications,
            action.payload,
          ],
        },
      };
    case 'SET_REMOVE_HISTORY_NOTIFICATION':
      return {
        ...state,
        app: {
          ...state.app,
          historyNotifications: state.app.historyNotifications.filter(
            notification => notification.identifier !== action.payload,
          ),
        },
      };
    case 'SET_ADD_HISTORY_NOTIFICATIONS':
      return {
        ...state,
        app: {
          ...state.app,
          historyNotifications: action.payload,
        },
      };
    case 'SET_MAIN_CALENDAR':
      return {
        ...state,
        app: {
          ...state.app,
          calendarEvents: action.payload,
        },
      };
    case 'SET_FETCH_QUOTES':
      return {
        ...state,
        app: {
          ...state.app,
          quotes: {
            list: action.payload,
            sentQuoteCount: 0,
          },
        },
      };
    case 'SET_SENT_QUOTE_COUNT':
      return {
        ...state,
        app: {
          ...state.app,
          quotes: {
            ...state.app.quotes,
            sentQuoteCount: state.app.quotes.sentQuoteCount + 1,
          },
        },
      };
    case 'SET_MODAL':
      return {
        ...state,
        app: {
          ...state.app,
          modal: action.payload,
        },
      };

    default:
      return state;
  }
};
