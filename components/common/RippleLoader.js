import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { COLORS } from "@/Themes/theme";

const RippleLoader = ({ size = 80, color = COLORS.primary }) => {
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;
  const opacity1 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createAnimation = (scale, opacity, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scale, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const anim1 = createAnimation(scale1, opacity1, 0);
    const anim2 = createAnimation(scale2, opacity2, 600);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [scale1, scale2, opacity1, opacity2]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: color,
            opacity: opacity1,
            transform: [{ scale: scale1 }],
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: color,
            opacity: opacity2,
            transform: [{ scale: scale2 }],
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
      <View
        style={[
          styles.centerDot,
          {
            backgroundColor: color,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: (size * 0.25) / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ripple: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  centerDot: {
    position: "absolute",
    alignSelf: "center",
    top: "37.5%",
  },
});

export default RippleLoader;