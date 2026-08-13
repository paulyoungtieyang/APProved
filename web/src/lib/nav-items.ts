export interface NavItem {
  href: string;
  label: string;
  icon: string; // simple glyph, no icon library dependency
  builtInPhase1: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "▦", builtInPhase1: true },
  { href: "/upload", label: "Upload Phase 3 Data", icon: "⇧", builtInPhase1: true },
  { href: "/regulations", label: "Regulations", icon: "⚖", builtInPhase1: true },
  { href: "/policy-news", label: "Policy News", icon: "📰", builtInPhase1: true },
  { href: "/global-value-dossier", label: "Global Value Dossier", icon: "◈", builtInPhase1: true },
  { href: "/msl-materials", label: "MSL Materials", icon: "🎓", builtInPhase1: true },
  { href: "/document-library", label: "Document Library", icon: "▤", builtInPhase1: true },
  { href: "/resources", label: "Resources", icon: "🛈", builtInPhase1: true },
  { href: "/submit", label: "Submit", icon: "➤", builtInPhase1: true },
  { href: "/settings", label: "Settings", icon: "⚙", builtInPhase1: true },
];
