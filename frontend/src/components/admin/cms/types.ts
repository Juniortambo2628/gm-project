/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CMSModuleProps {
  localSettings: Record<string, any>;
  setLocalSettings: (settings: Record<string, any>) => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  refreshSettings: () => void;
}

export interface CredentialItem {
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
}
