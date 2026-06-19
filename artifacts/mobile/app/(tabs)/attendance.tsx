import { AppIcon } from "@/components/AppIcon";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import type { AttendanceRecord, Staff } from "@/constants/types";

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { staff, locations, getTodayAttendance, markAttendance, updateAttendance } = useApp();
  const [search, setSearch] = useState("");
  const [locating, setLocating] = useState<string | null>(null);

  const todayAttendance = getTodayAttendance();
  const today = new Date().toISOString().split("T")[0]!;

  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const getRecord = (staffId: string) =>
    todayAttendance.find((a) => a.staffId === staffId);

  const handleCheckIn = async (s: Staff) => {
    const loc = locations.find((l) => l.id === s.locationId);
    if (!loc) {
      Alert.alert("No Location", "This staff member is not assigned to a location.");
      return;
    }

    setLocating(s.id);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      let verified = false;

      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          const dist = getDistanceMeters(lat, lng, loc.latitude, loc.longitude);
          verified = dist <= loc.radius;
        }
      } else {
        verified = true;
      }

      const existing = getRecord(s.id);
      const now = new Date().toISOString();
      const hour = new Date().getHours();
      const status: AttendanceRecord["status"] = hour >= 9 ? "late" : "present";

      if (!existing) {
        const record: AttendanceRecord = {
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          staffId: s.id,
          staffName: s.name,
          locationId: s.locationId,
          locationName: loc.name,
          date: today,
          checkIn: now,
          checkInLat: lat,
          checkInLng: lng,
          status,
          verifiedByLocation: verified,
        };
        markAttendance(record);
      } else if (!existing.checkOut) {
        updateAttendance({
          ...existing,
          checkOut: now,
          checkOutLat: lat,
          checkOutLng: lng,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (!verified && Platform.OS !== "web") {
        Alert.alert(
          "Location Warning",
          "Check-in recorded but you appear to be outside the site boundary.",
          [{ text: "OK" }]
        );
      }
    } catch {
      Alert.alert("Error", "Could not record attendance. Please try again.");
    } finally {
      setLocating(null);
    }
  };

  const handleMarkAbsent = (s: Staff) => {
    const loc = locations.find((l) => l.id === s.locationId);
    const existing = getRecord(s.id);
    if (existing) return;
    const record: AttendanceRecord = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      staffId: s.id,
      staffName: s.name,
      locationId: s.locationId,
      locationName: loc?.name ?? "Unknown",
      date: today,
      status: "absent",
      verifiedByLocation: false,
    };
    markAttendance(record);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
        <Text style={[styles.title, { color: colors.foreground }]}>Attendance</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {today} · {todayAttendance.filter((a) => a.status !== "absent").length}/{staff.length} present
        </Text>
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search staff..." />
        </View>
      </View>

      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: 24,
          },
        ]}
        ListEmptyComponent={<EmptyState icon="users" title="No staff found" />}
        renderItem={({ item }) => {
          const record = getRecord(item.id);
          const isLoading = locating === item.id;
          const loc = locations.find((l) => l.id === item.locationId);

          return (
            <View
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.initials, { color: colors.primary }]}>
                  {item.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.emp, { color: colors.mutedForeground }]}>
                  {item.employeeId} · {loc?.name ?? "Unassigned"}
                </Text>
                {record && (
                  <View style={styles.timeRow}>
                    {record.checkIn ? (
                      <View style={styles.timeChip}>
                        <AppIcon name="log-in" size={10} color={colors.success} />
                        <Text style={[styles.timeText, { color: colors.success }]}>
                          {formatTime(record.checkIn)}
                        </Text>
                      </View>
                    ) : null}
                    {record.checkOut ? (
                      <View style={styles.timeChip}>
                        <AppIcon name="log-out" size={10} color={colors.mutedForeground} />
                        <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
                          {formatTime(record.checkOut)}
                        </Text>
                      </View>
                    ) : null}
                    {record.verifiedByLocation && (
                      <AppIcon name="map-pin" size={11} color={colors.primary} />
                    )}
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : !record ? (
                  <>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: colors.primary }]}
                      onPress={() => handleCheckIn(item)}
                    >
                      <AppIcon name="log-in" size={14} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: colors.destructive + "18" }]}
                      onPress={() => handleMarkAbsent(item)}
                    >
                      <AppIcon name="x" size={14} color={colors.destructive} />
                    </TouchableOpacity>
                  </>
                ) : !record.checkOut && record.status !== "absent" ? (
                  <TouchableOpacity
                    style={[styles.btnWide, { backgroundColor: "#FFF3E0" }]}
                    onPress={() => handleCheckIn(item)}
                  >
                    <AppIcon name="log-out" size={14} color={colors.warning} />
                    <Text style={[styles.btnText, { color: colors.warning }]}>Out</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          record.status === "present"
                            ? "#E8F5E9"
                            : record.status === "late"
                            ? "#FFF8E1"
                            : "#FFEBEE",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            record.status === "present"
                              ? colors.success
                              : record.status === "late"
                              ? colors.warning
                              : colors.destructive,
                        },
                      ]}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  searchWrap: {},
  list: { padding: 16, gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 14, fontFamily: "Inter_700Bold" },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emp: { fontSize: 11, fontFamily: "Inter_400Regular" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  timeChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  timeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  actions: { flexDirection: "row", gap: 6, alignItems: "center" },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnWide: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  btnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
