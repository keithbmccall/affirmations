const epoch = 1696795094000;
const newDate = new Date(epoch);
const rawDate = newDate.toString();
const time = newDate.getTime();
const date = newDate.toDateString();

export const scheduledNotificationsData = [
  {
    identifier: `a_${Math.random()}`,
    content: {
      title: 'Title 1',
      body: "This is the message I want to see. Let's see how many characters is allowed. Here are some details about what's happening",
      data: {
        rawDate,
        time,
        date,
      },
    },
  },
  {
    identifier: `a_${Math.random()}`,
    content: {
      title: 'Title 2',
      body: "This is the message I want to see. Let's see how many characters is allowed. Here are some details about what's happening",
      data: {
        rawDate,
        time,
        date,
      },
    },
  },
  {
    identifier: `a_${Math.random()}`,
    content: {
      title: 'Title 3',
      body: "This is the message I want to see. Let's see how many characters is allowed. Here are some details about what's happening",
      data: {
        rawDate,
        time,
        date,
      },
    },
  },
  {
    identifier: `a_${Math.random()}`,
    content: {
      title: 'Title 4',
      body: "This is the message I want to see. Let's see how many characters is allowed. Here are some details about what's happening",
      data: {
        rawDate,
        time,
        date,
      },
    },
  },
];


export const sampleEvent = {
  id: '738F6DDF-DFC0-458F-8E3D-D50FF4C60732',
  recurrenceRule: {
    interval: 1,
    frequency: 'weekly',
  },
  lastModifiedDate: '2023-11-26T15:26:41.000Z',
  calendarId: '7E4531B8-9BEC-400A-AB6F-3911444DB54D',
  url: null,
  isDetached: false,
  endDate: '2023-12-03T20:00:00.000Z',
  title: 'CHURCH 9:30AM',
  notes:
    'Prayer Garden Church\n\n-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-\nJoin with Google Meet: https://meet.google.com/auo-rdvb-ozt\n\nLearn more about Meet at: https://support.google.com/a/users/answer/9282720\n\nPlease do not edit this section.\n-::~:~::~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~:~::~:~::-',
  location: '651 N 6th St, San Jose, CA 95112, USA',
  timeZone: 'America/Los_Angeles',
  originalStartDate: '2023-12-03T17:00:00.000Z',
  allDay: false,
  availability: 'busy',
  alarms: [
    {
      relativeOffset: -30,
    },
  ],
  startDate: '2023-12-03T17:00:00.000Z',
  organizer: {
    status: 'accepted',
    type: 'person',
    isCurrentUser: false,
    url: 'mailto:nicole.marie.wiltshire@gmail.com',
    name: 'nicole.marie.wiltshire@gmail.com',
    role: 'chair',
  },
  creationDate: '2023-09-06T04:19:20.000Z',
  status: 'confirmed',
};
