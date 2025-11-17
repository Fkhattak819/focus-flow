import { COLORS, PRIMARY_COLOR } from "../constants"
import type { Theme } from "../types"

export function getRgbaColor(r: number, g: number, b: number, opacity: number): string {
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function getThemeColors(isDark: boolean, opacity: number) {
  const themeColors = isDark ? COLORS.dark : COLORS.light
  
  return {
    background: getRgbaColor(themeColors.background.r, themeColors.background.g, themeColors.background.b, opacity),
    card: getRgbaColor(themeColors.card.r, themeColors.card.g, themeColors.card.b, opacity),
    border: getRgbaColor(themeColors.border.r, themeColors.border.g, themeColors.border.b, opacity),
    input: getRgbaColor(themeColors.input.r, themeColors.input.g, themeColors.input.b, opacity),
    button: getRgbaColor(themeColors.button.r, themeColors.button.g, themeColors.button.b, opacity),
    buttonHover: getRgbaColor(themeColors.buttonHover.r, themeColors.buttonHover.g, themeColors.buttonHover.b, opacity),
    primary: getRgbaColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b, opacity),
    primaryHover: getRgbaColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b, Math.min(opacity + 0.1, 1)),
  }
}

export function getTextColorClasses(isDark: boolean) {
  return {
    primary: isDark ? "text-slate-100" : "text-slate-800",
    secondary: isDark ? "text-slate-300" : "text-slate-600",
    muted: isDark ? "text-slate-400" : "text-slate-500",
  }
}

