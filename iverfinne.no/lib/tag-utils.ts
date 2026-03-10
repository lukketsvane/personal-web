import { cn } from "./utils"

// Meir varierte, men framleis mjuke pastellfargar (muted but distinct)
const TAG_COLORS = [
  "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  "bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800",
  "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800",
  "bg-lime-50 text-lime-600 border-lime-100 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800",
  "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
]

const stringToHash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export const getTagColor = (tag: string) => {
  const lowercaseTag = tag.toLowerCase()
  
  // Faste, gjenkjennbare fargar for hovudtypar (mjuke versjonar)
  switch (lowercaseTag) {
    case "skriving":
      return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
    case "bok":
      return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
    case "prosjekt":
      return "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800"
    case "lenkje":
      return "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
    case "interaktiv":
      return "bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800"
    case "bilete":
      return "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800"
  }

  // Generer unik farge basert på hash for alle andre merkelappar
  const hash = stringToHash(lowercaseTag)
  const colorClass = TAG_COLORS[hash % TAG_COLORS.length]
  return colorClass
}
