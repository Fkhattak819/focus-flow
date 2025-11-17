import type { DistractingSite, SiteCategory } from "../types"

const KEY = "distractingSites"

export async function getDistractingSites(): Promise<DistractingSite[]> {
  const r = await chrome.storage.local.get(KEY)
  return (r[KEY] as DistractingSite[] | undefined) ?? []
}

export async function addDistractingSite(
  name: string,
  domain: string,
  category: SiteCategory = "other"
): Promise<void> {
  const sites = await getDistractingSites()
  const newSite: DistractingSite = {
    id: `${domain}-${Date.now()}`,
    name,
    domain: domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, ""),
    category,
    nudgeCount: 0,
    createdAt: Date.now(),
  }
  sites.push(newSite)
  await chrome.storage.local.set({ [KEY]: sites })
}

export async function removeDistractingSite(id: string): Promise<void> {
  const sites = await getDistractingSites()
  const filtered = sites.filter((s) => s.id !== id)
  await chrome.storage.local.set({ [KEY]: filtered })
}

export async function incrementNudgeCount(domain: string): Promise<void> {
  const sites = await getDistractingSites()
  const normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "")
  const domainWithoutWww = normalizedDomain.replace(/^www\./, "")
  
  const updated = sites.map((s) => {
    const siteDomain = s.domain.toLowerCase()
    const siteDomainWithoutWww = siteDomain.replace(/^www\./, "")
    
    // Match using same logic as isDistractingSite
    const matches = (
      normalizedDomain === siteDomain ||
      normalizedDomain === siteDomainWithoutWww ||
      siteDomain === domainWithoutWww ||
      normalizedDomain.endsWith(`.${siteDomain}`) ||
      normalizedDomain.endsWith(`.${siteDomainWithoutWww}`) ||
      siteDomain.endsWith(`.${domainWithoutWww}`)
    )
    
    if (matches) {
      return { ...s, nudgeCount: s.nudgeCount + 1 }
    }
    return s
  })
  
  await chrome.storage.local.set({ [KEY]: updated })
}

export async function isDistractingSite(domain: string): Promise<boolean> {
  const sites = await getDistractingSites()
  if (sites.length === 0) {
    console.log(`[Focus Flow] No distracting sites configured`)
    return false
  }
  
  // Normalize the input domain
  let normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "")
  
  // Remove www. prefix for matching
  const domainWithoutWww = normalizedDomain.replace(/^www\./, "")
  
  const isMatch = sites.some((s) => {
    const siteDomain = s.domain.toLowerCase()
    const siteDomainWithoutWww = siteDomain.replace(/^www\./, "")
    
    // Match exact domain or subdomain
    // e.g., "youtube.com" matches "youtube.com", "www.youtube.com", "m.youtube.com"
    const matches = (
      normalizedDomain === siteDomain ||
      normalizedDomain === siteDomainWithoutWww ||
      siteDomain === domainWithoutWww ||
      normalizedDomain.endsWith(`.${siteDomain}`) ||
      normalizedDomain.endsWith(`.${siteDomainWithoutWww}`) ||
      siteDomain.endsWith(`.${domainWithoutWww}`)
    )
    
    if (matches) {
      console.log(`[Focus Flow] Matched ${normalizedDomain} with ${siteDomain}`)
    }
    
    return matches
  })
  
  if (!isMatch) {
    console.log(`[Focus Flow] ${normalizedDomain} is not in distracting sites list:`, sites.map(s => s.domain))
  }
  
  return isMatch
}

