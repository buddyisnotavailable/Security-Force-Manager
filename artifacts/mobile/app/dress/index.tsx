import { AppIcon } from "@/components/AppIcon";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import type { DressItem } from "@/constants/types";

const conditionColors: Record<DressItem["condition"], string> = {
  New: "#2E7D32",
  Good: "#1565C0",
  Worn: "#E65100",
  Damaged: "#C62828",
};

const ITEM_TYPES: DressItem["itemType"][] = ["Shirt", "Trousers", "Boots", "Belt", "Cap", "Jacket", "ID Card"];

export default function DressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dress, staff, addDressItem, updateDressItem } = useApp();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selStaff, setSelStaff] = useState(staff[0]?.id ?? "");
  const [selItem, setSelItem] = useState<DressItem["itemType"]>("Shirt");
  const [selSize, setSelSize] = useState("L");

  const filtered = dress.filter(
    (d) =>
      d.staffName.toLowerCase().includes(search.toLowerCase()) ||
      d.itemType.toLowerCase().includes(search.toLowerCase())
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleIssue = () => {
    const member = staff.find((s) => s.id === selStaff);
    if (!member) return;
    const item: DressItem = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      staffId: member.id,
      staffName: member.name,
      itemType: selItem,
      size: selSize,
      issuedDate: new Date().toISOString().split("T")[0]!,
      condition: "New",
    };
    addDressItem(item);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAdd(false);
  };

  const handleUpdateCondition = (item: DressItem) => {
    Alert.alert("Update Condition", `Update condition for ${item.itemType}?`, [
      { text: "Good", onPress: () => updateDressItem({ ...item, condition: "Good" }) },
      { text: "Worn", onPress: () => updateDressItem({ ...item, condition: "Worn" }) },
      { text: "Damaged", style: "destructive", onPress: () => updateDressItem({ ...item, condition: "Damaged" }) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: topPad + 12,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <AppIcon name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Dress Management</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAdd(true)}
          >
            <AppIcon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search staff or item..." />

        {/* Summary */}
        <View style={styles.summary}>
          {(["New", "Good", "Worn", "Damaged"] as DressItem["condition"][]).map((c) => {
            const cnt = dress.filter((d) => d.condition === c).length;
            return (
              <View key={c} style={[styles.summaryChip, { backgroundColor: conditionColors[c] + "15" }]}>
                <Text style={[styles.summaryVal, { color: conditionColors[c] }]}>{cnt}</Text>
                <Text style={[styles.summaryLabel, { color: conditionColors[c] }]}>{c}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Issue Form */}
      {showAdd && (
        <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>Issue Uniform Item</Text>
          <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Staff Member</Text>
          <View style={styles.chipRow}>
            {staff.slice(0, 6).map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, { backgroundColor: selStaff === s.id ? colors.primary : colors.muted }]}
                onPress={() => setSelStaff(s.id)}
              >
                <Text style={{ color: selStaff === s.id ? "#fff" : colors.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium" }}>
                  {s.name.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Item Type</Text>
          <View style={styles.chipRow}>
            {ITEM_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, { backgroundColor: selItem === t ? colors.primary : colors.muted }]}
                onPress={() => setSelItem(t)}
              >
                <Text style={{ color: selItem === t ? "#fff" : colors.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium" }}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Size</Text>
          <View style={styles.chipRow}>
            {["XS", "S", "M", "L", "XL", "XXL", "7", "8", "9", "10"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, { backgroundColor: selSize === s ? colors.primary : colors.muted }]}
                onPress={() => setSelSize(s)}
              >
                <Text style={{ color: selSize === s ? "#fff" : colors.mutedForeground, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formBtn, { backgroundColor: colors.muted }]}
              onPress={() => setShowAdd(false)}
            >
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handleIssue}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Issue Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 },
        ]}
        ListEmptyComponent={<EmptyState icon="package" title="No items issued" subtitle="Issue uniform items to staff" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleUpdateCondition(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: "#6A1B9A15" }]}>
              <AppIcon name="package" size={18} color="#6A1B9A" />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, { color: colors.foreground }]}>
                {item.itemType} · Size {item.size}
              </Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                {item.staffName} · Issued {item.issuedDate}
              </Text>
            </View>
            <View style={[styles.condBadge, { backgroundColor: conditionColors[item.condition] + "18" }]}>
              <Text style={[styles.condText, { color: conditionColors[item.condition] }]}>
                {item.condition}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summary: { flexDirection: "row", gap: 8, marginBottom: 8 },
  summaryChip: { flex: 1, alignItems: "center", borderRadius: 10, paddingVertical: 8 },
  summaryVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  addForm: { margin: 12, borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  formTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  formLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  formActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  formBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center", paddingHorizontal: 16 },
  list: { padding: 12, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, gap: 10 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  condBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  condText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
