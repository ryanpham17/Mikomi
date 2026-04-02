# MIKOMI 見込み

MIKOMI is a manga discovery app. Right now it’s primarily a **search UI**: you type a manga title you like and it fetches matching manga from the **Kitsu API**, displaying results as cards with images, synopsis snippets, and star ratings.

The longer-term goal (in progress) is the “manga matchmaker” experience described on the landing page: using AI/similarity to recommend titles you’ll love. A backend folder exists with Python dependencies that suggest a planned FastAPI + embeddings workflow, but it is not wired into the frontend yet.

## What works today

- **Landing page** (`/`)
  - Hero background image + tagline
  - Search bar that navigates to the search results page
- **Search results page** (`/search?q=...`)
  - Calls the Kitsu API using the `q` query string
  - Displays a grid of manga cards
  - Pagination UI
  - “Back to top” floating button

## Tech stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: `react-router-dom`
- **Styling**: Tailwind CSS (custom theme colors + fonts)
- **Icons**: `lucide-react`
- **Dependencies present (not all used everywhere yet)**: `axios`, `@tanstack/react-query`, `zustand`

## API being used

- **Kitsu API**
  - Endpoint: `GET https://kitsu.io/api/edge/manga`
  - Filter: `filter[text]=<search query>`
  - Pagination: `page[limit]` and `page[offset]`
  - Some requested fields: `canonicalTitle`, `synopsis`, `averageRating`, `posterImage`, etc.

The fetch logic currently lives in `components/Cards.tsx` (`fetchMangaFromKitsu`).

## Project structure (current)

This repo currently has two main areas:

- **`mikomi/`**: Vite + React frontend
  - `index.html`: mounts `#root`
  - `src/main.tsx`: renders `App`
  - `src/App.tsx`: routes:
    - `/` → `components/Home.tsx`
    - `/search` → `components/Cards.tsx`
  - `components/`
    - `Home.tsx`: landing page + search navigation
    - `Cards.tsx`: search results page (Kitsu fetch + cards + pagination)
    - `SearchBar.tsx`: reusable search input
    - `Navbar.tsx`, `Footer.tsx`
  - Styling:
    - `src/index.css`: Tailwind directives + Google Fonts import
    - `tailwind.config.js`: custom colors, typography, and utilities
- **`mikomi-backend/`**: Python backend area (WIP)
  - `requirements.txt` includes `fastapi`, `uvicorn`, `sentence-transformers`, `requests`, `numpy`
  - There is currently **no backend app entrypoint** in the repo outside the virtualenv (no `main.py` / `app.py` found).
  - A local virtualenv exists under `mikomi-backend/mikomi_venv/` (typically you would not commit this to git).

## Running the frontend (Windows / PowerShell)

From the `mikomi/` folder:

```bash
npm install
npm run dev
```

Then open the dev server URL Vite prints (often `http://localhost:5173/`).

## Scripts (frontend)

From `mikomi/package.json`:

- **`npm run dev`**: start Vite dev server
- **`npm run build`**: typecheck/build (`tsc -b`) then bundle (`vite build`)
- **`npm run lint`**: run ESLint
- **`npm run preview`**: preview the production build locally

## Tailwind theme notes

Tailwind config: `tailwind.config.js`

- **Colors**: `primary` (`#161616`), `secondary`, and custom `gray` scale
- **Typography**: `font-body` mapped to Google Font **Figtree**
- **Utilities**: custom transition duration (`410ms`), extraBold weight, and a custom height (`h-28.5` = `30rem`)

## Known limitations / TODOs

- **Genres are placeholders**: `components/Cards.tsx` currently uses a hardcoded sample list rather than real genres from the API include.
- **Backend is not connected**: the AI “similarity score” flow is described in UI copy but not implemented end-to-end.
- **SearchBar sync**: `SearchBar.tsx` initializes internal state from the `query` prop; if the prop changes after mount, the input won’t automatically sync (fine for now, but worth revisiting).

## Troubleshooting

- **TypeScript error: “Cannot find module './images/xyz.jpeg' or its corresponding type declarations.”**
  - Add a type declaration file (example: `src/types/assets.d.ts`) with:

```ts
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.webp';
declare module '*.svg';
```

## License

TBD.
