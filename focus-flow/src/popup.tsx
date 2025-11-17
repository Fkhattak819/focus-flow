import { useState } from "react"
import { getActive } from "./lib/storage"
import { useSettings } from "./hooks/useSettings"
import { useSession } from "./hooks/useSession"
import { getThemeColors, getTextColorClasses } from "./utils/theme"
import { Header } from "./components/Header"
import { SettingsButton } from "./components/SettingsButton"
import { Tabs, type TabType } from "./components/Tabs"
import { SettingsPanel } from "./components/SettingsPanel"
import { SessionForm } from "./components/SessionForm"
import { RunningView } from "./components/RunningView"
import { DistractionsPanel } from "./components/DistractionsPanel"
import "./style.css"

export default function Popup() {
  const { settings, update: updateSettings } = useSettings()
  const { active, remainingMs, setActive } = useSession()
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTab, setSelectedTab] = useState<TabType>("focus")

  const isDark = settings.theme === "dark"
  const opacity = settings.transparency / 100
  const colors = getThemeColors(isDark, opacity)
  const textColors = getTextColorClasses(isDark)

  const handleStart = async (task: string, sessionType: any, durationMin: number) => {
    await chrome.runtime.sendMessage({
      type: "START_SESSION",
      task: task.trim() || "Untitled",
      sessionType,
      durationMin,
    })
    const s = await getActive()
    setActive(s)
  }

  const handlePause = async () => {
    await chrome.runtime.sendMessage({ type: "PAUSE_SESSION" })
    const s = await getActive()
    setActive(s)
  }

  const handleResume = async () => {
    await chrome.runtime.sendMessage({ type: "RESUME_SESSION" })
    const s = await getActive()
    setActive(s)
  }

  const handleStop = async () => {
    await chrome.runtime.sendMessage({ type: "STOP_SESSION" })
    setActive(null)
  }

  const handleReset = async () => {
    if (!active) return
    await chrome.runtime.sendMessage({ type: "STOP_SESSION" })
    await chrome.runtime.sendMessage({
      type: "START_SESSION",
      task: active.task,
      sessionType: active.type,
      durationMin: Math.round(active.durationMs / 60000),
    })
    const s = await getActive()
    setActive(s)
  }

  const running = !!active

  return (
    <div className={`w-[400px] h-[560px] overflow-hidden ${textColors.primary}`} style={{ backgroundColor: colors.background }}>
      <div className="h-full flex flex-col gap-3 p-4 relative">
        <SettingsButton onClick={() => setShowSettings(!showSettings)} isDark={isDark} opacity={opacity} />

        <Header isDark={isDark} />

        <Tabs isDark={isDark} opacity={opacity} selectedTab={selectedTab} onTabChange={setSelectedTab} />

        {showSettings && (
          <SettingsPanel settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />
        )}

        {selectedTab === "focus" && (
          <>
            {!running ? (
              <SessionForm onStart={handleStart} disabled={running} settings={settings} />
            ) : (
              <RunningView
                active={active}
                remainingMs={remainingMs}
                isPaused={!!active.pausedAt}
                onReset={handleReset}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                settings={settings}
              />
            )}
          </>
        )}

        {selectedTab === "distractions" && <DistractionsPanel settings={settings} />}
      </div>
    </div>
  )
}
