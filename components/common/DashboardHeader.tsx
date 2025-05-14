import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { COLORS, TYPOGRAPHY, SPACING } from '@/Themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  title: string;
  showBackButton?: boolean;
}

const DashboardHeader: React.FC<Props> = ({ title, showBackButton = false }) => {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container]}> 
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
        <Text style={[TYPOGRAPHY.headLineMedium, { color: COLORS.primary }]}>{title}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    zIndex: 10,
    marginTop:50,
  },
  header: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 10,
  },
});

export default DashboardHeader;