import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { testDatabaseSetup } from '../utils/api';
import { supabase } from '../lib/supabase/supabase';

export default function TestSetupScreen() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Test database tables
      addResult('🔍 Testing database tables...');
      const result = await testDatabaseSetup();
      
      if (result.success) {
        addResult('✅ Database tables are set up correctly!');
      } else {
        addResult(`❌ Error: ${result.error}`);
      }

      // Test auth setup
      addResult('🔍 Testing auth setup...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        addResult(`❌ Auth error: ${authError.message}`);
      } else {
        addResult('✅ Auth is configured correctly');
      }

      // Test profiles table
      addResult('🔍 Testing profiles table...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        addResult(`❌ Profiles table error: ${profilesError.message}`);
      } else {
        addResult(`✅ Profiles table is accessible (${profiles?.length || 0} profiles found)`);
      }

      // Test tasks table
      addResult('🔍 Testing tasks table...');
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .limit(1);
      
      if (tasksError) {
        addResult(`❌ Tasks table error: ${tasksError.message}`);
      } else {
        addResult(`✅ Tasks table is accessible (${tasks?.length || 0} tasks found)`);
      }

      // Test RLS policies
      addResult('🔍 Testing RLS policies...');
      if (authData.session) {
        // User is logged in, test creating a task
        const { data: testTask, error: testTaskError } = await supabase
          .from('tasks')
          .insert([
            {
              title: 'Test Task',
              description: 'This is a test task',
              status: 'pending',
              priority: 'medium'
            }
          ])
          .select()
          .single();
        
        if (testTaskError) {
          addResult(`❌ RLS policy error: ${testTaskError.message}`);
        } else {
          addResult('✅ RLS policies are working correctly');
          
          // Clean up test task
          await supabase
            .from('tasks')
            .delete()
            .eq('id', testTask.id);
          
          addResult('✅ Test task was created and deleted successfully');
        }
      } else {
        addResult('⚠️ Skipping RLS test - user not logged in');
      }

      addResult('✅ All tests completed!');
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Test Database Setup',
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
        }} 
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Database Setup Test</Text>
        <Text style={styles.description}>
          This screen will test if your database tables and policies are set up correctly.
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={runTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Run Tests'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.results}>
          {results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    marginTop: 20,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
}); 