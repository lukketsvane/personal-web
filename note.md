`# iverfinne.no — Notion-databasestruktur`

`Kvar rad i databasen er éin post på nettsida. Synkroniseringa hentar alle sider der Status = "Done".`

`## Properties (kolonnar)`

`| Property | Type | Påkravd | Verdiar / Format |`

`|----------|------|---------|------------------|`

`| Name | Title | Ja | Tittelen på posten |`

`| Status | Status | Ja | To Do · In Progress · Done (berre "Done" vert publisert) |`

`| Type | Select | Ja | Skriving · Bok · Prosjekt · Lenkje |`

`| Date | Date | Ja | YYYY-MM-DD |`

`| Tags | Multi-select | Valfritt | t.d. design, filosofi, ai, kunst, skriving, … |`

`| Slug | Text | Valfritt | URL-slug, t.d. art-v-form-follows-fitness. Autogenerert frå tittel om tom. |`

`| Summary | Text | Valfritt | Kort beskriving for førehandsvising / kortvisning |`

`## Eksempel (tom rad, JSON)`

`{`

  `"Name": "",`

  `"Status": "To Do",`

  `"Type": null,`

  `"date:Date:start": null,`

  `"date:Date:end": null,`

  `"date:Date:is_datetime": 0,`

  `"Tags": [],`

  `"Slug": "",`

  `"Summary": ""`

`}`

`## Sideinnhald (body)`

`Kvar side har ein Notion-body med vanleg innhald: overskrifter, avsnitt, bilete (som URL), tabellar, skiljelinjer osv. Synkroniseringa konverterer dette til MDX-filer i content/-mappa i repoet.`

`## Synkronisering`

`- Automatisk kvar time via GitHub Actions (Sync Notion Content)`

`- Manuelt: GitHub Actions → "Run workflow"`

`- Berre sider med Status = Done vert synkroniserte`