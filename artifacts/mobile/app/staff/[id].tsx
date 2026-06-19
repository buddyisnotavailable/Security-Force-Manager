import { AppIcon, type AppIconName } from "@/components/AppIcon";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

const statusColors: Record<string, string> = {
  active: "#2E7D32",
  inactive: "#9E9E9E",
  "on-leave": "#E65100",
};

export default function StaffDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const themeColors = useColors();
  const insets = useSafeAreaInsets();
  const { getStaffById, getLocationById, deleteStaff, updateStaff, attendance, dress, salary } = useApp();

  const staff = getStaffById(id ?? "");
  const location = staff ? getLocationById(staff.locationId) : undefined;
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!staff) {
    return (
      <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.mutedForeground }}>Staff not found</Text>
      </View>
    );
  }

  const staffAttendance = attendance
    .filter((a) => a.staffId === staff.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const staffDress = dress.filter((d) => d.staffId === staff.id);
  const staffSalary = salary
    .filter((s) => s.staffId === staff.id)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 3);

  const handleDelete = () => {
    Alert.alert(
      "Remove Staff",
      `Are you sure you want to remove ${staff.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            deleteStaff(staff.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ]
    );
  };

  const toggleStatus = () => {
    const next = staff.status === "active" ? "inactive" : "active";
    updateStaff({ ...staff, status: next });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const initials = staff.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: themeColors.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>{staff.name}</Text>
        <Text style={styles.heroDesig}>{staff.designation}</Text>
        <View
          style={[
            styles.heroBadge,
            { backgroundColor: statusColors[staff.status] + "30" },
          ]}
        >
          <Text style={[styles.heroBadgeText, { color: "#fff" }]}>
            {staff.status.replace("-", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <InfoRow icon="hash" label="Employee ID" value={staff.employeeId} colors={themeColors} />
          <InfoRow icon="phone" label="Phone" value={staff.phone} colors={themeColors} />
          <InfoRow icon="map-pin" label="Assigned Site" value={location?.name ?? "Unassigned"} colors={themeColors} />
          <InfoRow icon="calendar" label="Join Date" value={staff.joinDate} colors={themeColors} />
          <InfoRow
            icon="credit-card"
            label="Salary"
            value={`₹${staff.salary.toLocaleString("en-IN")}/month`}
            colors={themeColors}
          />
          <InfoRow
            icon="package"
            label="Dress Size"
            value={`${staff.dressSize} · ${staff.dressIssued ? "Issued" : "Not Issued"}`}
            colors={themeColors}
          />
        </View>

        {/* Recent Attendance */}
        {staffAttendance.length > 0 && (
          <>
            <Text style={[styles.section, { color: themeColors.foreground }]}>Recent Attendance</Text>
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              {staffAttendance.map((a) => (
                <View key={a.id} style={styles.attRow}>
                  <View
                    style={[
                      styles.attDot,
                      {
                        backgroundColor:
                          a.status === "present"
                            ? "#2E7D32"
                            : a.status === "late"
                            ? "#E65100"
                            : "#D32F2F",
                      },
                    ]}
                  />
                  <Text style={[styles.attDate, { color: themeColors.foreground }]}>{a.date}</Text>
                  <Text style={[styles.attStatus, { color: themeColors.mutedForeground }]}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    {a.checkIn ? ` · ${formatTime(a.checkIn)}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Dress Items */}
        {staffDress.length > 0 && (
          <>
            <Text style={[styles.section, { color: themeColors.foreground }]}>Uniform Items</Text>
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              {staffDress.map((d) => (
                <View key={d.id} style={styles.attRow}>
                  <AppIcon name="package" size={14} color={themeColors.primary} />
                  <Text style={[styles.attDate, { color: themeColors.foreground }]}>{d.itemType}</Text>
                  <Text style={[styles.attStatus, { color: themeColors.mutedForeground }]}>
                    Size {d.size} · {d.condition}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Salary */}
        {staffSalary.length > 0 && (
          <>
            <Text style={[styles.section, { color: themeColors.foreground }]}>Salary History</Text>
            <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              {staffSalary.map((s) => (
                <View key={s.id} style={styles.attRow}>
                  <AppIcon
                    name={s.status === "paid" ? "check-circle" : "clock"}
                    size={14}
                    color={s.status === "paid" ? "#2E7D32" : "#E65100"}
                  />
                  <Text style={[styles.attDate, { color: themeColors.foreground }]}>{s.month}</Text>
                  <Text style={[styles.attStatus, { color: themeColors.mutedForeground }]}>
                    ₹{s.netSalary.toLocaleString("en-IN")} · {s.status}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: staff.status === "active" ? "#FFF3E0" : "#E8F5E9" },
            ]}
            onPress={toggleStatus}
          >
            <AppIcon
              name={staff.status === "active" ? "user-x" : "user-check"}
              size={16}
              color={staff.status === "active" ? "#E65100" : "#2E7D32"}
            />
            <Text
              style={[
                styles.actionText,
                { color: staff.status === "active" ? "#E65100" : "#2E7D32" },
              ]}
            >
              {staff.status === "active" ? "Mark Inactive" : "Mark Active"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#FFEBEE" }]}
            onPress={handleDelete}
          >
            <AppIcon name="trash-2" size={16} color="#C62828" />
            <Text style={[styles.actionText, { color: "#C62828" }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors: c,
}: {
  icon: AppIconName;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.infoRow}>
      <AppIcon name={icon} size={15} color={c.primary} />
      <Text style={[styles.infoLabel, { color: c.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.foreground }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    paddingTop: 60,
    paddingBottom: 28,
    alignItems: "center",
    gap: 6,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  heroName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  heroDesig: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  heroBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  body: { padding: 16, gap: 0 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  section: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 8, marginTop: 4 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E4F0",
  },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", width: 110 },
  infoValue: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  attRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E4F0",
  },
  attDot: { width: 8, height: 8, borderRadius: 4 },
  attDate: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  attStatus: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
