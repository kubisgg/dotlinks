# dotlinks

Personal links page with a terminal UI. Runs neofetch-style intro, lists links from external URLs.

**[Live demo](https://kubisgg.pl)**

---

## Features

- Typewriter intro animation (click anywhere to skip)
- Keyboard navigation - `j`/`k` or `↑`/`↓` to select, `Enter` to open
- Links and bio fetched from external URLs at build time

## Stack

- [Astro](https://astro.build) - static site generator
- [React](https://react.dev) - interactive shell component
- [react-icons](https://react-icons.github.io/react-icons) - icons

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env` and fill in URLs:

```env
LINKS_URL=https://example.com/links.json
BIO_URL=https://example.com/bio.txt
```

```bash
pnpm dev      # localhost:4321
pnpm build
```

## Data format

**`LINKS_URL`** - JSON array:

```json
[
  { "id": "github", "label": "github", "handle": "user",           "href": "https://github.com/user" },
  { "id": "email",  "label": "email",  "handle": "hi@example.com", "href": "mailto:hi@example.com" }
]
```

`id` controls which icon is shown next to the link.

**`BIO_URL`** - plain text file
