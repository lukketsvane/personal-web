import { cn } from "./utils"

// Klåre og tydelege pastellfargar som ikkje er for mørke
const TAG_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700",
  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700",
  "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-700",
  "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700",
  "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700",
  "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-200 dark:border-cyan-700",
  "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-700",
  "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-200 dark:border-teal-700",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/40 dark:text-fuchsia-200 dark:border-fuchsia-700",
  "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-700",
  "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/40 dark:text-lime-200 dark:border-lime-700",
  "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-700",
  "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-200 dark:border-pink-700",
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
  
  // Faste fargar for hovudtypar (gjort litt meir metta for å vere tydelege)
  switch (lowercaseTag) {
    case "skriving":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700"
    case "bok":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700"
    case "prosjekt":
      return "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-700"
    case "lenkje":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-700"
    case "interaktiv":
      return "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-200 dark:border-pink-700"
    case "bilete":
      return "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-200 dark:border-cyan-700"
  }

  const hash = stringToHash(lowercaseTag)
  return TAG_COLORS[hash % TAG_COLORS.length]
}
