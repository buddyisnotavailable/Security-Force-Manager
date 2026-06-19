import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  seedAttendance,
  seedDress,
  seedLocations,
  seedSalary,
  seedStaff,
} from "@/constants/seed";
import type {
  AttendanceRecord,
  DressItem,
  Location,
  SalaryRecord,
  Staff,
} from "@/constants/types";

interface AppContextType {
  staff: Staff[];
  locations: Location[];
  attendance: AttendanceRecord[];
  dress: DressItem[];
  salary: SalaryRecord[];
  loading: boolean;

  addStaff: (s: Staff) => void;
  updateStaff: (s: Staff) => void;
  deleteStaff: (id: string) => void;

  addLocation: (l: Location) => void;
  updateLocation: (l: Location) => void;

  markAttendance: (a: AttendanceRecord) => void;
  updateAttendance: (a: AttendanceRecord) => void;

  addDressItem: (d: DressItem) => void;
  updateDressItem: (d: DressItem) => void;

  updateSalary: (s: SalaryRecord) => void;
  addSalaryRecord: (s: SalaryRecord) => void;

  getTodayAttendance: () => AttendanceRecord[];
  getStaffById: (id: string) => Staff | undefined;
  getLocationById: (id: string) => Location | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

const KEYS = {
  STAFF: "@sec_staff",
  LOCATIONS: "@sec_locations",
  ATTENDANCE: "@sec_attendance",
  DRESS: "@sec_dress",
  SALARY: "@sec_salary",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [dress, setDress] = useState<DressItem[]>([]);
  const [salary, setSalary] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, l, a, d, sal] = await Promise.all([
          AsyncStorage.getItem(KEYS.STAFF),
          AsyncStorage.getItem(KEYS.LOCATIONS),
          AsyncStorage.getItem(KEYS.ATTENDANCE),
          AsyncStorage.getItem(KEYS.DRESS),
          AsyncStorage.getItem(KEYS.SALARY),
        ]);
        setStaff(s ? JSON.parse(s) : seedStaff);
        setLocations(l ? JSON.parse(l) : seedLocations);
        setAttendance(a ? JSON.parse(a) : seedAttendance);
        setDress(d ? JSON.parse(d) : seedDress);
        setSalary(sal ? JSON.parse(sal) : seedSalary);
      } catch {
        setStaff(seedStaff);
        setLocations(seedLocations);
        setAttendance(seedAttendance);
        setDress(seedDress);
        setSalary(seedSalary);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (key: string, data: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }, []);

  const addStaff = useCallback((s: Staff) => {
    setStaff((prev) => {
      const next = [...prev, s];
      persist(KEYS.STAFF, next);
      return next;
    });
  }, [persist]);

  const updateStaff = useCallback((s: Staff) => {
    setStaff((prev) => {
      const next = prev.map((x) => (x.id === s.id ? s : x));
      persist(KEYS.STAFF, next);
      return next;
    });
  }, [persist]);

  const deleteStaff = useCallback((id: string) => {
    setStaff((prev) => {
      const next = prev.filter((x) => x.id !== id);
      persist(KEYS.STAFF, next);
      return next;
    });
  }, [persist]);

  const addLocation = useCallback((l: Location) => {
    setLocations((prev) => {
      const next = [...prev, l];
      persist(KEYS.LOCATIONS, next);
      return next;
    });
  }, [persist]);

  const updateLocation = useCallback((l: Location) => {
    setLocations((prev) => {
      const next = prev.map((x) => (x.id === l.id ? l : x));
      persist(KEYS.LOCATIONS, next);
      return next;
    });
  }, [persist]);

  const markAttendance = useCallback((a: AttendanceRecord) => {
    setAttendance((prev) => {
      const next = [...prev, a];
      persist(KEYS.ATTENDANCE, next);
      return next;
    });
  }, [persist]);

  const updateAttendance = useCallback((a: AttendanceRecord) => {
    setAttendance((prev) => {
      const next = prev.map((x) => (x.id === a.id ? a : x));
      persist(KEYS.ATTENDANCE, next);
      return next;
    });
  }, [persist]);

  const addDressItem = useCallback((d: DressItem) => {
    setDress((prev) => {
      const next = [...prev, d];
      persist(KEYS.DRESS, next);
      return next;
    });
  }, [persist]);

  const updateDressItem = useCallback((d: DressItem) => {
    setDress((prev) => {
      const next = prev.map((x) => (x.id === d.id ? d : x));
      persist(KEYS.DRESS, next);
      return next;
    });
  }, [persist]);

  const updateSalary = useCallback((s: SalaryRecord) => {
    setSalary((prev) => {
      const next = prev.map((x) => (x.id === s.id ? s : x));
      persist(KEYS.SALARY, next);
      return next;
    });
  }, [persist]);

  const addSalaryRecord = useCallback((s: SalaryRecord) => {
    setSalary((prev) => {
      const next = [...prev, s];
      persist(KEYS.SALARY, next);
      return next;
    });
  }, [persist]);

  const getTodayAttendance = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]!;
    return attendance.filter((a) => a.date === today);
  }, [attendance]);

  const getStaffById = useCallback((id: string) => staff.find((s) => s.id === id), [staff]);
  const getLocationById = useCallback((id: string) => locations.find((l) => l.id === id), [locations]);

  return (
    <AppContext.Provider
      value={{
        staff, locations, attendance, dress, salary, loading,
        addStaff, updateStaff, deleteStaff,
        addLocation, updateLocation,
        markAttendance, updateAttendance,
        addDressItem, updateDressItem,
        updateSalary, addSalaryRecord,
        getTodayAttendance, getStaffById, getLocationById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
