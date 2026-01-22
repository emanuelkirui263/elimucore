import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function StudentDetailsScreen({ route }) {
  const { classId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.studentCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JM</Text>
        </View>
        <Text style={styles.studentName}>John Mwangi</Text>
        <Text style={styles.admissionNo}>ADM001</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Class</Text>
          <Text style={styles.infoValue}>Form 1A</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stream</Text>
          <Text style={styles.infoValue}>Science</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Average Grade</Text>
          <Text style={styles.infoValue}>B+</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Present</Text>
          <Text style={styles.infoValue}>38 days</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Absent</Text>
          <Text style={styles.infoValue}>2 days</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Attendance Rate</Text>
          <Text style={styles.infoValue}>95%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Marks</Text>
        <View style={styles.markItem}>
          <Text style={styles.markSubject}>Mathematics</Text>
          <Text style={styles.markScore}>78/100</Text>
        </View>
        <View style={styles.markItem}>
          <Text style={styles.markSubject}>English</Text>
          <Text style={styles.markScore}>82/100</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  studentCard: {
    backgroundColor: '#1E293B',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  admissionNo: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  markItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  markSubject: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  markScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
