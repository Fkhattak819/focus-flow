import React, { useState, useEffect } from "react"
import type { DistractingSite, SiteCategory } from "../types"
import { getDistractingSites, addDistractingSite, removeDistractingSite } from "../lib/distractions"
import { getThemeColors, getTextColorClasses } from "../utils/theme"
import { PRIMARY_COLOR } from "../constants"

interface DistractionsPanelProps {
  settings: { theme: "light" | "dark"; transparency: number }
}

export function DistractionsPanel({ settings }: DistractionsPanelProps) {
  const [sites, setSites] = useState<DistractingSite[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [siteName, setSiteName] = useState("")
  const [siteDomain, setSiteDomain] = useState("")
  const [siteCategory, setSiteCategory] = useState<SiteCategory>("other")

  const isDark = settings.theme === "dark"
  const opacity = settings.transparency / 100
  const colors = getThemeColors(isDark, opacity)
  const textColors = getTextColorClasses(isDark)

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = async () => {
    const loadedSites = await getDistractingSites()
    setSites(loadedSites)
  }

  const handleAdd = async () => {
    if (!siteDomain.trim()) return
    await addDistractingSite(siteName.trim() || siteDomain.trim(), siteDomain.trim(), siteCategory)
    setSiteName("")
    setSiteDomain("")
    setSiteCategory("other")
    setShowAddForm(false)
    await loadSites()
  }

  const handleRemove = async (id: string) => {
    await removeDistractingSite(id)
    await loadSites()
  }

  const getCategoryColor = (category: SiteCategory) => {
    const colors: Record<SiteCategory, string> = {
      social: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      entertainment: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      shopping: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      news: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      other: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    }
    return colors[category]
  }

  return (
    <div className="flex-1 min-h-0 rounded-2xl border shadow p-4 flex flex-col" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-lg font-semibold ${textColors.primary}`}>Distracting Sites</h2>
          <p className={`text-xs mt-0.5 ${textColors.muted}`}>Sites that trigger focus nudges during sessions</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: colors.primary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary
          }}
        >
          <span>+</span>
          Add Site
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 rounded-lg border" style={{ backgroundColor: colors.input, borderColor: colors.border }}>
          <input
            type="text"
            placeholder="Site name (e.g., Instagram)"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full mb-2 rounded-lg border px-3 py-2 text-sm"
            style={{ backgroundColor: colors.button, borderColor: colors.border }}
          />
          <input
            type="text"
            placeholder="Domain (e.g., instagram.com)"
            value={siteDomain}
            onChange={(e) => setSiteDomain(e.target.value)}
            className="w-full mb-2 rounded-lg border px-3 py-2 text-sm"
            style={{ backgroundColor: colors.button, borderColor: colors.border }}
          />
          <select
            value={siteCategory}
            onChange={(e) => setSiteCategory(e.target.value as SiteCategory)}
            className="w-full mb-2 rounded-lg border px-3 py-2 text-sm"
            style={{ backgroundColor: colors.button, borderColor: colors.border }}
          >
            <option value="social">Social</option>
            <option value="entertainment">Entertainment</option>
            <option value="shopping">Shopping</option>
            <option value="news">News</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm"
              style={{ backgroundColor: colors.primary }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setSiteName("")
                setSiteDomain("")
              }}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm border"
              style={{ backgroundColor: colors.button, borderColor: colors.border }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {sites.length === 0 ? (
          <div className={`text-center py-8 ${textColors.muted}`}>
            <p className="text-sm">No distracting sites added yet.</p>
            <p className="text-xs mt-1">Click "Add Site" to get started.</p>
          </div>
        ) : (
          sites.map((site) => (
            <div
              key={site.id}
              className="p-3 rounded-lg border flex items-center justify-between"
              style={{ backgroundColor: colors.input, borderColor: colors.border }}
            >
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${textColors.primary}`}>{site.name}</div>
                <div className={`text-xs mt-0.5 ${textColors.muted}`}>{site.domain}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(site.category)}`}>
                    {site.category}
                  </span>
                  <span className={`text-xs ${textColors.muted}`}>{site.nudgeCount} nudges</span>
                </div>
              </div>
              <button
                onClick={() => handleRemove(site.id)}
                className={`ml-3 h-6 w-6 rounded-full flex items-center justify-center ${textColors.muted} hover:bg-red-100 dark:hover:bg-red-900/30`}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

