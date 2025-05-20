import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, TextInputProps, DefaultTheme } from 'react-native-paper';
import { COLORS, SPACING } from '../../Themes/theme';

// Define props for decimal input
type StyledDecimalInputProps = Omit<TextInputProps, 'mode' | 'theme' | 'keyboardType'> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onDecimalChange?: (value: number | null) => void;
  decimalPlaces?: number;
};

// Custom theme
const inputTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    accent: COLORS.primary,
    background: COLORS.white,
    text: COLORS.text,
    placeholder: COLORS.placeholder,
  },
};

const StyledDecimalInput = ({ 
  leftIcon, 
  rightIcon, 
  onDecimalChange,
  decimalPlaces = 3,
  value,
  onChangeText,
  ...props 
}: StyledDecimalInputProps) => {
  
  // Internal state to handle the text input
  const [inputText, setInputText] = useState(value?.toString() || '');
  
  // Update internal state when value prop changes
  useEffect(() => {
    setInputText(value?.toString() || '');
  }, [value]);
  
  // Handle text changes
  const handleTextChange = (text: string) => {
    // Allow only numbers and a single decimal point
    // Replace any commas with periods for locales that use commas
    let sanitized = text.replace(/,/g, '.');
    
    // Ensure only one decimal point
    const decimalCount = (sanitized.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = sanitized.split('.');
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Only allow digits and at most one decimal point
    sanitized = sanitized.replace(/[^\d.]/g, '');
    
    // Update internal state
    setInputText(sanitized);
    
    // Call original onChangeText if provided
    if (onChangeText) {
      onChangeText(sanitized);
    }
    
    // Parse and call the decimal change handler
    if (onDecimalChange) {
      if (sanitized === '' || sanitized === '.') {
        onDecimalChange(null);
      } else {
        const numValue = parseFloat(sanitized);
        if (!isNaN(numValue)) {
          onDecimalChange(numValue);
        }
      }
    }
  };
  
  return (
    <PaperTextInput
      mode="outlined"
      label={props.label}
      value={inputText}
      onChangeText={handleTextChange}
      placeholder={props.placeholder}
      activeOutlineColor={COLORS.primary}
      outlineColor={COLORS.border}
      style={[styles.input, props.style]}
      textColor={COLORS.text}
      placeholderTextColor={COLORS.placeholder}
      theme={inputTheme}
      keyboardType="decimal-pad"
      left={leftIcon ? <PaperTextInput.Icon icon={() => leftIcon} /> : undefined}
      right={rightIcon ? <PaperTextInput.Icon icon={() => rightIcon} /> : undefined}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },
});

export default StyledDecimalInput;
