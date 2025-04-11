import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { taskService } from '../utils/api';
import { Database } from '../lib/supabase/types';

// Get status bar height for proper UI positioning
const STATUS_BAR_HEIGHT = Constants.statusBarHeight || 0;

// Define Task type from Supabase
type Task = Database['public']['Tables']['tasks']['Row'];

// TaskItem component to ensure proper text rendering
const TaskItem = ({ item, onToggle, onDelete }: { 
  item: Task; 
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}) => (
  <View style={styles.taskItem}>
    <TouchableOpacity 
      style={styles.checkbox}
      onPress={() => onToggle(item.id, item.status !== 'completed')}
    >
      {item.status === 'completed' ? (
        <Ionicons name="checkmark-circle" size={24} color="#3b8a7a" />
      ) : (
        <Ionicons name="ellipse-outline" size={24} color="#999" />
      )}
    </TouchableOpacity>
    <Text style={[
      styles.taskTitle, 
      item.status === 'completed' && styles.taskCompleted
    ]}>
      {item.title}
    </Text>
    <TouchableOpacity 
      style={styles.deleteButton}
      onPress={() => onDelete(item.id)}
    >
      <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
    </TouchableOpacity>
  </View>
);

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (id: string, completed: boolean) => {
    try {
      const updatedTask = await taskService.updateTask(id, {
        status: completed ? 'completed' : 'pending'
      });
      
      if (updatedTask) {
        setTasks(tasks.map(task => 
          task.id === id ? updatedTask : task
        ));
      }
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.message || 'Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const success = await taskService.deleteTask(id);
      
      if (success) {
        setTasks(tasks.filter(task => task.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError(err.message || 'Failed to delete task');
    }
  };

  const HeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Tasks</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/new-task')}
      >
        <Ionicons name="add-circle" size={24} color="#3b8a7a" />
      </TouchableOpacity>
    </View>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="list-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No tasks yet</Text>
      <TouchableOpacity 
        style={styles.addFirstButton}
        onPress={() => router.push('/new-task')}
      >
        <Text style={styles.addFirstButtonText}>Add your first task</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      <HeaderComponent />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b8a7a" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchTasks}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <TaskItem 
              item={item} 
              onToggle={toggleTaskStatus}
              onDelete={deleteTask}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyComponent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: STATUS_BAR_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  addButton: {
    padding: 5,
  },
  listContent: {
    flexGrow: 1,
    padding: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 15,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 10,
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: '#3b8a7a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b8a7a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 