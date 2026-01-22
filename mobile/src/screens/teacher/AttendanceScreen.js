import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';

const STUDENT_DATA = [
  { id: '1', name: 'John Mwangi', admissionNo: 'ADM001', status: null },
  { id: '2', name: 'Jane Kipchoge', admissionNo: 'ADM002', status: null },
  { id: '3', name: 'Samuel Ochieng', admissionNo: 'ADM003', status: null },
  { id: '4', name: 'Grace Nyambura', admissionNo: 'ADM004', status: null },
];

export default function AttendanceScreen() {
  const [students, setStudents] = useState(STUDENT_DATA);
  const [submitting, setSubmitting] = useState(false);

  const toggleAttendance = (studentId) => {
    setStudents(
      students.map((student) =>
        student.id === studentId
          ? { ...student, status: student.status === 'present' ? 'absent' : 'present' }
          : student
      )
    );
  };

  const handleSubmit = async () => {
    const unmarked = students.filter((s) => s.status === null);
    if (unmarked.length > 0) {
      Alert.alert('Error', `${unmarked.length} students not marked`);
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Attendance submitted');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.studentRow}
      onPress={() => toggleAttendance(item.id)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.admissionNo}>{item.admissionNo}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          item.status === 'present' && styles.presentBadge,
          item.status === 'absent' && styles.absentBadge,
        ]}
      >
        <Text style={styles.statusText}>
          {item.status === 'present' ? '✓ Present' : item.status === 'absent' ? '✗ Absent' : 'Mark'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Present</Text>
          <Text style={[styles.summaryValue, styles.presentColor]}>{presentCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Absent</Text>
          <Text style={[styles.summaryValue, styles.absentColor]}>{absentCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Not Marked</Text>
          <Text style={[styles.summaryValue, styles.grayColor]}>
            {students.length - presentCount - absentCount}
          </Text>
        </View>
      </View>

      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.studentList}
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Submitting...' : 'Submit Attendance'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summary: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  presentColor: {
    color: '#10B981',
  },
  absentColor: {
    color: '#EF4444',
  },
  grayColor: {
    color: '#94A3B8',
  },
  studentList: {
    flex: 1,
    marginBottom: 16,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  admissionNo: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  presentBadge: {
    backgroundColor: '#10B98130',
  },
  absentBadge: {
    backgroundColor: '#EF444430',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
