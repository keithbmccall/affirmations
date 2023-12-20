import { useCalendarEvents } from '@calendar-events';
import { Button, Text, useTheme } from '@rneui/themed';
import { globalStyles, spacingValues } from '@theme';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HistoryPage = () => {
  const { theme } = useTheme();
  const { calendar, events } = useCalendarEvents();

  useEffect(() => {
    console.log('Here are all your calendars and events:', {
      calendar,
      events,
    });
  }, [events, calendar]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        height: '100%',
        paddingHorizontal: 10,
      }}
    >
      <StatusBar style="inverted" />

      <Text>History page</Text>
      <Button
        title="Index page"
        onPress={() => {
          router.push('/');
        }}
        buttonStyle={{
          backgroundColor: theme.colors.grey5,
        }}
        containerStyle={{
          width: '100%',
          ...globalStyles.borderRadius10,
          marginTop: spacingValues.standard,
        }}
      />
      {calendar && <Text>{calendar.title}</Text>}

      <Text>-------</Text>
      <Text>end of calendars</Text>
      <Text>+++++++++</Text>
      <FlatList
        data={events}
        keyExtractor={(event, index) => `${event.id}_${index}`}
        renderItem={({ item: event }) => {
          // console.log({ event });
          return (
            <View>
              <Text>{calendar?.title}</Text>
              <Text>/////</Text>
              <Text>{event.title}</Text>
              <Text>{event.notes}</Text>
              <Text>{event.availability}</Text>
              <Text>{event.recurrenceRule?.frequency}</Text>
              <Text>{new Date(event.startDate).toDateString()}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};
