import {
  ArrowLeft,
  Award,
  Calendar,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  Delete,
  Grid2x2,
  Hash,
  Home,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  Users,
  X,
} from "lucide-react-native";
import React from "react";

const ICON_MAP = {
  "home": Home,
  "clock": Clock,
  "users": Users,
  "map-pin": MapPin,
  "grid": Grid2x2,
  "shield": Shield,
  "user-plus": UserPlus,
  "plus": Plus,
  "search": Search,
  "chevron-right": ChevronRight,
  "arrow-left": ArrowLeft,
  "check": Check,
  "x": X,
  "log-in": LogIn,
  "log-out": LogOut,
  "delete": Delete,
  "lock": Lock,
  "hash": Hash,
  "phone": Phone,
  "calendar": Calendar,
  "credit-card": CreditCard,
  "package": Package,
  "check-circle": CircleCheck,
  "x-circle": CircleX,
  "user-x": UserX,
  "user-check": UserCheck,
  "user-minus": UserMinus,
  "trash-2": Trash2,
  "radio": Radio,
  "refresh-cw": RefreshCw,
  "award": Award,
  "user": User,
  "alert-circle": CircleAlert,
} as const;

export type AppIconName = keyof typeof ICON_MAP;

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function AppIcon({ name, size = 24, color = "#000", strokeWidth = 2 }: AppIconProps) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}
