import { ThemedButton, ThemedInput, ThemedText, ThemedView } from '@components/shared';
import { NotificationIdentifier } from '@features/affirmations/notifications';
import { useGeneral } from '@platform';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, globalStyles, spacing } from '@styles';
import { fiveMinutesFromNow, twoYearsFromNow } from '@utils';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';

interface FormField<T> {
  value: T;
  error: string;
}

interface SchedulerProps {
  initialDate?: Date;
  initialTitle?: string;
  initialBody?: string;
  bodyLines?: number;
  enableRefreshControl?: boolean;
  submitProps?: {
    submitText: string;
    onSubmit: (values: { title: string; body: string; date: Date }) => void;
  };
  notificationId?: NotificationIdentifier;
}

export const Scheduler = ({
  initialDate = fiveMinutesFromNow,
  initialTitle = '',
  initialBody = '',
  bodyLines = 4,
  enableRefreshControl = true,
  submitProps,
  notificationId,
}: SchedulerProps) => {
  const router = useRouter();
  const { schedulePushNotification, refreshPendingNotifications, cancelPushNotification } =
    useNotificationsScheduler();
  const { isLoading, onSetLoading } = useGeneral();
  const [date, setDate] = useState<FormField<Date>>({ value: initialDate, error: '' });
  const [title, setTitle] = useState<FormField<string>>({ value: initialTitle, error: '' });
  const [message, setMessage] = useState<FormField<string>>({ value: initialBody, error: '' });

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
    if (date.value < new Date()) {
      setDate({ ...date, error: 'Date must be in the future' });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const values = {
      title: title.value,
      body: message.value,
      date: date.value,
    };
    if (submitProps?.onSubmit) {
      submitProps.onSubmit(values);
    } else {
      const notificationIdentifier = await schedulePushNotification(values);

      Alert.alert(
        'Message Scheduled',
        `Your message "${title.value}" has been scheduled for ${date.value.toLocaleString()}. Identifier: ${notificationIdentifier}`,
        [{ text: 'OK' }]
      );
    }

    // Clear the form
    setDate({ value: fiveMinutesFromNow, error: '' });
    setTitle({ value: '', error: '' });
    setMessage({ value: '', error: '' });

    if (notificationId) {
      router.back();
    }
  };

  const handleDelete = async () => {
    if (notificationId) await cancelPushNotification(notificationId);
    router.back();
  };

  const isFormValid =
    title.value.trim() !== '' && message.value.trim() !== '' && date.value > new Date();

  const onRefresh = useCallback(async () => {
    onSetLoading(true);
    setDate({ value: fiveMinutesFromNow, error: '' });
    await refreshPendingNotifications();
    setTimeout(() => onSetLoading(false), 500); // Simulate async refresh
  }, [onSetLoading, refreshPendingNotifications]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        enableRefreshControl ? (
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      <ThemedView style={styles.form}>
        <ThemedView style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label} accessibilityRole="header">
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
              testID="date-time-picker"
            />
          </ThemedView>
          {date.error ? <ThemedText style={styles.errorText}>{date.error}</ThemedText> : null}
        </ThemedView>
        <ThemedView>
          <ThemedView style={styles.fieldContainer}>
            <ThemedText type="subtitle" style={styles.label} accessibilityRole="header">
              Title
            </ThemedText>
            <ThemedInput
              keyboardType="twitter"
              placeholder="Enter message title"
              value={title.value}
              onChangeText={handleTitleChange}
              style={[styles.input, title.error && styles.inputError]}
              testID="title-input"
            />
            {title.error ? <ThemedText style={styles.errorText}>{title.error}</ThemedText> : null}
          </ThemedView>

          <ThemedView style={styles.fieldContainer}>
            <ThemedText type="subtitle" style={styles.label} accessibilityRole="header">
              Message
            </ThemedText>
            <ThemedInput
              placeholder="Enter your message"
              value={message.value}
              onChangeText={handleMessageChange}
              multiline
              numberOfLines={bodyLines}
              style={[styles.input, message.error && styles.inputError]}
              testID="message-input"
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
        <ThemedButton
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <ThemedText style={styles.submitButtonText} type="defaultSemiBold">
            {submitProps?.submitText || 'Schedule message'}
          </ThemedText>
        </ThemedButton>
        {notificationId && (
          <ThemedButton
            style={[
              styles.submitButton,
              { backgroundColor: colors.semantic.error, marginTop: spacing['2xl'] },
            ]}
            onPress={handleDelete}
          >
            <ThemedText style={styles.submitButtonText} type="defaultSemiBold">
              Delete Message
            </ThemedText>
          </ThemedButton>
        )}
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
    height: spacing['9xl'],
    ...globalStyles.flexCenter,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.lg,
    ...globalStyles.alignCenter,
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[500],
  },
  submitButtonText: {
    color: colors.human.white,
    fontSize: spacing.lg,
  },
});
