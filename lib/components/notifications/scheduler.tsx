import { useNotificationsScheduler } from '@features/notifications';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, globalStyles, spacing } from '../../styles';
import { fiveMinutesFromNow, twoYearsFromNow } from '../../utils';
import { ThemedInput, ThemedText, ThemedView } from '../shared';

interface FormField<T> {
  value: T;
  error: string;
}

export const Scheduler = () => {
  const { schedulePushNotification, refreshCurrentlyScheduledNotifications } =
    useNotificationsScheduler();
  const [date, setDate] = useState<FormField<Date>>({ value: fiveMinutesFromNow, error: '' });
  const [title, setTitle] = useState<FormField<string>>({ value: '', error: '' });
  const [message, setMessage] = useState<FormField<string>>({ value: '', error: '' });
  const [refreshing, setRefreshing] = useState(false);

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDate({ value: selectedDate, error: '' });
    }
  };

  const handleTitleChange = (text: string) => {
    setTitle({ value: text, error: '' });
  };

  const handleMessageChange = (text: string) => {
    setMessage({ value: text, error: '' });
  };

  const validateForm = () => {
    let isValid = true;

    const titleValue = title.value.trim();
    const messageValue = message.value.trim();
    // Validate title
    if (!titleValue) {
      setTitle({ ...title, error: 'Title is required' });
      isValid = false;
    }

    if (titleValue.length < 3) {
      setTitle({ ...title, error: 'Title needs to be at least 3 characters' });
      isValid = false;
    }

    // Validate message
    if (!messageValue) {
      setMessage({ ...message, error: 'Message is required' });
      isValid = false;
    }
    if (messageValue.length < 5) {
      setMessage({ ...message, error: 'Message needs to be at least 5 characters' });
      isValid = false;
    }

    // Validate date (ensure it's in the future)
    if (date.value <= new Date()) {
      setDate({ ...date, error: 'Date must be in the future' });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const notificationIdentifier = await schedulePushNotification({
      title: title.value,
      body: message.value,
      date: date.value,
    });

    Alert.alert(
      'Message Scheduled',
      `Your message "${title.value}" has been scheduled for ${date.value.toLocaleString()}. Identifier: ${notificationIdentifier}`,
      [{ text: 'OK' }]
    );

    // Clear the form
    setDate({ value: fiveMinutesFromNow, error: '' });
    setTitle({ value: '', error: '' });
    setMessage({ value: '', error: '' });
  };

  const isFormValid =
    title.value.trim() !== '' && message.value.trim() !== '' && date.value > new Date();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setDate({ value: fiveMinutesFromNow, error: '' });
    await refreshCurrentlyScheduledNotifications();
    setTimeout(() => setRefreshing(false), 500); // Simulate async refresh
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ThemedView style={styles.form}>
        <ThemedView style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label}>
            Date & Time
          </ThemedText>

          <ThemedView style={styles.datePicker}>
            <DateTimePicker
              value={date.value}
              mode="datetime"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={fiveMinutesFromNow}
              maximumDate={twoYearsFromNow}
            />
          </ThemedView>
          {date.error ? <ThemedText style={styles.errorText}>{date.error}</ThemedText> : null}
        </ThemedView>

        <ThemedView>
          <ThemedView style={styles.fieldContainer}>
            <ThemedText type="subtitle" style={styles.label}>
              Title
            </ThemedText>
            <ThemedInput
              keyboardType="twitter"
              placeholder="Enter message title"
              value={title.value}
              onChangeText={handleTitleChange}
              style={[styles.input, title.error && styles.inputError]}
            />
            {title.error ? <ThemedText style={styles.errorText}>{title.error}</ThemedText> : null}
          </ThemedView>

          <ThemedView style={styles.fieldContainer}>
            <ThemedText type="subtitle" style={styles.label}>
              Message
            </ThemedText>
            <ThemedInput
              placeholder="Enter your message"
              value={message.value}
              onChangeText={handleMessageChange}
              multiline
              numberOfLines={4}
              style={[styles.input, message.error && styles.inputError]}
            />
            {message.error ? (
              <ThemedText
                style={styles.errorText}
                darkColor={colors.semantic.error as string}
                lightColor={colors.semantic.error as string}
              >
                {message.error}
              </ThemedText>
            ) : null}
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <ThemedText style={styles.submitButtonText} type="defaultSemiBold">
            Schedule Message
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
    padding: spacing.screenPadding,
  },
  title: {
    ...globalStyles.textCenter,
    marginBottom: spacing['3xl'],
    marginTop: spacing.xl,
  },
  form: {
    ...globalStyles.flex1,
  },
  fieldContainer: {
    marginBottom: spacing.xl,
    ...globalStyles.relative,
  },
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    borderColor: colors.ui.border,
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    fontSize: spacing.lg,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: spacing.md,
    ...globalStyles.absolute,
    bottom: -spacing['2xl'],
  },
  datePicker: {
    height: spacing['10xl'],
    ...globalStyles.center,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    borderRadius: spacing.borderRadius.md,
    padding: spacing.lg,
    ...globalStyles.alignCenter,
    marginTop: spacing.xl,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[500],
  },
  submitButtonText: {
    color: colors.human.white,
    fontSize: spacing.lg,
  },
});
