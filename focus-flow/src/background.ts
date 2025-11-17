import { getActive, setActive } from "./lib/storage"
import type { ActiveSession } from "./types"

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("tick", { periodInMinutes: 1 / 60 }) // ~1s
})
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("tick", { periodInMinutes: 1 / 60 })
})

chrome.runtime.onMessage.addListener((msg, _sender, send) => {
  (async () => {
    if (msg?.type === "START_SESSION") {
      const s: ActiveSession = {
        task: msg.task,
        type: msg.sessionType,
        startedAt: Date.now(),
        durationMs: msg.durationMin * 60_000,
        totalPausedMs: 0
      }
      await setActive(s)
      await chrome.alarms.clear("session_end")
      await chrome.alarms.create("session_end", { when: s.startedAt + s.durationMs })
      send({ ok: true })
      return
    }
    if (msg?.type === "PAUSE_SESSION") {
      const s = await getActive()
      if (!s || s.pausedAt) {
        send({ ok: false, error: "No active session or already paused" })
        return
      }
      s.pausedAt = Date.now()
      s.totalPausedMs = (s.totalPausedMs || 0)
      await setActive(s)
      await chrome.alarms.clear("session_end")
      send({ ok: true })
      return
    }
    if (msg?.type === "RESUME_SESSION") {
      const s = await getActive()
      if (!s || !s.pausedAt) {
        send({ ok: false, error: "No active session or not paused" })
        return
      }
      const pauseDuration = Date.now() - s.pausedAt
      s.totalPausedMs = (s.totalPausedMs || 0) + pauseDuration
      s.pausedAt = undefined
      await setActive(s)
      // Adjust session_end alarm to account for the pause
      const endTime = s.startedAt + s.durationMs + s.totalPausedMs
      await chrome.alarms.clear("session_end")
      await chrome.alarms.create("session_end", { when: endTime })
      send({ ok: true })
      return
    }
    if (msg?.type === "STOP_SESSION") {
      await endSession("stopped")
      send({ ok: true })
      return
    }
    if (msg?.type === "GET_SESSION") {
      const s = await getActive()
      send({ ok: true, session: s })
      return
    }
  })()
  return true
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "tick") {
    const s = await getActive()
    if (!s || s.pausedAt) return  // Don't update badge if paused
    const totalPaused = s.totalPausedMs || 0
    const remaining = s.startedAt + s.durationMs + totalPaused - Date.now()
    const m = Math.max(0, Math.ceil(remaining / 60_000))
    chrome.action.setBadgeText({ text: m.toString() })
  }
  if (alarm.name === "session_end") {
    await endSession("completed")
  }
})

async function endSession(reason: "completed" | "stopped") {
  const s = await getActive()
  if (!s) return
  await setActive(null)
  chrome.action.setBadgeText({ text: "" })
  chrome.notifications.create({
    type: "basic",
    iconUrl: "assets/deepWorkIcon.png",
    title: reason === "completed" ? "Focus complete" : "Session stopped",
    message: `Task: ${s.task}`
  })
  await chrome.alarms.clear("session_end")
}
