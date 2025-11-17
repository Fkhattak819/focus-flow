import React from "react"
import { CloseIcon } from "./icons"
import { getThemeColors, getTextColorClasses } from "../utils/theme"
import type { Settings } from "../types"

interface SettingsPanelProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => Promise<void>
  onClose: () => void
}

export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  const isDark = settings.theme === "dark"
  const opacity = settings.transparency / 100
  const colors = getThemeColors(isDark, opacity)
  const textColors = getTextColorClasses(isDark)

  return (
    <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="rounded-2xl border shadow-xl p-6 w-full max-w-sm"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${textColors.primary}`}>Settings</h2>
          <button
            onClick={onClose}
            className={`h-8 w-8 rounded-full ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} grid place-items-center transition`}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-3 ${textColors.secondary}`}>Theme</label>
            <div className="flex gap-3">
              <button
                onClick={() => onUpdate({ theme: "light" })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                  settings.theme === "light" ? "border-[#601ff5] text-white" : textColors.secondary
                }`}
                style={{
                  backgroundColor: settings.theme === "light" ? colors.primary : colors.button,
                  borderColor: settings.theme === "light" ? colors.primary : colors.border,
                }}
              >
                Light
              </button>
              <button
                onClick={() => onUpdate({ theme: "dark" })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                  settings.theme === "dark" ? "border-[#601ff5] text-white" : textColors.secondary
                }`}
                style={{
                  backgroundColor: settings.theme === "dark" ? colors.primary : colors.button,
                  borderColor: settings.theme === "dark" ? colors.primary : colors.border,
                }}
              >
                Dark
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-medium ${textColors.secondary}`}>Transparency</label>
              <span className={`text-sm font-medium ${textColors.muted}`}>{settings.transparency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.transparency}
              onChange={(e) => onUpdate({ transparency: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#601ff5]"
              style={{
                background: `linear-gradient(to right, #601ff5 0%, #601ff5 ${settings.transparency}%, rgb(226 232 240) ${settings.transparency}%, rgb(226 232 240) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={textColors.muted}>Opaque</span>
              <span className={textColors.muted}>Transparent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

