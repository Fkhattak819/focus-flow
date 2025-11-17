export type Theme = "light" | "dark"

export type Settings = {
  transparency: number  // 0-100
  theme: Theme
}

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

