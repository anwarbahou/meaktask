import React from 'react';
import { View, StyleSheet } from 'react-native';
import MenuButton from './MenuButton';

interface HeaderLeftProps {
  onMenuPress: () => void;
  color?: string;
}

const HeaderLeft = ({ onMenuPress, color }: HeaderLeftProps) => {
  return (
    <View style={styles.container}>
      <MenuButton onPress={onMenuPress} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
  },
});

export default HeaderLeft; 