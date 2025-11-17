import React from "react"
import logoDataUri from "data-base64:/assets/DeepIcon.png"
import { getTextColorClasses } from "../utils/theme"

interface HeaderProps {
  isDark: boolean
}

export function Header({ isDark }: HeaderProps) {
  const textColors = getTextColorClasses(isDark)

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center gap-2">
        <img src={logoDataUri} alt="Focus Flow logo" className="h-9 w-9" />
        <h1 className={`text-xl font-semibold leading-tight ${textColors.primary}`}>Focus Flow</h1>
      </div>
      <p className={`text-xs mt-0.5 ${textColors.muted}`}>Your minimal focus companion</p>
    </div>
  )
}

