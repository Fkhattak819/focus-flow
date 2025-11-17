import type { SessionType } from "../types"

export const SESSION_PRESETS: Record<SessionType, number> = {
  pomodoro: 25,
  flow: 90,
  quick: 15,
  custom: 25,
}

export const PRIMARY_COLOR = {
  r: 96,
  g: 31,
  b: 245,
} as const

export const COLORS = {
  dark: {
    background: { r: 15, g: 23, b: 42 },
    card: { r: 30, g: 41, b: 59 },
    border: { r: 51, g: 65, b: 85 },
    input: { r: 51, g: 65, b: 85 },
    button: { r: 51, g: 65, b: 85 },
    buttonHover: { r: 71, g: 85, b: 105 },
  },
  light: {
    background: { r: 245, g: 247, b: 251 },
    card: { r: 255, g: 255, b: 255 },
    border: { r: 241, g: 245, b: 249 },
    input: { r: 255, g: 255, b: 255 },
    button: { r: 241, g: 245, b: 249 },
    buttonHover: { r: 226, g: 232, b: 240 },
  },
} as const

