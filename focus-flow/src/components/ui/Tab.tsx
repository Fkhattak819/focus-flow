import React from "react"
import { getRgbaColor } from "../../utils/theme"
import { PRIMARY_COLOR } from "../../constants"

interface TabProps {
  icon: React.ReactNode
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  isDark?: boolean
  opacity?: number
}

export function Tab({ icon, children, selected = false, onClick, isDark = false, opacity = 1 }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
        selected ? "text-white shadow" : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800",
      ].join(" ")}
      style={{ backgroundColor: selected ? getRgbaColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b, opacity) : "transparent" }}
    >
      <span className={selected ? "text-white" : isDark ? "text-slate-500" : "text-slate-500"}>{icon}</span>
      {children}
    </button>
  )
}

