import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React from 'react'
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type props = {
  title: string;
  showBackButton?: boolean;
}

export default function Header({ title, showBackButton = false }: props) {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <Text style={[TYPOGRAPHY.headLineMedium, { color: COLORS.text }]}>{title}</Text>
        {showBackButton && <View style={styles.placeholderRight} />}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderStyle: 'solid',
  },
  header: {
    height: 75,  // Adjust height as needed
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 10,
    padding: SPACING.xs,
  },
  placeholderRight: {
    width: 40,  // Same width as back button for balance
  },
});