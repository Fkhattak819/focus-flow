import { useEffect, useMemo, useState } from "react"
// IMPORTANT: only import getActive here (not setActive) to avoid name clash
import { getActive } from "./lib/storage"
import type { ActiveSession, SessionType } from "./lib/storage"
import { getSettings, updateSettings, type Settings, type Theme } from "./lib/settings"
import "./style.css"
import logoDataUri from "data-base64:/assets/DeepIcon.png"

const PRESETS: Record<SessionType, number> = {
  pomodoro: 25, flow: 90, quick: 15, custom: 25
}

const ClockIcon = ({ filled=false }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" className={filled ? "text-white" : ""} />
    <path d="M12 7v5l3 2" />
  </svg>
)
const ZapIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
  </svg>
)
const TargetIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export default function Popup() {
  const [task, setTask] = useState("")
  const [type, setType] = useState<SessionType>("pomodoro")
  const [durationMin, setDurationMin] = useState<number>(PRESETS.pomodoro)

  // NOTE: rename state setter to avoid clashing with storage.setActive
  const [active, setActiveState] = useState<ActiveSession | null>(null)
  const [remainingMs, setRemainingMs] = useState<number>(0)
  const [settings, setSettings] = useState<Settings>({ transparency: 95, theme: "light" })
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (type !== "custom") setDurationMin(PRESETS[type])
  }, [type])

  // Load current session (if background already running)
  useEffect(() => { getActive().then(setActiveState) }, [])
  
  // Load settings
  useEffect(() => { getSettings().then(setSettings) }, [])

  // Live countdown
  useEffect(() => {
    const id = setInterval(async () => {
      const s = await getActive()
      setActiveState(s)
      if (!s) { setRemainingMs(0); return }
      // Calculate remaining time accounting for pauses
      const totalPaused = s.totalPausedMs || 0
      if (s.pausedAt) {
        // When paused, calculate remaining time at the moment of pause
        const remaining = s.startedAt + s.durationMs + totalPaused - s.pausedAt
        setRemainingMs(Math.max(0, remaining))
      } else {
        // When running, calculate normally
        const remaining = s.startedAt + s.durationMs + totalPaused - Date.now()
        setRemainingMs(Math.max(0, remaining))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const start = async () => {
    await chrome.runtime.sendMessage({
      type: "START_SESSION",
      task: task.trim() || "Untitled",
      sessionType: type,
      durationMin
    })
    const s = await getActive()
    setActiveState(s)
  }

  const pause = async () => {
    await chrome.runtime.sendMessage({ type: "PAUSE_SESSION" })
    const s = await getActive()
    setActiveState(s)
  }

  const resume = async () => {
    await chrome.runtime.sendMessage({ type: "RESUME_SESSION" })
    const s = await getActive()
    setActiveState(s)
  }

  const stop = async () => {
    await chrome.runtime.sendMessage({ type: "STOP_SESSION" })
    setActiveState(null)
  }

  const running = !!active
  const canStart = task.trim().length > 0 && durationMin > 0

  // Apply theme and transparency
  const bgOpacity = settings.transparency / 100
  const isDark = settings.theme === "dark"
  const bgColor = isDark ? "bg-slate-900" : "bg-[#f5f7fb]"
  const textColor = isDark ? "text-slate-100" : "text-slate-800"
  const cardBg = isDark ? "bg-slate-800" : "bg-white"
  const borderColor = isDark ? "border-slate-700" : "border-slate-100"
  const inputBg = isDark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-slate-200"

  return (
    <div className={`w-[400px] h-[560px] overflow-hidden ${bgColor} ${textColor}`} style={{ backgroundColor: isDark ? `rgba(15, 23, 42, ${bgOpacity})` : `rgba(245, 247, 251, ${bgOpacity})` }}>
      <div className="h-full flex flex-col gap-3 p-4 relative">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`absolute top-4 right-4 z-10 h-8 w-8 rounded-full border ${borderColor} ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} grid place-items-center ${isDark ? "text-slate-300" : "text-slate-600"} transition`}
          title="Settings"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2">
            <img src={logoDataUri} alt="Deep Work logo" className="h-9 w-9" />
            <h1 className={`text-xl font-semibold leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>Focus Flow</h1>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Your minimal focus companion</p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-5 border-b pb-1 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <Tab icon={<span>🎯</span>} selected isDark={isDark}>Focus</Tab>
          <Tab icon={<span>⚙️</span>} isDark={isDark}>Distractions</Tab>
          <Tab icon={<span>❓</span>} isDark={isDark}>Hints</Tab>
          <Tab icon={<span>📊</span>} isDark={isDark}>Stats</Tab>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onUpdate={async (updates) => {
              await updateSettings(updates)
              const newSettings = await getSettings()
              setSettings(newSettings)
            }}
            onClose={() => setShowSettings(false)}
            isDark={isDark}
            cardBg={cardBg}
            borderColor={borderColor}
            inputBg={inputBg}
          />
        )}

        {/* Body: form when idle, big ring when running */}
        {!running ? (
          <div className={`flex-1 min-h-0 rounded-2xl ${cardBg} border ${borderColor} shadow p-4 flex flex-col`} style={{ backgroundColor: isDark ? `rgba(30, 41, 59, ${bgOpacity})` : `rgba(255, 255, 255, ${bgOpacity})` }}>
            <h2 className={`text-lg font-semibold text-center ${isDark ? "text-slate-100" : "text-slate-800"}`}>Start a Focus Session</h2>
            <p className={`text-center text-sm mt-0.5 mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              What are you working on today?
            </p>

            <label className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>Session Title</label>
            <input
              className={`mt-1 mb-3 w-full rounded-lg border px-3 py-2 text-sm ${inputBg}`}
              placeholder="e.g., Algorithms homework…"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={running}
            />

            <div className={`text-xs mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Session Type</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Pill icon={<ClockIcon />}  label="Pomodoro"   sub="25min"
                    selected={type==="pomodoro"} onClick={()=>setType("pomodoro")} disabled={running} isDark={isDark}/>
              <Pill icon={<ZapIcon   />}  label="Flow State"  sub="90min"
                    selected={type==="flow"}     onClick={()=>setType("flow")}     disabled={running} isDark={isDark}/>
              <Pill icon={<TargetIcon/>}  label="Quick Focus" sub="15min"
                    selected={type==="quick"}   onClick={()=>setType("quick")}    disabled={running} isDark={isDark}/>
            </div>

            <div className={`text-xs mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Duration (minutes)</div>
            <input
              type="number"
              className={`w-full rounded-lg border px-3 py-2 mb-3 text-sm ${inputBg}`}
              value={durationMin}
              onChange={e => { setType("custom"); setDurationMin(parseInt(e.target.value || "0")) }}
              min={1}
              disabled={running}
            />

            <button
              className="w-full rounded-lg bg-[#601ff5] text-white py-2 text-sm font-medium shadow hover:bg-[#601ff5]/90 disabled:opacity-50"
              onClick={start}
              disabled={!canStart}
            >
              Start Focus Session
            </button>
          </div>
        ) : (
          <RunningView
            active={active!}
            remainingMs={remainingMs}
            isPaused={!!active!.pausedAt}
            isDark={isDark}
            cardBg={cardBg}
            borderColor={borderColor}
            bgOpacity={bgOpacity}
            onReset={async () => {
              await chrome.runtime.sendMessage({ type: "STOP_SESSION" })
              const startResponse = await chrome.runtime.sendMessage({
                type: "START_SESSION",
                task: active!.task,
                sessionType: active!.type,
                durationMin: Math.round(active!.durationMs / 60000)
              })
              // Refresh the active session state after reset
              const s = await getActive()
              setActiveState(s)
            }}
            onPause={pause}
            onResume={resume}
            onStop={stop}
          />
        )}
      </div>
    </div>
  )
}

function SettingsPanel({
  settings,
  onUpdate,
  onClose,
  isDark,
  cardBg,
  borderColor,
  inputBg
}: {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => Promise<void>
  onClose: () => void
  isDark: boolean
  cardBg: string
  borderColor: string
  inputBg: string
}) {
  return (
    <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-xl p-6 w-full max-w-sm`} style={{ backgroundColor: isDark ? `rgba(30, 41, 59, 0.98)` : `rgba(255, 255, 255, 0.98)` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Settings</h2>
          <button
            onClick={onClose}
            className={`h-8 w-8 rounded-full ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} grid place-items-center transition`}
          >
            <svg viewBox="0 0 24 24" className={`h-5 w-5 ${isDark ? "text-slate-300" : "text-slate-600"}`} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Theme
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => onUpdate({ theme: "light" })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                  settings.theme === "light"
                    ? "border-[#601ff5] bg-[#601ff5] text-white"
                    : `${borderColor} ${isDark ? "bg-slate-700 text-slate-200" : "bg-white text-slate-700"}`
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onUpdate({ theme: "dark" })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                  settings.theme === "dark"
                    ? "border-[#601ff5] bg-[#601ff5] text-white"
                    : `${borderColor} ${isDark ? "bg-slate-700 text-slate-200" : "bg-white text-slate-700"}`
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Transparency Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Transparency
              </label>
              <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {settings.transparency}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.transparency}
              onChange={(e) => onUpdate({ transparency: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#601ff5]"
              style={{
                background: `linear-gradient(to right, #601ff5 0%, #601ff5 ${settings.transparency}%, rgb(226 232 240) ${settings.transparency}%, rgb(226 232 240) 100%)`
              }}
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>Opaque</span>
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>Transparent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tab({ icon, children, selected=false, onClick, isDark=false }:{
  icon: React.ReactNode; children: React.ReactNode; selected?: boolean; onClick?: () => void; isDark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
        selected ? "bg-[#601ff5] text-white shadow" : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"
      ].join(" ")}
    >
      <span className={selected ? "text-white" : isDark ? "text-slate-500" : "text-slate-500"}>{icon}</span>
      {children}
    </button>
  )
}

function Pill({ icon, label, sub, selected, onClick, disabled, isDark=false }:{
  icon: React.ReactNode; label: string; sub: string; selected: boolean; onClick: () => void; disabled?: boolean; isDark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full flex flex-col items-center justify-center text-center",
        "rounded-xl px-3 py-3 transition border shadow-sm",
        selected
          ? "bg-[#601ff5] border-[#601ff5] text-white shadow-[0_8px_20px_-6px_rgba(96,31,245,0.6)]"
          : isDark 
            ? "bg-slate-700 border-slate-600 hover:border-slate-500 hover:shadow"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow",
      ].join(" ")}
    >
      <div className={["h-6 w-6 mb-1.5 grid place-items-center rounded-full", selected ? "bg-white/20" : isDark ? "bg-slate-600 text-slate-300" : "bg-slate-100 text-slate-600"].join(" ")}>
        {icon}
      </div>
      <div className={`text-xs font-semibold ${selected ? "text-white" : isDark ? "text-slate-200" : "text-slate-800"}`}>{label}</div>
      <div className={`text-[11px] mt-0.5 ${selected ? "text-indigo-100" : isDark ? "text-slate-400" : "text-slate-500"}`}>{sub}</div>
    </button>
  )
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 200, stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = Math.max(0, Math.min(1, progress)) * c
  return (
    <svg width={size} height={size} className="mx-auto text-[#601ff5]">
      <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none"
        strokeDasharray={`${dash} ${c}`} transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  )
}

