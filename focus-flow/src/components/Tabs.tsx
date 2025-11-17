import React from "react"
import { Tab } from "./ui/Tab"
import { getThemeColors } from "../utils/theme"

export type TabType = "focus" | "distractions" | "hints" | "stats"

interface TabsProps {
  isDark: boolean
  opacity: number
  selectedTab: TabType
  onTabChange: (tab: TabType) => void
}

export function Tabs({ isDark, opacity, selectedTab, onTabChange }: TabsProps) {
  const colors = getThemeColors(isDark, opacity)

  return (
    <div className="flex gap-5 border-b pb-1" style={{ borderColor: colors.border }}>
      <Tab
        icon={<span>🎯</span>}
        selected={selectedTab === "focus"}
        onClick={() => onTabChange("focus")}
        isDark={isDark}
        opacity={opacity}
      >
        Focus
      </Tab>
      <Tab
        icon={<span>⚙️</span>}
        selected={selectedTab === "distractions"}
        onClick={() => onTabChange("distractions")}
        isDark={isDark}
        opacity={opacity}
      >
        Distractions
      </Tab>
      <Tab
        icon={<span>❓</span>}
        selected={selectedTab === "hints"}
        onClick={() => onTabChange("hints")}
        isDark={isDark}
        opacity={opacity}
      >
        Hints
      </Tab>
      <Tab
        icon={<span>📊</span>}
        selected={selectedTab === "stats"}
        onClick={() => onTabChange("stats")}
        isDark={isDark}
        opacity={opacity}
      >
        Stats
      </Tab>
    </div>
  )
}

