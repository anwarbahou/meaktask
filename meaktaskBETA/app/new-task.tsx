import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { taskService } from '../utils/api';
import { Database } from '../lib/supabase/types';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

export default function NewTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);

    try {
      const newTask: Omit<TaskInsert, 'user_id' | 'created_at'> = {
        title: title.trim(),
        description: description.trim() || null,
        status: 'pending',
        priority,
        due_date: null
      };

      await taskService.createTask(newTask);
      
      // Navigate back to tasks screen
      router.back();
    } catch (error: any) {
      console.error('Error creating task:', error);
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen 
        options={{ 
          title: 'New Task',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#3b8a7a" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === 'low' && styles.priorityButtonActive,
                  { backgroundColor: priority === 'low' ? '#e9ecef' : '#f8f9fa' }
                ]}
                onPress={() => setPriority('low')}
              >
                <Text style={[
                  styles.priorityText,
                  priority === 'low' && styles.priorityTextActive
                ]}>Low</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === 'medium' && styles.priorityButtonActive,
                  { backgroundColor: priority === 'medium' ? '#e9ecef' : '#f8f9fa' }
                ]}
                onPress={() => setPriority('medium')}
              >
                <Text style={[
                  styles.priorityText,
                  priority === 'medium' && styles.priorityTextActive
                ]}>Medium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === 'high' && styles.priorityButtonActive,
                  { backgroundColor: priority === 'high' ? '#e9ecef' : '#f8f9fa' }
                ]}
                onPress={() => setPriority('high')}
              >
                <Text style={[
                  styles.priorityText,
                  priority === 'high' && styles.priorityTextActive
                ]}>High</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTask}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212529',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    color: '#212529',
  },
  textArea: {
    height: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  priorityButtonActive: {
    borderWidth: 1,
    borderColor: '#3b8a7a',
  },
  priorityText: {
    fontSize: 16,
    color: '#6c757d',
  },
  priorityTextActive: {
    color: '#3b8a7a',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#3b8a7a',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 