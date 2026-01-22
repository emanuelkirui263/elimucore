import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const REPORT_DATA = [
  {
    id: '1',
    title: 'Class Performance Analysis',
    date: '2026-01-20',
    students: 'Form 1A',
    metrics: ['Average: 72%', 'Pass Rate: 85%'],
  },
  {
    id: '2',
    title: 'Unit Test Results',
    date: '2026-01-18',
    students: 'Form 2B',
    metrics: ['Average: 68%', 'Pass Rate: 78%'],
  },
  {
    id: '3',
    title: 'Attendance Report',
    date: '2026-01-15',
    students: 'All Classes',
    metrics: ['Attendance: 92%', 'Absence Rate: 8%'],
  },
];

export default function ReportsScreen() {
  const [reports, setReports] = useState(REPORT_DATA);

  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDate}>{item.date}</Text>
      </View>
      <Text style={styles.reportClass}>{item.students}</Text>
      <View style={styles.metricsContainer}>
        {item.metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <Text style={styles.metricText}>• {metric}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Full Report →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  reportDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  reportClass: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 12,
  },
  metricsContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  metricItem: {
    marginVertical: 4,
  },
  metricText: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  viewButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
});
