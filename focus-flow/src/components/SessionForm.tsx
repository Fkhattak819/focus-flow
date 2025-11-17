import React, { useState, useEffect } from "react"
import type { SessionType } from "../types"
import { SESSION_PRESETS } from "../constants"
import { ClockIcon, ZapIcon, TargetIcon } from "./icons"
import { Pill } from "./ui/Pill"
import { getTextColorClasses, getThemeColors } from "../utils/theme"
import type { Settings } from "../types"

interface SessionFormProps {
  onStart: (task: string, type: SessionType, durationMin: number) => void
  disabled?: boolean
  settings: Settings
}

export function SessionForm({ onStart, disabled = false, settings }: SessionFormProps) {
  const [task, setTask] = useState("")
  const [type, setType] = useState<SessionType>("pomodoro")
  const [durationMin, setDurationMin] = useState<number>(SESSION_PRESETS.pomodoro)

  useEffect(() => {
    if (type !== "custom") {
      setDurationMin(SESSION_PRESETS[type])
    }
  }, [type])

  const isDark = settings.theme === "dark"
  const opacity = settings.transparency / 100
  const colors = getThemeColors(isDark, opacity)
  const textColors = getTextColorClasses(isDark)
  const canStart = task.trim().length > 0 && durationMin > 0

  const handleSubmit = () => {
    if (canStart) {
      onStart(task.trim() || "Untitled", type, durationMin)
    }
  }

  return (
    <div
      className="flex-1 min-h-0 rounded-2xl border shadow p-4 flex flex-col"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <h2 className={`text-lg font-semibold text-center ${textColors.primary}`}>Start a Focus Session</h2>
      <p className={`text-center text-sm mt-0.5 mb-3 ${textColors.muted}`}>What are you working on today?</p>

      <label className={`text-xs ${textColors.secondary}`}>Session Title</label>
      <input
        className="mt-1 mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        style={{ backgroundColor: colors.input, borderColor: colors.border }}
        placeholder="e.g., Algorithms homework…"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        disabled={disabled}
      />

      <div className={`text-xs mb-1 ${textColors.secondary}`}>Session Type</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Pill
          icon={<ClockIcon />}
          label="Pomodoro"
          sub="25min"
          selected={type === "pomodoro"}
          onClick={() => setType("pomodoro")}
          disabled={disabled}
          isDark={isDark}
          opacity={opacity}
        />
        <Pill
          icon={<ZapIcon />}
          label="Flow State"
          sub="90min"
          selected={type === "flow"}
          onClick={() => setType("flow")}
          disabled={disabled}
          isDark={isDark}
          opacity={opacity}
        />
        <Pill
          icon={<TargetIcon />}
          label="Quick Focus"
          sub="15min"
          selected={type === "quick"}
          onClick={() => setType("quick")}
          disabled={disabled}
          isDark={isDark}
          opacity={opacity}
        />
      </div>

      <div className={`text-xs mb-1 ${textColors.secondary}`}>Duration (minutes)</div>
      <input
        type="number"
        className="w-full rounded-lg border px-3 py-2 mb-3 text-sm"
        style={{ backgroundColor: colors.input, borderColor: colors.border }}
        value={durationMin}
        onChange={(e) => {
          setType("custom")
          setDurationMin(parseInt(e.target.value || "0"))
        }}
        min={1}
        disabled={disabled}
      />

      <button
        className="w-full rounded-lg text-white py-2 text-sm font-medium shadow disabled:opacity-50"
        style={{ backgroundColor: colors.primary }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = colors.primaryHover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.primary
        }}
        onClick={handleSubmit}
        disabled={!canStart || disabled}
      >
        Start Focus Session
      </button>
    </div>
  )
}
