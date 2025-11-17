import type { Settings, Theme } from "../types"

// Re-export for convenience
export type { Settings, Theme }

const DEFAULT_SETTINGS: Settings = {
  transparency: 95,
  theme: "light"
}

const KEY = "settings"

export async function getSettings(): Promise<Settings> {
  const r = await chrome.storage.local.get(KEY)
  return (r[KEY] as Settings | undefined) ?? DEFAULT_SETTINGS
}

export async function setSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [KEY]: settings })
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  const current = await getSettings()
  await setSettings({ ...current, ...updates })
}

