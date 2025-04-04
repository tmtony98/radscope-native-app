import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native'
type ButtonProps = {
  title: string
  onPress: () => void
  buttonStyle?: ViewStyle; 
  textStyle?: TextStyle;
}

const handleConnect = (item: any) => {
    // Implement your connection logic here
    console.log('Connecting to:', item);
  };

  export default function Button({ title, onPress, buttonStyle, textStyle }: ButtonProps) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle]}>
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }
  
  const styles = StyleSheet.create({
    button: {
      backgroundColor: '#31435E',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500', // Use '500' instead of 'medium'
    },
  });