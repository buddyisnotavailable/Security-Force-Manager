import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";

export default function LocationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { locations, staff, updateLocation } = useApp();
  const [search, setSearch] = useState("");

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase())
  );

  const getStaffCount = (locationId: string) =>
    staff.filter((s) => s.locationId === locationId && s.status === "active").length;

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
            <Text style={[styles.title, { color: colors.foreground }]}>Locations</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {locations.filter((l) => l.active).length} active sites
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/locations/add")}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search location..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 24 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="map-pin"
            title="No locations found"
            subtitle="Add guard post sites here"
          />
        }
        renderItem={({ item }) => {
          const count = getStaffCount(item.id);
          return (
            <View
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="map-pin" size={20} color={colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.locName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.locAddr, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.address}, {item.city}
                  </Text>
                </View>
                <Switch
                  value={item.active}
                  onValueChange={(val) => updateLocation({ ...item, active: val })}
                  trackColor={{ false: colors.border, true: colors.primary + "88" }}
                  thumbColor={item.active ? colors.primary : colors.muted}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.cardBottom}>
                <View style={styles.metaItem}>
                  <Feather name="users" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {count} staff deployed
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="radio" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {item.radius}m geo-fence
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="phone" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                    {item.contactPerson}
                  </Text>
                </View>
              </View>
            </View>
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
  list: { padding: 16, gap: 10 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  locName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  locAddr: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { height: 1, marginHorizontal: 14 },
  cardBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
