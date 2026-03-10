# iverfinne.no

Personleg nettstad driven av Notion API.

## Arkitektur
- Rammeverk: Next.js 16 (App Router), React 19.
- Innhald: Henta dynamisk frå Notion via `@notionhq/client`.
- Rendering: MDX via `next-mdx-remote`.
- Styling: Tailwind CSS.
- Yting: Server-side caching med `unstable_cache` og førehandsserialisering for umiddelbar respons.

## Oppsett
Krev `.env.local` med følgjande variablar:
- `NOTION_API_KEY`
- `NOTION_DATABASE_ID`

## Utvikling
```bash
cd iverfinne.no
pnpm install
pnpm run dev
```

## Publisering
1. Opprett side i Notion-database.
2. Sett feltet `Status` til `Ferdig`.
3. Innhaldet blir oppdatert automatisk (60s revalidering).

## Struktur
- `app/`: Ruter, API-punkt og globale stilark.
- `components/`: UI-komponentar og MDX-logikk.
- `lib/`: Notion-integrasjon og hjelpefunksjonar.
- `public/`: Statiske ressursar (bilete, favicon, modellar).
- `scripts/`: Verktøy for migrering og debugging.
- `types/`: TypeScript-definisjonar.
