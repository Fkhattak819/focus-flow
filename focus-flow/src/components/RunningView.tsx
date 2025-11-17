import React from "react"
import type { ActiveSession, Settings } from "../types"
import { ProgressRing } from "./ui/ProgressRing"
import { getThemeColors, getTextColorClasses } from "../utils/theme"

interface RunningViewProps {
  active: ActiveSession
  remainingMs: number
  isPaused: boolean
  onReset: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  settings: Settings
}

export function RunningView({
  active,
  remainingMs,
  isPaused,
  onReset,
  onPause,
  onResume,
  onStop,
  settings,
}: RunningViewProps) {
  const isDark = settings.theme === "dark"
  const opacity = settings.transparency / 100
  const colors = getThemeColors(isDark, opacity)
  const textColors = getTextColorClasses(isDark)

  const total = active.durationMs
  const rem = Math.max(0, remainingMs)
  const progress = 1 - rem / total

  const m = Math.floor(rem / 60_000)
  const s = Math.floor((rem % 60_000) / 1000)
  const timeText = `${m}:${s.toString().padStart(2, "0")}`

  const sessionTypeLabel =
    active.type === "pomodoro"
      ? "Pomodoro Session"
      : active.type === "flow"
        ? "Flow Session"
        : active.type === "quick"
          ? "Quick Focus"
          : "Custom"

  return (
    <div
      className="flex-1 min-h-0 rounded-2xl border shadow p-6 flex flex-col items-center"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <div className="text-center mb-2">
        <div className={`${textColors.primary} font-medium`}>{active.task}</div>
        <div className={`${textColors.muted} text-sm`}>
          {sessionTypeLabel} • {Math.round(active.durationMs / 60000)}min
        </div>
      </div>

      <div className="relative my-6">
        <ProgressRing progress={progress} />
        <div className="absolute inset-0 grid place-items-center">
          <div className={`text-5xl font-semibold ${textColors.primary}`}>{timeText}</div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-5 pb-1">
        <button
          onClick={onReset}
          className={`h-12 w-12 rounded-full border grid place-items-center text-lg ${textColors.secondary}`}
          style={{ backgroundColor: colors.button, borderColor: colors.border }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.button
          }}
          title="Reset"
        >
          ↻
        </button>

        {isPaused ? (
          <button
            onClick={onResume}
            className="h-14 w-14 rounded-full text-white shadow-md grid place-items-center text-xl"
            style={{ backgroundColor: colors.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary
            }}
            title="Resume"
          >
            ▶
          </button>
        ) : (
          <button
            onClick={onPause}
            className="h-14 w-14 rounded-full text-white shadow-md grid place-items-center text-xl"
            style={{ backgroundColor: colors.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary
            }}
            title="Pause"
          >
            ⏸
          </button>
        )}

        <button
          onClick={onStop}
          className={`h-12 w-12 rounded-full border grid place-items-center text-lg ${textColors.secondary}`}
          style={{ backgroundColor: colors.button, borderColor: colors.border }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.button
          }}
          title="Stop"
        >
          ■
        </button>
      </div>
    </div>
  )
}

