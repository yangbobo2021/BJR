export type AdminPanelId = "access" | "share_tokens" | "mailbag" | "exegesis";

export type AdminPanelDef = {
  id: AdminPanelId;
  pillLabel: string;
  modalTitle: string;
  src: string;
};

export const ADMIN_PANELS: readonly AdminPanelDef[] = [
  {
    id: "access",
    pillLabel: "Access",
    modalTitle: "Admin — Access",
    src: "/admin/access?embed=1",
  },
  {
    id: "share_tokens",
    pillLabel: "Share tokens",
    modalTitle: "Admin — Share tokens",
    src: "/admin/access?tab=tokens&embed=1",
  },
  {
    id: "mailbag",
    pillLabel: "Mailbag",
    modalTitle: "Admin — Mailbag",
    src: "/admin/mailbag?embed=1",
  },
  {
    id: "exegesis",
    pillLabel: "Exegesis",
    modalTitle: "Admin — Exegesis",
    src: "/admin/exegesis?embed=1",
  },
] as const;

export function getAdminPanel(panelId: AdminPanelId): AdminPanelDef {
  const found = ADMIN_PANELS.find((panel) => panel.id === panelId);
  return found ?? ADMIN_PANELS[0];
}