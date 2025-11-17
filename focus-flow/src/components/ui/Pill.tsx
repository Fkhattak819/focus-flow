import React from "react"
import { getRgbaColor } from "../../utils/theme"
import { PRIMARY_COLOR, COLORS } from "../../constants"

interface PillProps {
  icon: React.ReactNode
  label: string
  sub: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
  isDark?: boolean
  opacity?: number
}

export function Pill({ icon, label, sub, selected, onClick, disabled, isDark = false, opacity = 1 }: PillProps) {
  const themeColors = isDark ? COLORS.dark : COLORS.light

  const bgColor = selected
    ? getRgbaColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b, opacity)
    : getRgbaColor(themeColors.button.r, themeColors.button.g, themeColors.button.b, opacity)

  const borderColor = selected
    ? getRgbaColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b, opacity)
    : getRgbaColor(themeColors.border.r, themeColors.border.g, themeColors.border.b, opacity)

  const hoverBg = getRgbaColor(themeColors.buttonHover.r, themeColors.buttonHover.g, themeColors.buttonHover.b, opacity)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex flex-col items-center justify-center text-center rounded-xl px-3 py-3 transition border shadow-sm"
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.backgroundColor = hoverBg
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = bgColor
        }
      }}
    >
      <div
        className={[
          "h-6 w-6 mb-1.5 grid place-items-center rounded-full",
          selected ? "bg-white/20" : isDark ? "bg-slate-600 text-slate-300" : "bg-slate-100 text-slate-600",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className={`text-xs font-semibold ${selected ? "text-white" : isDark ? "text-slate-200" : "text-slate-800"}`}>
        {label}
      </div>
      <div className={`text-[11px] mt-0.5 ${selected ? "text-indigo-100" : isDark ? "text-slate-400" : "text-slate-500"}`}>
        {sub}
      </div>
    </button>
  )
}

