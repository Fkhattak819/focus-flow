// Session Types
export type SessionType = "pomodoro" | "flow" | "quick" | "custom"

export type ActiveSession = {
  task: string
  startedAt: number
  durationMs: number
  type: SessionType
  pausedAt?: number // timestamp when paused, undefined if running
  totalPausedMs?: number // total milliseconds paused so far
}

// Settings Types
export type Theme = "light" | "dark"

export type Settings = {
  transparency: number // 0-100
  theme: Theme
}

