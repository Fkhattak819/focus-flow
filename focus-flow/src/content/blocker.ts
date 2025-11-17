import { getActive } from "../lib/storage"
import { isDistractingSite } from "../lib/distractions"

// Check if current page should be blocked
async function checkAndBlock() {
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
    return false
  }

  const domain = window.location.hostname
  const isDistracting = await isDistractingSite(domain)
  
  if (isDistracting) {
    // Inject blocking overlay
    const overlay = document.createElement("div")
    overlay.id = "focus-flow-blocker"
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f5f7fb;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
    `
    overlay.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px;">
        <h1 style="color: #601ff5; margin: 0 0 1rem 0; font-size: 1.5rem;">🚫 Site Blocked</h1>
        <p style="margin: 0; color: #64748b;">${domain} is blocked during your focus session.</p>
        <p style="margin: 1rem 0 0 0; color: #64748b; font-size: 0.875rem;">Stay focused! 💪</p>
      </div>
    `
    document.body.appendChild(overlay)
    
    // Prevent any interaction with the page
    document.body.style.overflow = "hidden"
    
    // Notify background to increment nudge count
    chrome.runtime.sendMessage({ type: "INCREMENT_NUDGE", domain })
    
    return true
  }
  
  return false
}

// Run check immediately
checkAndBlock()

// Also check on navigation (for SPAs)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    // Remove existing blocker if any
    const existing = document.getElementById("focus-flow-blocker")
    if (existing) {
      existing.remove()
      document.body.style.overflow = ""
    }
    checkAndBlock()
  }
}).observe(document, { subtree: true, childList: true })

