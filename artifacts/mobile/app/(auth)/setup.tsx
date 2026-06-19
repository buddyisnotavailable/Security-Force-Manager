import { Feather } from "@expo/vector-icons";
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
type Step = "create" | "confirm";

export default function SetupPinScreen() {
  const insets = useSafeAreaInsets();
  const { setupPin, hasPin } = useAuth();
  const [step, setStep] = useState<Step>("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasPin) {
      router.replace("/(auth)/login");
    }
  }, [hasPin]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      if (step === "create") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setFirstPin(pin);
        setPin("");
        setStep("confirm");
      } else {
        if (pin === firstPin) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setupPin(pin).then(() => router.replace("/(tabs)/"));
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError(true);
          setPin("");
          shake();
          setTimeout(() => {
            setError(false);
            setStep("create");
            setFirstPin("");
          }, 900);
        }
      }
    }
  }, [pin]);

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
    if (pin.length < PIN_LENGTH) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPin((p) => p + val);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin((p) => p.slice(0, -1));
  };

  const topPad = Platform.OS === "web" ? 24 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad + 16 }]}>
      <View style={styles.top}>
        <View style={styles.shieldWrap}>
          <Feather name="shield" size={44} color="#FFB300" />
        </View>
        <Text style={styles.appName}>SecureForce India</Text>
        <Text style={styles.setupTag}>Setup Manager PIN</Text>
      </View>

      <View style={styles.stepsRow}>
        <View style={[styles.stepDot, { backgroundColor: "#FFB300" }]} />
        <View style={[styles.stepLine, { backgroundColor: step === "confirm" ? "#FFB300" : "rgba(255,255,255,0.2)" }]} />
        <View style={[styles.stepDot, { backgroundColor: step === "confirm" ? "#FFB300" : "rgba(255,255,255,0.2)" }]} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.prompt}>
          {error
            ? "PINs don't match — try again"
            : step === "create"
            ? "Choose a 4-digit PIN"
            : "Confirm your PIN"}
        </Text>
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
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
        {step === "create" && (
          <Text style={styles.hintText}>
            This PIN protects access to the manager app
          </Text>
        )}
      </View>

      <View style={styles.numpad}>
        {[["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]].map((row) => (
          <View key={row.join()} style={styles.numRow}>
            {row.map((n) => (
              <NumKey key={n} value={n} onPress={handlePress} />
            ))}
          </View>
        ))}
        <View style={styles.numRow}>
          <View style={styles.numKeyEmpty} />
          <NumKey value="0" onPress={handlePress} />
          <TouchableOpacity
            style={styles.numKey}
            onPress={handleDelete}
            disabled={pin.length === 0}
            activeOpacity={0.6}
          >
            <Feather
              name="delete"
              size={22}
              color={pin.length > 0 ? "#fff" : "rgba(255,255,255,0.3)"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottom}>
        <Feather name="lock" size={14} color="rgba(255,255,255,0.4)" />
        <Text style={styles.securityNote}>PIN is stored securely on this device</Text>
      </View>
    </View>
  );
}

function NumKey({ value, onPress }: { value: string; onPress: (v: string) => void }) {
  return (
    <TouchableOpacity style={styles.numKey} onPress={() => onPress(value)} activeOpacity={0.6}>
      <Text style={styles.numText}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A2463",
    alignItems: "center",
    justifyContent: "space-between",
  },
  top: { alignItems: "center", paddingTop: 24, gap: 6 },
  shieldWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  setupTag: {
    color: "#FFB300",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  stepsRow: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { width: 48, height: 2, marginHorizontal: 6 },
  middle: { alignItems: "center", gap: 20 },
  prompt: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  dotsRow: { flexDirection: "row", gap: 20 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
  },
  dotFilled: { backgroundColor: "#FFB300", borderColor: "#FFB300" },
  dotError: { borderColor: "#EF9A9A", backgroundColor: "#EF9A9A" },
  hintText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  numpad: { gap: 8 },
  numRow: { flexDirection: "row", gap: 20 },
  numKey: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  numKeyEmpty: { width: 78, height: 78 },
  numText: { color: "#fff", fontSize: 26, fontFamily: "Inter_400Regular" },
  bottom: { flexDirection: "row", alignItems: "center", gap: 6 },
  securityNote: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
