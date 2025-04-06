import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MenuButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

const MenuButton = ({ onPress, color = '#fff', size = 24 }: MenuButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name="menu" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
  },
});

export default MenuButton; 