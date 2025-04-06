import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';

// Get status bar height for proper UI positioning
const STATUS_BAR_HEIGHT = Constants.statusBarHeight || 0;

// Define Task type
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// Placeholder task data
const TASKS: Task[] = [
  { id: '1', title: 'Complete project proposal', completed: false },
  { id: '2', title: 'Schedule team meeting', completed: true },
  { id: '3', title: 'Research new technologies', completed: false },
  { id: '4', title: 'Review client feedback', completed: false },
  { id: '5', title: 'Update documentation', completed: true },
];

// TaskItem component to ensure proper text rendering
const TaskItem = ({ item }: { item: Task }) => (
  <View style={styles.taskItem}>
    <TouchableOpacity style={styles.checkbox}>
      {item.completed ? (
        <Ionicons name="checkmark-circle" size={24} color="#3b8a7a" />
      ) : (
        <Ionicons name="ellipse-outline" size={24} color="#999" />
      )}
    </TouchableOpacity>
    <Text style={[
      styles.taskTitle, 
      item.completed && styles.taskCompleted
    ]}>
      {item.title}
    </Text>
  </View>
);

export default function TasksScreen() {
  const router = useRouter();
  
  // Set status bar configuration for this screen
  useEffect(() => {
    if (Platform.OS === 'ios') {
      RNStatusBar.setBarStyle('dark-content');
    }
  }, []);
  
  // Header component for safe text rendering
  const HeaderComponent = () => (
    <Text style={styles.sectionTitle}>My Tasks</Text>
  );
  
  // Empty component for safe text rendering
  const EmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No tasks found</Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      
      {/* Simplified Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <View style={styles.content}>
        <FlatList
          data={TASKS}
          renderItem={({ item }) => <TaskItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.taskList}
          ListHeaderComponent={<HeaderComponent />}
          ListEmptyComponent={<EmptyComponent />}
        />

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: STATUS_BAR_HEIGHT, // Account for status bar height
    height: STATUS_BAR_HEIGHT + 44, // Header height + status bar
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerRightSpace: {
    width: 28,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16,
    marginTop: 16,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b8a7a',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
}); 