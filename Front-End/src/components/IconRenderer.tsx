import React from "react";
import * as LucideIcons from "lucide-react";

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export default function IconRenderer({ name, className = "", size = 20 }: IconRendererProps) {
  // Get icon by string name from Lucide
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    // Return a default folder icon if not found
    return <LucideIcons.Folder className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}

// Helper list of icons that users can select from when creating a category
export const AVAILABLE_ICONS = [
  { name: "Folder", label: "Folder" },
  { name: "Briefcase", label: "Work" },
  { name: "GraduationCap", label: "Education" },
  { name: "BookOpen", label: "Reading" },
  { name: "Home", label: "Personal" },
  { name: "Heart", label: "Health" },
  { name: "ShoppingBag", label: "Shopping" },
  { name: "Coffee", label: "Leisure" },
  { name: "Code", label: "Development" },
  { name: "Gamepad2", label: "Gaming" },
  { name: "Plane", label: "Travel" },
  { name: "Settings", label: "System" },
];
