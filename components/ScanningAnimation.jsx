import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line, G, Path, Rect } from 'react-native-svg';
import { COLORS } from '@/Themes/theme';

const ScanningAnimation = ({
  text = "Scanning for new devices...",
  size = 150,
  color = COLORS.primary,
  bgColor = COLORS.background,
}) => {
  // Radar sweep rotation
  const rotation = useSharedValue(0);

  // Sonar ripple
  const rippleScale = useSharedValue(0.5);
  const rippleOpacity = useSharedValue(0.7);

  // Center coordinates
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.45;
  const gridSpacing = size / 10;

  useEffect(() => {
    // Radar sweep
    rotation.value = withRepeat(
      withTiming(360, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );
    // Sonar ripple
    rippleScale.value = withRepeat(
      withTiming(1.2, { duration: 1200, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    rippleOpacity.value = withRepeat(
      withTiming(0, { duration: 1200, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
  }, []);

  // Animated styles
  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: centerX - radius,
    top: centerY - radius,
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: color,
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  // Concentric circles
  const createConcentricCircles = () => {
    const circles = [];
    const numCircles = 4;
    for (let i = 1; i <= numCircles; i++) {
      const currentRadius = (radius / numCircles) * i;
      circles.push(
        <Circle
          key={`circle-${i}`}
          cx={centerX}
          cy={centerY}
          r={currentRadius}
          stroke={color}
          strokeWidth="1"
          opacity="0.25"
          fill="none"
        />
      );
    }
    return circles;
  };

  // Grid lines
  const createGridLines = () => {
    const lines = [];
    const numLines = Math.floor(size / gridSpacing);
    for (let i = 0; i <= numLines; i++) {
      const y = i * gridSpacing;
      lines.push(
        <Line
          key={`h-line-${i}`}
          x1="0"
          y1={y}
          x2={size}
          y2={y}
          stroke={color}
          strokeWidth="0.5"
          opacity="0.12"
        />
      );
    }
    for (let i = 0; i <= numLines; i++) {
      const x = i * gridSpacing;
      lines.push(
        <Line
          key={`v-line-${i}`}
          x1={x}
          y1="0"
          x2={x}
          y2={size}
          stroke={color}
          strokeWidth="0.5"
          opacity="0.12"
        />
      );
    }
    return lines;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.animationContainer, { width: size, height: size }]}>
        {/* SVG Radar Background */}
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Rect x="0" y="0" width={size} height={size} fill={bgColor} />
          <G>{createGridLines()}</G>
          <G>{createConcentricCircles()}</G>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={color}
            strokeWidth="1.5"
            opacity="0.5"
            fill="none"
          />
        </Svg>
        {/* Sonar Ripple */}
        <Animated.View style={rippleStyle} />
        {/* Radar Sweep */}
        <Animated.View style={[styles.radarContainer, rotatingStyle]}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Path
              d={`M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX + radius * 0.7} ${centerY - radius * 0.7} Z`}
              fill={color}
              opacity="0.25"
            />
          </Svg>
        </Animated.View>
        {/* Glowing Center Dot */}
        <View
          style={{
            position: 'absolute',
            left: centerX - size * 0.06,
            top: centerY - size * 0.06,
            width: size * 0.12,
            height: size * 0.12,
            borderRadius: size * 0.06,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.7,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          }}
        />
      </View>
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    overflow: 'hidden',
  },
  radarContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 18,
    color: COLORS.primary || '#31435E',
    letterSpacing: 0.2,
  },
});

export default ScanningAnimation;
