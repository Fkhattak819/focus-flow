import React from "react"
import { Tab } from "./ui/Tab"
import { getThemeColors } from "../utils/theme"

interface TabsProps {
  isDark: boolean
  opacity: number
}

export function Tabs({ isDark, opacity }: TabsProps) {
  const colors = getThemeColors(isDark, opacity)

  return (
    <div className="flex gap-5 border-b pb-1" style={{ borderColor: colors.border }}>
      <Tab icon={<span>🎯</span>} selected isDark={isDark} opacity={opacity}>
        Focus
      </Tab>
      <Tab icon={<span>⚙️</span>} isDark={isDark} opacity={opacity}>
        Distractions
      </Tab>
      <Tab icon={<span>❓</span>} isDark={isDark} opacity={opacity}>
        Hints
      </Tab>
      <Tab icon={<span>📊</span>} isDark={isDark} opacity={opacity}>
        Stats
      </Tab>
    </div>
  )
}

