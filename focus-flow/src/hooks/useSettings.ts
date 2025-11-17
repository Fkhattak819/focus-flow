import { useEffect, useState } from "react"
import { getSettings, updateSettings } from "../lib/settings"
import type { Settings } from "../types"

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ transparency: 95, theme: "light" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s)
      setIsLoading(false)
    })
  }, [])

  const update = async (updates: Partial<Settings>) => {
    await updateSettings(updates)
    const newSettings = await getSettings()
    setSettings(newSettings)
  }

  return { settings, update, isLoading }
}

