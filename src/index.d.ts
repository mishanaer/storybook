import type { ReactNode } from "react";

export interface StorybookIndexEntry {
  id: string;
  type: "story" | "docs" | string;
  title?: string;
  name?: string;
  importPath?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface StorybookIndex {
  v?: number;
  entries?: Record<string, StorybookIndexEntry>;
}

export interface StorybookItem {
  id: string;
  title: string;
  story?: StorybookIndexEntry;
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

export interface StorybookRuntimeProps {
  storybookUrl?: string;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
  storyParam?: string;
  fetchImpl?: typeof fetch;
}

export interface StorybookPreviewProps {
  storybookUrl?: string;
  storyId?: string | null;
  title?: string;
}

export declare function StorybookShell(props: StorybookShellProps): ReactNode;
export declare function StorybookRuntime(props: StorybookRuntimeProps): ReactNode;
export declare function StorybookPreview(props: StorybookPreviewProps): ReactNode;

export declare function normalizeStorybookUrl(url?: string): string;
export declare function getStorybookIndexUrl(storybookUrl?: string): string;
export declare function getStorybookPreviewUrl(storybookUrl: string | undefined, storyId?: string | null): string;
export declare function storyEntriesFromIndex(index?: StorybookIndex | null): StorybookIndexEntry[];
export declare function groupsFromStorybookIndex(index?: StorybookIndex | null): StorybookGroup[];
export declare function readStoryIdFromLocation(param?: string): string | null;
export declare function writeStoryIdToLocation(storyId?: string | null, param?: string, options?: { replace?: boolean }): void;

export default StorybookRuntime;
