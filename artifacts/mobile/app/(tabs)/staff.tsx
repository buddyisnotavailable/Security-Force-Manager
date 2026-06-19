import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
import { StaffCard } from "@/components/StaffCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";

type Filter = "all" | "active" | "on-leave" | "inactive";

export default function StaffScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { staff, locations } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "on-leave", label: "On Leave" },
    { key: "inactive", label: "Inactive" },
  ];

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        s.designation.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || s.status === filter;
      return matchSearch && matchFilter;
    });
  }, [staff, search, filter]);

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
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Staff</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {staff.length} members
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/staff/add")}
          >
            <Feather name="user-plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search name, ID, role..." />
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.key ? colors.primary : colors.muted,
                },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? "#fff" : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title="No staff found"
            subtitle="Try adjusting your search or filter"
          />
        }
        renderItem={({ item }) => {
          const loc = locations.find((l) => l.id === item.locationId);
          return (
            <StaffCard
              staff={item}
              locationName={loc?.name}
              onPress={() => router.push(`/staff/${item.id}`)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16 },
});
