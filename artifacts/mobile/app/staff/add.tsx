import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import type { Staff } from "@/constants/types";

const DESIGNATIONS = ["Guard", "Senior Guard", "Supervisor", "Head Guard"];
const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const STATUSES = ["active", "inactive", "on-leave"] as const;

export default function AddStaffScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addStaff, locations } = useApp();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("Guard");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [dressSize, setDressSize] = useState<(typeof SIZES)[number]>("L");
  const [salary, setSalary] = useState("15000");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Required Fields", "Please fill in name and phone number.");
      return;
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      Alert.alert("Invalid Phone", "Enter a valid 10-digit phone number.");
      return;
    }

    setSaving(true);
    const emp =
      "SEC-" +
      String(Math.floor(Math.random() * 900) + 100).padStart(3, "0");

    const staff: Staff = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: name.trim(),
      employeeId: emp,
      designation,
      phone,
      locationId,
      joinDate: new Date().toISOString().split("T")[0]!,
      status: "active",
      salary: Number(salary) || 15000,
      dressSize,
      dressIssued: false,
    };

    addStaff(staff);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad, padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.heading, { color: colors.foreground }]}>Add Staff Member</Text>

      <Label colors={colors} text="Full Name *" />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
        value={name}
        onChangeText={setName}
        placeholder="Rajesh Kumar Singh"
        placeholderTextColor={colors.mutedForeground}
      />

      <Label colors={colors} text="Phone Number *" />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
        value={phone}
        onChangeText={setPhone}
        placeholder="9876543210"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <Label colors={colors} text="Designation" />
      <View style={styles.chipRow}>
        {DESIGNATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.chip,
              {
                backgroundColor: designation === d ? colors.primary : colors.muted,
              },
            ]}
            onPress={() => setDesignation(d)}
          >
            <Text style={{ color: designation === d ? "#fff" : colors.mutedForeground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label colors={colors} text="Assigned Site" />
      <View style={styles.chipRow}>
        {locations.map((l) => (
          <TouchableOpacity
            key={l.id}
            style={[
              styles.chip,
              {
                backgroundColor: locationId === l.id ? colors.primary : colors.muted,
              },
            ]}
            onPress={() => setLocationId(l.id)}
          >
            <Text style={{ color: locationId === l.id ? "#fff" : colors.mutedForeground, fontSize: 13, fontFamily: "Inter_500Medium" }}>
              {l.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label colors={colors} text="Dress Size" />
      <View style={styles.chipRow}>
        {SIZES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.chip,
              {
                backgroundColor: dressSize === s ? colors.primary : colors.muted,
              },
            ]}
            onPress={() => setDressSize(s)}
          >
            <Text style={{ color: dressSize === s ? "#fff" : colors.mutedForeground, fontSize: 13, fontFamily: "Inter_700Bold" }}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label colors={colors} text="Monthly Salary (₹)" />
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
        value={salary}
        onChangeText={setSalary}
        keyboardType="number-pad"
        placeholder="15000"
        placeholderTextColor={colors.mutedForeground}
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? "Adding..." : "Add Staff Member"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Label({ text, colors: c }: { text: string; colors: ReturnType<typeof useColors> }) {
  return <Text style={[styles.label, { color: c.mutedForeground }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 20 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
