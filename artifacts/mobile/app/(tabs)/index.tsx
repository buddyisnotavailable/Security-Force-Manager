import React, { useMemo } from "react";
import { AppIcon } from "@/components/AppIcon";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { StatCard } from "@/components/StatCard";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { staff, locations, getTodayAttendance, salary } = useApp();

  const todayAttendance = getTodayAttendance();

  const stats = useMemo(() => {
    const activeStaff = staff.filter((s) => s.status === "active").length;
    const presentToday = todayAttendance.filter((a) => a.status === "present" || a.status === "late").length;
    const absentToday = todayAttendance.filter((a) => a.status === "absent").length;
    const pendingSalary = salary.filter((s) => s.status === "pending").length;
    const activeLocations = locations.filter((l) => l.active).length;
    const onLeave = staff.filter((s) => s.status === "on-leave").length;
    return { activeStaff, presentToday, absentToday, pendingSalary, activeLocations, onLeave };
  }, [staff, todayAttendance, salary, locations]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
          paddingBottom: 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good {getTimeOfDay()}
          </Text>
          <Text style={[styles.agencyName, { color: colors.foreground }]}>
            SecureForce India
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>
        <View style={[styles.shieldBadge, { backgroundColor: colors.primary }]}>
          <AppIcon name="shield" size={22} color="#fff" />
        </View>
      </View>

      {/* Attendance Banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerLabel}>Today's Attendance</Text>
          <View style={styles.bannerRow}>
            <Text style={styles.bannerBig}>{stats.presentToday}</Text>
            <Text style={styles.bannerSub}> / {staff.length} staff</Text>
          </View>
        </View>
        <View style={styles.bannerRight}>
          <View style={styles.bannerMini}>
            <AppIcon name="check-circle" size={14} color="#A5D6A7" />
            <Text style={styles.bannerMiniText}>{stats.presentToday} Present</Text>
          </View>
          <View style={styles.bannerMini}>
            <AppIcon name="x-circle" size={14} color="#EF9A9A" />
            <Text style={styles.bannerMiniText}>{stats.absentToday} Absent</Text>
          </View>
          <View style={styles.bannerMini}>
            <AppIcon name="clock" size={14} color="#FFE082" />
            <Text style={styles.bannerMiniText}>{stats.onLeave} On Leave</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Staff"
          value={staff.length}
          icon="users"
          color={colors.primary}
          subtitle="Deployed"
        />
        <StatCard
          label="Active Sites"
          value={stats.activeLocations}
          icon="map-pin"
          color="#00897B"
          subtitle="Locations"
        />
      </View>
      <View style={[styles.statsGrid, { marginTop: 8 }]}>
        <StatCard
          label="Salary Pending"
          value={stats.pendingSalary}
          icon="credit-card"
          color={colors.accent}
          subtitle="This month"
        />
        <StatCard
          label="On Leave"
          value={stats.onLeave}
          icon="user-x"
          color={colors.warning}
          subtitle="Currently"
        />
      </View>

      {/* Recent Activity */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20 }]}>
        Recent Attendance
      </Text>
      {todayAttendance.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <AppIcon name="clock" size={24} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No attendance recorded today
          </Text>
        </View>
      ) : (
        todayAttendance.slice(0, 5).map((a) => (
          <View
            key={a.id}
            style={[styles.activityRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    a.status === "present"
                      ? colors.success
                      : a.status === "late"
                      ? colors.accent
                      : colors.destructive,
                },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.activityName, { color: colors.foreground }]}>{a.staffName}</Text>
              <Text style={[styles.activitySub, { color: colors.mutedForeground }]}>
                {a.locationName} · {a.checkIn ? formatTime(a.checkIn) : "Not checked in"}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    a.status === "present"
                      ? "#E8F5E9"
                      : a.status === "late"
                      ? "#FFF8E1"
                      : "#FFEBEE",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  {
                    color:
                      a.status === "present"
                        ? "#2E7D32"
                        : a.status === "late"
                        ? "#E65100"
                        : "#C62828",
                  },
                ]}
              >
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  agencyName: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 2 },
  date: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  shieldBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerLeft: {},
  bannerLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_500Medium" },
  bannerRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  bannerBig: { color: "#fff", fontSize: 42, fontFamily: "Inter_700Bold" },
  bannerSub: { color: "rgba(255,255,255,0.75)", fontSize: 15, fontFamily: "Inter_500Medium" },
  bannerRight: { gap: 8 },
  bannerMini: { flexDirection: "row", alignItems: "center", gap: 6 },
  bannerMiniText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  statsGrid: { flexDirection: "row", gap: 10 },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  activityName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  activitySub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
