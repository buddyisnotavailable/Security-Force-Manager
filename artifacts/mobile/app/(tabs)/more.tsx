import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
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

interface MenuItem {
  label: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  route: string;
  badge?: string;
}

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dress, salary } = useApp();

  const pendingSalary = salary.filter((s) => s.status === "pending").length;
  const damagedDress = dress.filter((d) => d.condition === "Damaged").length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const menu: MenuItem[] = [
    {
      label: "Dress Management",
      subtitle: "Uniform & equipment issuance",
      icon: "package",
      color: "#6A1B9A",
      route: "/dress",
      badge: damagedDress > 0 ? `${damagedDress} damaged` : undefined,
    },
    {
      label: "Salary Management",
      subtitle: "Monthly payroll & disbursements",
      icon: "credit-card",
      color: "#00695C",
      route: "/salary",
      badge: pendingSalary > 0 ? `${pendingSalary} pending` : undefined,
    },
  ];

  const quickStats = [
    { label: "Total Uniforms", value: dress.length, icon: "package" as const, color: "#6A1B9A" },
    { label: "Salary Pending", value: pendingSalary, icon: "clock" as const, color: "#E65100" },
    { label: "Salary Paid", value: salary.filter((s) => s.status === "paid").length, icon: "check-circle" as const, color: "#2E7D32" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>More</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>Manage uniforms & payroll</Text>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {quickStats.map((s) => (
          <View
            key={s.label}
            style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: s.color + "15" }]}>
              <Feather name={s.icon} size={16} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Modules</Text>

      {menu.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push(item.route as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
            <Feather name={item.icon} size={22} color={item.color} />
          </View>
          <View style={styles.menuText}>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
          </View>
          {item.badge ? (
            <View style={[styles.badge, { backgroundColor: colors.accent + "20" }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>{item.badge}</Text>
            </View>
          ) : null}
          <Feather name="chevron-right" size={18} color={colors.border} />
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Agency</Text>
      <View style={[styles.agencyCard, { backgroundColor: colors.primary }]}>
        <View style={styles.agencyHeader}>
          <Feather name="shield" size={28} color="#fff" />
          <View>
            <Text style={styles.agencyName}>SecureForce India Pvt. Ltd.</Text>
            <Text style={styles.agencyTagline}>Protecting what matters most</Text>
          </View>
        </View>
        <View style={[styles.agencyDivider, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
        <View style={styles.agencyInfo}>
          <View style={styles.agencyInfoItem}>
            <Feather name="award" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.agencyInfoText}>PSARA Licensed</Text>
          </View>
          <View style={styles.agencyInfoItem}>
            <Feather name="map-pin" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.agencyInfoText}>Pan India Operations</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 12 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  agencyCard: { borderRadius: 16, padding: 18 },
  agencyHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  agencyName: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  agencyTagline: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  agencyDivider: { height: 1, marginVertical: 14 },
  agencyInfo: { flexDirection: "row", gap: 20 },
  agencyInfoItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  agencyInfoText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_500Medium" },
});
