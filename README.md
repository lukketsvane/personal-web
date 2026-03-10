# iverfinne.no

Personleg nettstad og portefølje driven av Notion API.

## Arkitektur
- **Rammeverk:** Next.js 16 (App Router) med React 19.
- **Innhald:** Henta direkte frå Notion-database via `@notionhq/client`.
- **Rendering:** MDX-prosessering med `next-mdx-remote` (v6+).
- **Yting:** Server-side caching med `unstable_cache` og førehandsserialisering for umiddelbar respons ved utviding av innlegg.
- **Navigasjon:** Statisk genererte ruter (`/[slug]`) for lynrask lasting.
- **Styling:** Tailwind CSS med Framer Motion for mjuke overgangar.

## Datamodell (Notion)
Databasen i Notion må ha følgjande eigenskapar:

| Eigenskap | Type | Skildring |
| :--- | :--- | :--- |
| **Namn** | title | Hovudtittel (påkravd) |
| **Status** | status | `Å gjere`, `Under arbeid`, `Ferdig` (berre `Ferdig` blir publisert) |
| **Type** | select | `Skriving`, `Bok`, `Prosjekt`, `Lenkje` |
| **Dato** | date | Publiseringsdato |
| **Merkelappar** | multi_select | Kategorisering (t.d. design, filosofi, 3D) |
| **Slug** | rich_text | URL-identifikator (t.d. `art-i-materialhistorie`) |
| **Samandrag** | rich_text | Kort tekst for kortvisning |

## Utvikling
### Miljøvariablar
Opprett `.env.local` i `iverfinne.no/`:
- `NOTION_API_KEY`: Din interne integrasjonsnøkkel.
- `NOTION_DATABASE_ID`: ID til Notion-databasen.

### Køyr lokalt
```bash
cd iverfinne.no
pnpm install
pnpm run dev
```

## Struktur
- `app/`: Ruter, API-punkt og globale stilar.
- `components/`: UI-komponentar og MDX-oppsett.
- `lib/`: Integrasjonar (Notion, tag-logikk) og verktøy.
- `public/`: Statiske filer (ikoner, modellar).
- `types/`: TypeScript-definisjonar.

## Robusthet
Innhaldet blir rendra med ein automatisk `getSafeScope` som fangar opp ord i krøllparentesar `{}` frå Notion og definerer dei som tomme strengar. Dette hindrar `ReferenceError` viss teksten inneheld JSX-liknande fragment.
