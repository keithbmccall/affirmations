import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../styles/colors';
import { rightNow, twoYearsFromNow } from '../utils';
import { ThemedInput, ThemedText, ThemedView } from './shared';

interface SchedulerFormData {
  date: Date;
  title: string;
  message: string;
}

export function Scheduler() {
  const [formData, setFormData] = useState<SchedulerFormData>({
    date: new Date(),
    title: '',
    message: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleSubmit = () => {
    // Console log the form values as requested
    console.log('Scheduler Form Data:', {
      date: formData.date.toISOString(),
      title: formData.title,
      message: formData.message,
    });

    // Show a success alert
    Alert.alert(
      'Message Scheduled',
      `Your message "${formData.title}" has been scheduled for ${formData.date.toLocaleString()}`,
      [{ text: 'OK' }]
    );

    // Clear the form
    setFormData({
      date: new Date(),
      title: '',
      message: '',
    });
  };

  const isFormValid = formData.title.trim() !== '' && formData.message.trim() !== '';

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.form}>
        {/* Date Picker */}
        <ThemedView style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label}>
            Date & Time
          </ThemedText>

          <DateTimePicker
            value={formData.date}
            mode="datetime"
            display="spinner"
            onChange={handleDateChange}
            minimumDate={rightNow}
            maximumDate={twoYearsFromNow}
          />
        </ThemedView>

        {/* Title Input */}
        <ThemedView style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label}>
            Title
          </ThemedText>
          <ThemedInput
            placeholder="Enter message title"
            value={formData.title}
            onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
            style={styles.input}
          />
        </ThemedView>

        {/* Message Input */}
        <ThemedView style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label}>
            Message
          </ThemedText>
          <ThemedInput
            placeholder="Enter your message"
            value={formData.message}
            onChangeText={text => setFormData(prev => ({ ...prev, message: text }))}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.messageInput]}
          />
        </ThemedView>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <ThemedText style={styles.submitButtonText}>Schedule Message</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  } as ViewStyle,
  title: {
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  } as TextStyle,
  form: {
    flex: 1,
  } as ViewStyle,
  fieldContainer: {
    marginBottom: 20,
  } as ViewStyle,
  label: {
    marginBottom: 8,
    color: colors.text.primary,
  } as TextStyle,
  input: {
    borderColor: colors.ui.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.ui.surface,
  } as TextStyle,
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  } as TextStyle,
  dateButton: {
    borderWidth: 1,
    borderColor: colors.ui.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.ui.surface,
  } as ViewStyle,
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  } as TextStyle,
  submitButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  } as ViewStyle,
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
  } as ViewStyle,
  submitButtonText: {
    color: colors.human.white,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
});
