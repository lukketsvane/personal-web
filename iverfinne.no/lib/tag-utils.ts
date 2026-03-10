import { cn } from "./utils"

export const getTagColor = (tag: string) => {
  const lowercaseTag = tag.toLowerCase()
  switch (lowercaseTag) {
    // Typar
    case "skriving":
      return "bg-blue-500 text-white"
    case "bok":
      return "bg-green-500 text-white"
    case "prosjekt":
      return "bg-purple-500 text-white"
    case "lenkje":
      return "bg-orange-500 text-white"
    
    // Emneknaggar (matching existing patterns)
    case "teiknspråk":
    case "sign language":
    case "maskinlæring":
    case "machine learning":
    case "maskinsyn":
    case "computer vision":
      return "bg-blue-500 text-white"
    
    case "tilgjenge":
    case "accessibility":
    case "rørslegjenkjenning":
    case "gesture recognition":
      return "bg-green-500 text-white"
    
    case "advent-of-code":
      return "bg-red-500 text-white"
    
    case "filosofi":
    case "philosophy":
    case "visualisering":
    case "visualization":
    case "d3js":
    case "wittgenstein":
    case "react":
      return "bg-purple-500 text-white"
    
    case "3d":
    case "design":
    case "interaktiv":
    case "interactive":
    case "spline":
      return "bg-yellow-500 text-white"
    
    default:
      return "bg-gray-500 text-white"
  }
}
