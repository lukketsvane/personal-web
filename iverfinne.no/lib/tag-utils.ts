import { cn } from "./utils"

const TAG_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-amber-500",
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
  
  // Faste fargar for hovudtypar
  switch (lowercaseTag) {
    case "skriving":
      return "bg-blue-500 text-white"
    case "bok":
      return "bg-green-500 text-white"
    case "prosjekt":
      return "bg-purple-500 text-white"
    case "lenkje":
      return "bg-orange-500 text-white"
    case "interaktiv":
      return "bg-pink-500 text-white"
    case "bilete":
      return "bg-teal-500 text-white"
  }

  // Generer unik farge basert på hash for alle andre merkelappar
  const hash = stringToHash(lowercaseTag)
  const colorClass = TAG_COLORS[hash % TAG_COLORS.length]
  return `${colorClass} text-white`
}
