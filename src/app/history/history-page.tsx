import { Button, Text, useTheme } from '@rneui/themed';
import { globalStyles, spacingValues } from '@theme';
import { january2023, rightNow } from '@utils';
import * as Calendar from 'expo-calendar';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HistoryPage = () => {
  const { theme } = useTheme();
  const [state, setState] = useState<Calendar.Event[] | null>(null);
  const [cal, setCal] = useState<Calendar.Calendar[] | null>(null);

  useEffect(() => {
    void (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT,
        );
        const events = calendars.length
          ? await Calendar.getEventsAsync(
              calendars.map(c => c.id),
              january2023,
              rightNow,
            )
          : null;
        setState(events);
        setCal(calendars);
        console.log('Here are all your calendars and events:', {
          calendars,
          events,
        });
      }
    })();
  }, []);

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        height: '100%',
        paddingHorizontal: 10,
      }}
    >
      <StatusBar style="inverted" />
      <ScrollView>
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
        {state?.map(event => {
          return (
            <View>
              <Text>{event.title}</Text>
              <Text>{event.organizer}</Text>
              <Text>{event.availability}</Text>
              <Text>{event.recurrenceRule?.frequency}</Text>
              <Text>{new Date(event.startDate).toDateString()}</Text>
              <Text>{cal?.find(c => event.calendarId === c.id)?.title}</Text>
              <Text>/////</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
