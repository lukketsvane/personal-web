import { cn } from "./utils"

// Meir subtile fargar (muted colors)
const TAG_COLORS = [
  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
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
  
  // Spesielle fargar for hovudtypar (framleis tydelege, men meir balanserte)
  switch (lowercaseTag) {
    case "skriving":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
    case "bok":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200"
    case "prosjekt":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200"
    case "lenkje":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200"
    case "interaktiv":
      return "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200"
    case "bilete":
      return "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200"
  }

  // Generer unik farge basert på hash for alle andre merkelappar
  const hash = stringToHash(lowercaseTag)
  const colorClass = TAG_COLORS[hash % TAG_COLORS.length]
  return colorClass
}
