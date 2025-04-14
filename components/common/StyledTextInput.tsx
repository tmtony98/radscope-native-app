import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, TextInputProps } from 'react-native-paper';
import { COLORS, SPACING } from '../../Themes/theme'; // Adjust path as needed

// Define props, extending TextInputProps but omitting ones we set internally
type StyledTextInputProps = Omit<TextInputProps, 'mode' | 'theme'> & {
  // Add any custom props specific to your wrapper if needed
};

export const StyledTextInput = (props: StyledTextInputProps) => {
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