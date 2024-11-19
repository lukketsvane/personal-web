import { ExternalLink } from 'lucide-react'

interface OutgoingLinkProps {
  href: string
  children: React.ReactNode
}

export default function OutgoingLink({ href, children }: OutgoingLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
    >
      {children}
      <ExternalLink className="w-4 h-4" />
    </a>
  )
}