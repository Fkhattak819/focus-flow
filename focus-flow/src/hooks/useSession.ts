import { useEffect, useState } from "react"
import { getActive } from "../lib/storage"
import type { ActiveSession } from "../types"

export function useSession() {
  const [active, setActive] = useState<ActiveSession | null>(null)
  const [remainingMs, setRemainingMs] = useState<number>(0)

  // Load current session
  useEffect(() => {
    getActive().then(setActive)
  }, [])

  // Live countdown
  useEffect(() => {
    const id = setInterval(async () => {
      const s = await getActive()
      setActive(s)
      if (!s) {
        setRemainingMs(0)
        return
      }
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

  return { active, remainingMs, setActive }
}

