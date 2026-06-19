import { AppIcon } from "@/components/AppIcon";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

const PIN_LENGTH = 4;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, hasPin } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasPin) {
      router.replace("/(auth)/setup");
    }
  }, [hasPin]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleVerify(pin);
    }
  }, [pin]);

  useEffect(() => {
    return () => {
      if (lockTimer.current) clearInterval(lockTimer.current);
    };
  }, []);

  const handleVerify = async (enteredPin: string) => {
    const success = await login(enteredPin);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(true);
      setPin("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();

      if (newAttempts >= 5) {
        const secs = 30;
        setLocked(true);
        setLockSeconds(secs);
        lockTimer.current = setInterval(() => {
          setLockSeconds((s) => {
            if (s <= 1) {
              clearInterval(lockTimer.current!);
              setLocked(false);
              setAttempts(0);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      }

      setTimeout(() => setError(false), 600);
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = (val: string) => {
    if (locked) return;
    if (pin.length < PIN_LENGTH) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPin((p) => p + val);
    }
  };

  const handleDelete = () => {
    if (locked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin((p) => p.slice(0, -1));
  };

  const topPad = Platform.OS === "web" ? 24 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad + 16 }]}>
      {/* Logo area */}
      <View style={styles.top}>
        <View style={styles.shieldWrap}>
          <AppIcon name="shield" size={44} color="#FFB300" />
        </View>
        <Text style={styles.appName}>SecureForce India</Text>
        <Text style={styles.subtitle}>Manager Access</Text>
      </View>

      {/* PIN dots */}
      <View style={styles.middle}>
        <Text style={styles.prompt}>
          {locked ? `Too many attempts. Wait ${lockSeconds}s` : error ? "Incorrect PIN" : "Enter your PIN"}
        </Text>

        <Animated.View
          style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < pin.length && styles.dotFilled,
                error && styles.dotError,
              ]}
            />
          ))}
        </Animated.View>

        {attempts > 0 && !locked && (
          <Text style={styles.attemptsText}>
            {5 - attempts} attempt{5 - attempts !== 1 ? "s" : ""} remaining
          </Text>
        )}
      </View>

      {/* Numpad */}
      <View style={styles.numpad}>
        {[["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]].map((row) => (
          <View key={row.join()} style={styles.numRow}>
            {row.map((n) => (
              <NumKey key={n} value={n} onPress={handlePress} disabled={locked} />
            ))}
          </View>
        ))}
        <View style={styles.numRow}>
          <View style={styles.numKey} />
          <NumKey value="0" onPress={handlePress} disabled={locked} />
          <TouchableOpacity
            style={styles.numKey}
            onPress={handleDelete}
            disabled={locked || pin.length === 0}
            activeOpacity={0.6}
          >
            <AppIcon name="delete" size={22} color={pin.length > 0 ? "#fff" : "rgba(255,255,255,0.3)"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot PIN */}
      <TouchableOpacity
        style={styles.forgotBtn}
        onPress={() =>
          require("react-native").Alert.alert(
            "Forgot PIN?",
            "Please contact your agency administrator to reset access.",
            [{ text: "OK" }]
          )
        }
      >
        <Text style={styles.forgotText}>Forgot PIN?</Text>
      </TouchableOpacity>
    </View>
  );
}

function NumKey({
  value,
  onPress,
  disabled,
}: {
  value: string;
  onPress: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.numKey}
      onPress={() => onPress(value)}
      disabled={disabled}
      activeOpacity={0.6}
    >
      <Text style={[styles.numText, disabled && { opacity: 0.4 }]}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D47A1",
    alignItems: "center",
    justifyContent: "space-between",
  },
  top: {
    alignItems: "center",
    paddingTop: 32,
    gap: 8,
  },
  shieldWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  middle: {
    alignItems: "center",
    gap: 20,
  },
  prompt: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 20,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: "#FFB300",
    borderColor: "#FFB300",
  },
  dotError: {
    borderColor: "#EF9A9A",
    backgroundColor: "#EF9A9A",
  },
  attemptsText: {
    color: "#EF9A9A",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  numpad: {
    gap: 8,
    paddingBottom: 8,
  },
  numRow: {
    flexDirection: "row",
    gap: 20,
  },
  numKey: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  numText: {
    color: "#fff",
    fontSize: 26,
    fontFamily: "Inter_400Regular",
  },
  forgotBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  forgotText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
