# alt.it — Visual Product Search SPA

> Upload an image. Find the product. Instantly.

**alt.it** is a refined, editorial-feeling product discovery tool for interior design enthusiasts. Upload any product image and the app uses AI to find visually similar products for sale — ranked by relevance, streamed in real time.

---

## Features

- 📷 **Image Upload** — Drag & drop, paste, URL, or file upload
- 🔍 **AI-Powered Visual Search** — AI agent searches the web for visually similar products
- 🛒 **Product Validation** — Scraping agent verifies availability and extracts key product details (GTIN/UPC, brand, model, SKU)
- 📊 **Live Streaming Results** — Products stream in as they are found and validated
- 🎨 **Three Color Themes** — Lavender & Sunflower · Terracotta & Sage · Deep Teal & Coral
- 🔽 **Filtering & Sorting** — Filter by price range, rating, and dynamic product features; sort by relevance, price, or rating
- 👤 **User Accounts** — JWT authentication, profile management, and usage history
- ⭐ **Saved Products** — Favorite and revisit products across sessions

---

## Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| React + Vite | SPA framework & build tool |
| TypeScript | Type safety |
| Tailwind CSS | Styling & theme system |
| Framer Motion | Animations |
| React Router | Client-side routing |
| Vitest | Unit & component testing |
| Playwright / Cypress | End-to-end testing |

### Backend (`/backend`)
| Technology | Purpose |
|---|---|
| Python + FastAPI | REST API & streaming |
| Uvicorn | ASGI server |
| TinyDB | Lightweight persistence |
| SerpAPI | Google Shopping product data |
| OpenAI / Anthropic | AI visual search agent |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.11
- A [SerpAPI](https://serpapi.com/) API key
- An OpenAI **or** Anthropic API key

### Frontend Setup

```bash
cd client
cp .env.example .env          # Fill in your VITE_API_URL
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Fill in your API keys
uvicorn main:app --reload
```

### Environment Variables

**`client/.env`**
```
VITE_API_URL=http://localhost:3000
```

**`backend/.env`**
```
AI_PROVIDER=openai            # or anthropic
OPEN_AI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
SERP_API_KEY=your_key_here
```

---

## Design System

The UI is documented in [`DESIGN.md`](./DESIGN.md). All visual changes must adhere to the design guidelines.

### Color Themes

| Theme | Primary | Accent | Modes |
|---|---|---|---|
| **Lavender & Sunflower** | `#B57EDC` | `#FFDA03` | Light only |
| **Terracotta & Sage** | `#e37059` | `#fbbf24` | Light + Dark |
| **Deep Teal & Coral** | `#008080` | `#FF7F50` | Light + Dark |

Themes are driven by Tailwind CSS variables — a single source of truth. The active theme is cached in `localStorage` and reapplied on app load.

---

## Project Roadmap

| Phase | Goal | Status |
|---|---|---|
| 1 | Frontend scaffold (Vite + React + Tailwind) | ⬜ Pending |
| 2 | UI layout, theme switcher, upload zone, mock results | ⬜ Pending |
| 3 | Backend API, AI search agent, SerpAPI integration | ⬜ Pending |
| 4 | Frontend ↔ Backend integration, auth, saved products | ⬜ Pending |
| 5 | End-to-end tests (Playwright / Cypress) | ⬜ Pending |
| 6 | Polish — animations, drag feedback, hover states | ⬜ Pending |

---

## Development

### Running Tests

```bash
# Frontend unit tests
cd client && npm run test

# Backend tests
cd backend && pytest

# E2E tests
cd client && npx playwright test
```

### Linting & Formatting

```bash
cd client
npm run lint        # ESLint (Standard + TypeScript rules)
npm run format      # Prettier
```

---

## Error Handling

The application implements resilient error handling throughout:

- **API failures** — Retried up to 3× with exponential back-off (1s → 2s → 4s)
- **Rate limits (HTTP 429)** — Requests pause per the `Retry-After` header and queue sequentially
- **AI provider errors** — Timeout retries (3×); quota errors wait for reset
- **Scraping concurrency** — Limited to 5 concurrent requests via semaphore
- **Test failures** — After 3 consecutive failures a `DEBUG REPORT.md` is generated; escalated after a 4th failure

---

## AI Disclosure

This project was designed and built **primarily with AI assistance**. The architecture, code, UI design, and this documentation were all generated through an agentic AI workflow.

### Tools Used

| Tool | Role |
|---|---|
| [Google Antigravity (Gemini)](https://deepmind.google/) | Autonomous coding agent — planning, implementation, testing, and documentation |
| [Google Stitch](https://stitch.withgoogle.com/) | UI design & screen generation for the frontend SPA |

> **Note:** Human oversight was maintained throughout. All AI-generated output was reviewed and the project direction was guided by a human author.

---

## License

This project is licensed under the [MIT License](./LICENSE).
