import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { AppIcon } from "@/components/AppIcon";
import type { Staff } from "@/constants/types";

interface StaffCardProps {
  staff: Staff;
  locationName?: string;
  onPress?: () => void;
}

const statusColors: Record<Staff["status"], string> = {
  active: "#2E7D32",
  inactive: "#9E9E9E",
  "on-leave": "#E65100",
};

const statusLabels: Record<Staff["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  "on-leave": "On Leave",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export function StaffCard({ staff, locationName, onPress }: StaffCardProps) {
  const colors = useColors();
  const statusColor = statusColors[staff.status];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
        <Text style={[styles.initials, { color: colors.primary }]}>{initials(staff.name)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {staff.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabels[staff.status]}
            </Text>
          </View>
        </View>
        <Text style={[styles.designation, { color: colors.mutedForeground }]}>
          {staff.designation} · {staff.employeeId}
        </Text>
        {locationName ? (
          <View style={styles.locRow}>
            <AppIcon name="map-pin" size={11} color={colors.mutedForeground} />
            <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
              {" "}{locationName}
            </Text>
          </View>
        ) : null}
      </View>
      <AppIcon name="chevron-right" size={18} color={colors.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  designation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
