import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, globalStyles, spacing } from '../styles';
import { fiveMinutesFromNow, twoYearsFromNow } from '../utils';
import { ThemedInput, ThemedText, ThemedView } from './shared';

interface FormField<T> {
  value: T;
  error: string;
}

export function Scheduler() {
  const [date, setDate] = useState<FormField<Date>>({ value: fiveMinutesFromNow, error: '' });
  const [title, setTitle] = useState<FormField<string>>({ value: '', error: '' });
  const [message, setMessage] = useState<FormField<string>>({ value: '', error: '' });

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
    if (messageValue.length < 8) {
      setMessage({ ...message, error: 'Message needs to be at least 8 characters' });
      isValid = false;
    }

    // Validate date (ensure it's in the future)
    if (date.value <= new Date()) {
      setDate({ ...date, error: 'Date must be in the future' });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Console log the form values as requested
    console.log('Scheduler Form Data:', {
      date: date.value.toISOString(),
      title: title.value,
      message: message.value,
    });

    Alert.alert(
      'Message Scheduled',
      `Your message "${title.value}" has been scheduled for ${date.value.toLocaleString()}`,
      [{ text: 'OK' }]
    );

    // Clear the form
    setDate({ value: fiveMinutesFromNow, error: '' });
    setTitle({ value: '', error: '' });
    setMessage({ value: '', error: '' });
  };

  const isFormValid =
    title.value.trim() !== '' && message.value.trim() !== '' && date.value > new Date();

  return (
    <ThemedView style={styles.container}>
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
              <ThemedText style={styles.errorText}>{message.error}</ThemedText>
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
    </ThemedView>
  );
}

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
    color: colors.text.primary,
  },
  input: {
    borderColor: colors.ui.border,
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    fontSize: spacing.lg,
    backgroundColor: colors.ui.surface,
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
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    color: colors.human.white,
    fontSize: spacing.lg,
  },
});
