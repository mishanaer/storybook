import type { ReactNode } from "react";

export interface StorybookItem {
  id: string;
  title: string;
}

export interface StorybookGroup {
  id: string;
  title: string;
  items: StorybookItem[];
}

export interface StorybookShellProps {
  groups?: StorybookGroup[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  onBack?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  children?: ReactNode;
}

export declare function StorybookShell(props: StorybookShellProps): ReactNode;
export default StorybookShell;
