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
