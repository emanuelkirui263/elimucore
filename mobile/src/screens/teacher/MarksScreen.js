import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const EXAM_DATA = [
  { id: '1', name: 'Term 1 - Unit 1', class: 'Form 1A', subject: 'Mathematics', deadline: '2026-02-15' },
  { id: '2', name: 'Term 1 - Unit 2', class: 'Form 2B', subject: 'English', deadline: '2026-02-20' },
  { id: '3', name: 'Midterm Exam', class: 'Form 3C', subject: 'Mathematics', deadline: '2026-03-01' },
];

export default function MarksScreen() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [marks, setMarks] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleMarkChange = (studentId, value) => {
    setMarks({
      ...marks,
      [studentId]: value,
    });
  };

  const handleSubmit = async () => {
    if (!selectedExam) {
      Alert.alert('Error', 'Please select an exam');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Marks submitted successfully');
      setMarks({});
    } catch (error) {
      Alert.alert('Error', 'Failed to submit marks');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Exam/Assessment</Text>
        {EXAM_DATA.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            style={[
              styles.examCard,
              selectedExam?.id === exam.id && styles.selectedExam,
            ]}
            onPress={() => setSelectedExam(exam)}
          >
            <Text style={styles.examName}>{exam.name}</Text>
            <Text style={styles.examInfo}>{exam.subject} • {exam.class}</Text>
            <Text style={styles.deadline}>Due: {exam.deadline}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedExam && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Marks</Text>
          <View style={styles.marksForm}>
            <View style={styles.markRow}>
              <Text style={styles.studentName}>Student Name</Text>
              <TextInput
                style={styles.markInput}
                placeholder="Mark"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.markRow}>
              <Text style={styles.studentName}>Another Student</Text>
              <TextInput
                style={styles.markInput}
                placeholder="Mark"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Marks'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  examCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedExam: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A5F',
  },
  examName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  examInfo: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  deadline: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  marksForm: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentName: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  markInput: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    width: 60,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
