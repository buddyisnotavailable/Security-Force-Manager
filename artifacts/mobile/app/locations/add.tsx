import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import type { Location } from "@/constants/types";

export default function AddLocationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addLocation } = useApp();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [radius, setRadius] = useState("200");

  const handleSave = () => {
    if (!name.trim() || !city.trim()) {
      return;
    }
    const loc: Location = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      latitude: 28.6139,
      longitude: 77.2090,
      radius: Number(radius) || 200,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      active: true,
    };
    addLocation(loc);
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
      <Text style={[styles.heading, { color: colors.foreground }]}>Add Location</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        Define a guard post or client site
      </Text>

      {[
        { label: "Site Name *", value: name, onChange: setName, placeholder: "Central Bank HQ" },
        { label: "Address", value: address, onChange: setAddress, placeholder: "MG Road, Connaught Place" },
        { label: "City *", value: city, onChange: setCity, placeholder: "New Delhi" },
        { label: "Contact Person", value: contactPerson, onChange: setContactPerson, placeholder: "Ramesh Kumar" },
        { label: "Contact Phone", value: contactPhone, onChange: setContactPhone, placeholder: "9876543210", keyboardType: "phone-pad" as const },
        { label: "Geo-fence Radius (meters)", value: radius, onChange: setRadius, placeholder: "200", keyboardType: "number-pad" as const },
      ].map((f) => (
        <View key={f.label}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{f.label}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={f.value}
            onChangeText={f.onChange}
            placeholder={f.placeholder}
            placeholderTextColor={colors.mutedForeground}
            keyboardType={f.keyboardType ?? "default"}
          />
        </View>
      ))}

      <View style={[styles.note, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
          GPS coordinates will auto-update when a staff member first checks in from this location.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveBtnText}>Add Location</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  note: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 20,
  },
  noteText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
