import React from "react";
import * as Icons from "lucide-react";

export default function DynamicIcon({ name, className = "w-6 h-6", ...props }) {
  const IconComponent = Icons[name] || Icons.File;
  return <IconComponent className={className} {...props} />;
}
