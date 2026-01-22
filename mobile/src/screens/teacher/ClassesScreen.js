import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

const CLASS_DATA = [
  { id: '1', name: 'Form 1A', subject: 'Mathematics', students: 40, stream: 'Science' },
  { id: '2', name: 'Form 2B', subject: 'English', students: 38, stream: 'Humanities' },
  { id: '3', name: 'Form 3C', subject: 'Mathematics', students: 42, stream: 'Science' },
  { id: '4', name: 'Form 4A', subject: 'Physics', students: 35, stream: 'Science' },
];

export default function ClassesScreen({ navigation }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setClasses(CLASS_DATA);
    setLoading(false);
  }, []);

  const renderClassCard = ({ item }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => navigation.navigate('StudentDetails', { classId: item.id })}
    >
      <View style={styles.classHeader}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.stream}>{item.stream}</Text>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      <View style={styles.classFooter}>
        <Text style={styles.studentCount}>👥 {item.students} students</Text>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      ) : (
        <FlatList
          data={classes}
          renderItem={renderClassCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  classCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stream: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  subject: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 12,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  arrow: {
    fontSize: 16,
    color: '#3B82F6',
  },
});
