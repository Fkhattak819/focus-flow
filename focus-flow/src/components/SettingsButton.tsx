import React from "react"
import { SettingsIcon } from "./icons"
import { getThemeColors, getTextColorClasses } from "../utils/theme"

interface SettingsButtonProps {
  onClick: () => void
  isDark: boolean
  opacity: number
}

export function SettingsButton({ onClick, isDark, opacity }: SettingsButtonProps) {
  const colors = getThemeColors(isDark, opacity)
  const textColors = getTextColorClasses(isDark)

  return (
    <button
      onClick={onClick}
      className={`absolute top-4 right-4 z-10 h-8 w-8 rounded-full border grid place-items-center transition ${textColors.secondary}`}
      style={{
        backgroundColor: colors.button,
        borderColor: colors.border,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.buttonHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.button
      }}
      title="Settings"
    >
      <SettingsIcon />
    </button>
  )
}