function RunningView({
  active, remainingMs, isPaused, onReset, onPause, onResume, onStop, isDark, cardBg, borderColor, bgOpacity
}: {
  active: ActiveSession
  remainingMs: number
  isPaused: boolean
  onReset: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  isDark: boolean
  cardBg: string
  borderColor: string
  bgOpacity: number
}) {
  const total = active.durationMs
  const rem = Math.max(0, remainingMs)
  const progress = 1 - rem / total

  const m = Math.floor(rem / 60_000)
  const s = Math.floor((rem % 60_000) / 1000)
  const timeText = `${m}:${s.toString().padStart(2, "0")}`

  return (
    <div className={`flex-1 min-h-0 rounded-2xl ${cardBg} border ${borderColor} shadow p-6 flex flex-col items-center`} style={{ backgroundColor: isDark ? `rgba(30, 41, 59, ${bgOpacity})` : `rgba(255, 255, 255, ${bgOpacity})` }}>
      <div className="text-center mb-2">
        <div className={isDark ? "text-slate-100 font-medium" : "text-slate-700 font-medium"}>{active.task}</div>
        <div className={isDark ? "text-slate-400 text-sm" : "text-slate-500 text-sm"}>{
          active.type === "pomodoro" ? "Pomodoro Session" :
          active.type === "flow" ? "Flow Session" :
          active.type === "quick" ? "Quick Focus" : "Custom"
        } • {Math.round(active.durationMs/60000)}min</div>
      </div>

      <div className="relative my-6">
        <ProgressRing progress={progress} />
        <div className="absolute inset-0 grid place-items-center">
          <div className={`text-5xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{timeText}</div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-5 pb-1">
        {/* Reset */}
        <button
          onClick={onReset}
          className={`h-12 w-12 rounded-full border ${borderColor} ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-50"} grid place-items-center text-lg ${isDark ? "text-slate-300" : "text-slate-700"}`}
          title="Reset"
        >↻</button>

        {/* Pause/Resume */}
        {isPaused ? (
          <button
            onClick={onResume}
            className="h-14 w-14 rounded-full bg-[#601ff5] text-white shadow-md hover:bg-[#601ff5]/90 grid place-items-center text-xl"
            title="Resume"
          >▶</button>
        ) : (
          <button
            onClick={onPause}
            className="h-14 w-14 rounded-full bg-[#601ff5] text-white shadow-md hover:bg-[#601ff5]/90 grid place-items-center text-xl"
            title="Pause"
          >⏸</button>
        )}

        {/* Stop */}
        <button
          onClick={onStop}
          className={`h-12 w-12 rounded-full border ${borderColor} ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-50"} grid place-items-center text-lg ${isDark ? "text-slate-300" : "text-slate-700"}`}
          title="Stop"
        >■</button>
      </div>
    </div>
  )
}
