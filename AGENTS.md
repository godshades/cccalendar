# AGENTS.md — CC Calendar

Credit card payment tracking web app. No build system — static files only.

## Quick Start

Open `index.html` directly in browser, or serve locally:
```bash
python3 -m http.server 8000
```

## Key Facts

- **Stack**: HTML5 + Tailwind CSS (CDN) + Alpine.js (CDN) + LZ-String
- **Storage**: Browser localStorage (keys: `cccalendar_data`, `cccalendar_matrix_notes`, `cccalendar_hidden_categories`)
- **No backend**: All logic runs client-side
- **Data source**: Fetches `/data/cards.json` and `/data/cards_name.txt` at runtime

## Entry Points

| File | Purpose |
|------|---------|
| `index.html` | Main UI — 3 views: calendar, list, matrix |
| `app.js` | Alpine.js component (`ccCalendar()`) — all state & logic |
| `style.css` | Custom styles ( Tailwind on top) |
| `data/cards.json` | Prebuilt card definitions with cashback rates |

## Data Flow

1. `app.js` `init()` fetches card names from `/data/cards_name.txt` and card data from `/data/cards.json`
2. User adds cards → stored in `customCards` array
3. On every change → `saveToLocalStorage()` serializes to localStorage
4. Export: `JSON.stringify` → LZString.compressToBase64 → clipboard

## Code Patterns

- **Alpine.js**: Single global function `ccCalendar()` returns all state/methods
- **State**: `currentView`, `customCards`, `monthlyStatus`, `matrixNotes`, etc.
- **Computed**: `userCards` getter merges customCards with max-reached status
- **No framework** — plain JS, no npm, no bundling

## Common Tasks

| Task | How |
|------|-----|
| Add new card | Edit `data/cards.json` + `data/cards_name.txt` |
| Modify cashback rates | Edit `cashbackCategories` in `data/cards.json` |
| Change UI styling | Edit Tailwind classes in `index.html` or `style.css` |
| Fix Alpine logic | Edit `app.js` — function returns state object |
| Test changes | Open `index.html` in browser, refresh |

## Testing

No test suite. Manual testing only — open in browser, verify card add/edit/delete/export/import.

## Deployment

Pushed to Cloudflare Pages. Auto-deploys from main branch.
