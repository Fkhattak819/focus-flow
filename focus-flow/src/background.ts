import { getActive, setActive } from "./lib/storage"
import type { ActiveSession } from "./types"
import { isDistractingSite, incrementNudgeCount } from "./lib/distractions"

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("tick", { periodInMinutes: 1 / 60 }) // ~1s
})
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("tick", { periodInMinutes: 1 / 60 })
})

chrome.runtime.onMessage.addListener((msg, _sender, send) => {
  (async () => {
    if (msg?.type === "INCREMENT_NUDGE") {
      await incrementNudgeCount(msg.domain)
      send({ ok: true })
      return
    }
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

// Helper function to inject blocking script
function injectBlockingScript(tabId: number, domain: string) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (domainName: string) => {
      if (document.getElementById("focus-flow-blocker")) {
        console.log("[Focus Flow] Blocker already exists")
        return
      }
      const overlay = document.createElement("div")
      overlay.id = "focus-flow-blocker"
      overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #f5f7fb; z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: system-ui;`
      overlay.innerHTML = `<div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><h1 style="color: #601ff5; margin: 0 0 1rem 0;">🚫 Site Blocked</h1><p style="margin: 0; color: #64748b;">${domainName} is blocked during your focus session.</p><p style="margin: 1rem 0 0 0; color: #64748b; font-size: 0.875rem;">Stay focused! 💪</p></div>`
      if (document.body) {
        document.body.appendChild(overlay)
        document.body.style.overflow = "hidden"
        console.log("[Focus Flow] ✓ Blocking overlay injected")
      } else {
        // If body doesn't exist yet, wait for it
        const observer = new MutationObserver(() => {
          if (document.body) {
            document.body.appendChild(overlay)
            document.body.style.overflow = "hidden"
            observer.disconnect()
            console.log("[Focus Flow] ✓ Blocking overlay injected (delayed)")
          }
        })
        observer.observe(document.documentElement, { childList: true })
      }
    },
    args: [domain]
  }).then(() => {
    console.log(`[Focus Flow] ✓ Script injection initiated for tab ${tabId}`)
  }).catch((err) => {
    console.error(`[Focus Flow] ✗ Failed to inject script for tab ${tabId}:`, err)
  })
}

// Helper function to check and block a URL
async function checkAndBlockUrl(tabId: number, url: string | undefined) {
  if (!url) return false
  
  // Skip data URLs (already blocked pages)
  if (url.startsWith("data:")) {
    return false
  }
  
  // Skip non-http(s) URLs
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false
  }

  const session = await getActive()
  
  // Allow if no active session
  if (!session) {
    return false
  }

  // Allow if session is paused
  if (session.pausedAt) {
    return false
  }

  // Check if session has expired
  const totalPaused = session.totalPausedMs || 0
  const sessionEndTime = session.startedAt + session.durationMs + totalPaused
  const now = Date.now()
  
  if (now >= sessionEndTime) {
    // Session expired, clean it up
    await endSession("completed")
    return false
  }

  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    console.log(`[Focus Flow] Checking ${domain} (tabId: ${tabId})`)
    console.log(`[Focus Flow] Session active: ${!!session}, Paused: ${!!session?.pausedAt}`)
    
    // Check if this is a distracting site
    const isDistracting = await isDistractingSite(domain)
    
    if (isDistracting) {
      console.log(`[Focus Flow] ✓ Blocking distracting site: ${domain}`)
      await incrementNudgeCount(domain)
      
      // Show notification (optional - don't block if it fails)
      chrome.notifications.create(
        {
          type: "basic",
          title: "Focus Mode Active",
          message: `You're trying to visit ${domain}. Stay focused on your session!`,
        },
        (notificationId) => {
          // Check for errors
          if (chrome.runtime.lastError) {
            // Silently ignore - notification is not critical
            return
          }
        }
      )

      // Redirect to a blocked page immediately
      const blockedPageUrl = `data:text/html,<html><head><title>Blocked</title></head><body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f5f7fb; color: #1e293b;"><div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><h1 style="color: #601ff5; margin: 0 0 1rem 0;">🚫 Site Blocked</h1><p style="margin: 0; color: #64748b;">${domain} is blocked during your focus session.</p><p style="margin: 1rem 0 0 0; color: #64748b; font-size: 0.875rem;">Stay focused! 💪</p></div></body></html>`
      
      // Try to redirect immediately
      chrome.tabs.update(tabId, { url: blockedPageUrl })
        .then(() => {
          console.log(`[Focus Flow] ✓ Successfully redirected tab ${tabId} to blocked page`)
        })
        .catch((error) => {
          console.error(`[Focus Flow] ✗ Failed to redirect tab ${tabId}:`, error)
          // If redirect fails, try injecting script immediately
          injectBlockingScript(tabId, domain)
        })
      
      // Also inject content script as backup (in case redirect is too slow)
      // Use setTimeout to give redirect a chance first
      setTimeout(() => {
        injectBlockingScript(tabId, domain)
      }, 100)
      
      return true
    } else {
      console.log(`[Focus Flow] ✗ ${domain} is not in distracting sites list`)
      return false
    }
  } catch (error) {
    console.error("Error checking URL:", error)
    return false
  }
}

// Block distracting sites during active sessions using tabs API (Manifest V3 compatible)
// Listen for new tabs being created
chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.url && tab.id) {
    await checkAndBlockUrl(tab.id, tab.url)
  }
})

// Track tabs we've already blocked to prevent loops
const blockedTabs = new Set<number>()

// Use webNavigation API to catch navigation earlier (before page loads)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only process main frame navigations
  if (details.frameId !== 0) {
    return
  }
  
  // Skip if already blocked
  if (blockedTabs.has(details.tabId)) {
    return
  }
  
  const blocked = await checkAndBlockUrl(details.tabId, details.url)
  if (blocked) {
    blockedTabs.add(details.tabId)
  }
})

// Also catch when navigation commits (as early as possible)
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // Only process main frame navigations
  if (details.frameId !== 0) {
    return
  }
  
  // Skip if already blocked
  if (blockedTabs.has(details.tabId)) {
    return
  }
  
  const blocked = await checkAndBlockUrl(details.tabId, details.url)
  if (blocked) {
    blockedTabs.add(details.tabId)
  }
})

// Also listen for tab updates as backup
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Skip if we already blocked this tab
  if (blockedTabs.has(tabId)) {
    return
  }
  
  // Check when URL changes (backup check)
  if (changeInfo.url && !changeInfo.url.startsWith("data:")) {
    const blocked = await checkAndBlockUrl(tabId, changeInfo.url)
    if (blocked) {
      blockedTabs.add(tabId)
    }
  }
  
  // Clear blocked status when tab navigates away from blocked page
  if (changeInfo.status === "complete" && tab.url && !tab.url.startsWith("data:")) {
    blockedTabs.delete(tabId)
  }
})

async function endSession(reason: "completed" | "stopped") {
  const s = await getActive()
  if (!s) return
  await setActive(null)
  chrome.action.setBadgeText({ text: "" })
  // Show notification (optional - don't block if it fails)
  chrome.notifications.create(
    {
      type: "basic",
      title: reason === "completed" ? "Focus complete" : "Session stopped",
      message: `Task: ${s.task}`,
    },
    (notificationId) => {
      // Check for errors
      if (chrome.runtime.lastError) {
        // Silently ignore - notification is not critical
        return
      }
    }
  )
  await chrome.alarms.clear("session_end")
}
