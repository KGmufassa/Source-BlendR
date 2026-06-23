import {
  Boxes,
  ClipboardList,
  FileText,
  Gauge,
  Library,
  Settings,
  Truck,
  UploadCloud,
  WalletCards
} from "lucide-react";

export const workspaceNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/imports/demo-import", label: "Imports", icon: UploadCloud },
  { href: "/assets", label: "Assets", icon: Library },
  { href: "/pricing", label: "Pricing", icon: WalletCards },
  { href: "/offerings/demo-offering", label: "Offerings", icon: Boxes },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/status", label: "Status", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;
