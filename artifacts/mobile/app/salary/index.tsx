import { AppIcon } from "@/components/AppIcon";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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

export default function SalaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { salary, staff, updateSalary, addSalaryRecord } = useApp();
  const [search, setSearch] = useState("");

  const thisMonth = new Date().toISOString().slice(0, 7);

  const thisMonthRecords = useMemo(
    () => salary.filter((s) => s.month === thisMonth),
    [salary, thisMonth]
  );

  const filtered = thisMonthRecords.filter((s) =>
    s.staffName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPending = thisMonthRecords.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.netSalary, 0);
  const totalPaid = thisMonthRecords.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.netSalary, 0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleMarkPaid = (record: (typeof salary)[0]) => {
    Alert.alert(
      "Mark as Paid",
      `Pay ₹${record.netSalary.toLocaleString("en-IN")} to ${record.staffName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Payment",
          onPress: () => {
            updateSalary({ ...record, status: "paid", paidDate: new Date().toISOString() });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleGenerateAll = () => {
    const existingIds = new Set(thisMonthRecords.map((r) => r.staffId));
    const missing = staff.filter((s) => !existingIds.has(s.id) && s.status === "active");
    if (missing.length === 0) {
      Alert.alert("Up to date", "All active staff already have salary records for this month.");
      return;
    }
    missing.forEach((s) => {
      addSalaryRecord({
        id: Date.now().toString() + Math.random().toString(36).slice(2) + s.id,
        staffId: s.id,
        staffName: s.name,
        month: thisMonth,
        basicSalary: s.salary,
        allowances: 0,
        deductions: 0,
        netSalary: s.salary,
        status: "pending",
      });
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Generated", `${missing.length} salary record(s) created.`);
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
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Salary</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>{thisMonth}</Text>
          </View>
          <TouchableOpacity
            style={[styles.genBtn, { backgroundColor: colors.primary + "18" }]}
            onPress={handleGenerateAll}
          >
            <AppIcon name="refresh-cw" size={16} color={colors.primary} />
            <Text style={[styles.genText, { color: colors.primary }]}>Generate</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Banner */}
        <View style={[styles.summaryRow, { gap: 10 }]}>
          <View style={[styles.summaryBox, { backgroundColor: "#FFEBEE" }]}>
            <Text style={[styles.summaryVal, { color: "#C62828" }]}>
              ₹{totalPending.toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#C62828" }]}>
              {thisMonthRecords.filter((s) => s.status === "pending").length} Pending
            </Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.summaryVal, { color: "#2E7D32" }]}>
              ₹{totalPaid.toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#2E7D32" }]}>
              {thisMonthRecords.filter((s) => s.status === "paid").length} Paid
            </Text>
          </View>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Search staff..." />
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
            icon="credit-card"
            title="No salary records"
            subtitle="Tap Generate to create records for all active staff"
          />
        }
        renderItem={({ item }) => (
          <View
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.initials, { color: colors.primary }]}>
                {item.staffName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.staffName}</Text>
              <View style={styles.salaryRow}>
                <Text style={[styles.salaryAmt, { color: colors.primary }]}>
                  ₹{item.netSalary.toLocaleString("en-IN")}
                </Text>
                {item.deductions > 0 && (
                  <Text style={[styles.deduction, { color: colors.destructive }]}>
                    -{item.deductions}
                  </Text>
                )}
              </View>
              {item.paidDate && (
                <Text style={[styles.paidDate, { color: colors.mutedForeground }]}>
                  Paid {formatDate(item.paidDate)}
                </Text>
              )}
            </View>
            {item.status === "pending" ? (
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: "#2E7D32" }]}
                onPress={() => handleMarkPaid(item)}
              >
                <AppIcon name="check" size={14} color="#fff" />
                <Text style={styles.payBtnText}>Pay</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.paidBadge, { backgroundColor: "#E8F5E9" }]}>
                <AppIcon name="check-circle" size={13} color="#2E7D32" />
                <Text style={[styles.paidText, { color: "#2E7D32" }]}>Paid</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  genBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  genText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryRow: { flexDirection: "row", marginBottom: 12 },
  summaryBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 2 },
  summaryVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  list: { padding: 12, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 15, fontFamily: "Inter_700Bold" },
  info: { flex: 1 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  salaryRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  salaryAmt: { fontSize: 15, fontFamily: "Inter_700Bold" },
  deduction: { fontSize: 12, fontFamily: "Inter_500Medium" },
  paidDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  payBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  payBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  paidText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
