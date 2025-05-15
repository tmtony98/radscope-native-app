import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, TextInputProps, DefaultTheme } from 'react-native-paper';
import { COLORS, SPACING } from '../../Themes/theme'; // Adjust path as needed

// Define props, extending TextInputProps but omitting ones we set internally
type StyledTextInputProps = Omit<TextInputProps, 'mode' | 'theme'> & {
  // Add any custom props specific to your wrapper if needed
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

// Create a custom theme that extends DefaultTheme
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

export const StyledTextInput = ({ leftIcon, rightIcon, ...props }: StyledTextInputProps) => {
  return (
    <PaperTextInput
      mode="outlined" // Default mode
      label={props.label} // Pass label through
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      activeOutlineColor={COLORS.primary} // Default active color
      outlineColor={COLORS.border}      // Default inactive color
      style={[styles.input, props.style]} // Combine default styles with passed styles
      textColor={COLORS.text} // Default text color
      placeholderTextColor={COLORS.placeholder} // Use theme color for placeholder text
      theme={inputTheme} // Apply our custom theme
      left={leftIcon ? <PaperTextInput.Icon icon={() => leftIcon} /> : undefined}
      right={rightIcon ? <PaperTextInput.Icon icon={() => rightIcon} /> : undefined}
      // Spread the rest of the props
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 20, // Adjust this value to your desired border radius
   
     // Default background
 // Default margin
    // Add other default base styles here if needed, e.g., height
  },
});

export default StyledTextInput;