import React from "react"

export const ClockIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" className={filled ? "text-white" : ""} />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const ZapIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
  </svg>
)

export const TargetIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
  </svg>
)

export const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

