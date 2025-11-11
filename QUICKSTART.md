# Quick Start Guide

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open http://localhost:3000

## Key Differences from Python Version

### Technology Stack
- **Python Flask** → **Next.js 14 (React)**
- **Jinja2 templates** → **React components**
- **BeautifulSoup** → **Cheerio**
- **requests** → **Axios**
- **jQuery** → **React hooks**

### Architecture
- **Server-side rendering** → **Hybrid (SSR + CSR)**
- **Flask routes** → **Next.js App Router + API routes**
- **Python functions** → **TypeScript modules**

### Features Maintained
✅ Search tabs from Ultimate Guitar
✅ View tabs with chord diagrams
✅ Auto-scroll with speed control
✅ Transpose chords
✅ Favorites (localStorage)
✅ Dark mode
✅ Print-friendly
✅ Sortable results table
✅ Export/import favorites

## Project Structure Comparison

### Python (Original)
```
freetar/
├── freetar/
│   ├── backend.py         # Flask app + routes
│   ├── ug.py             # Scraping logic
│   ├── templates/        # Jinja2 templates
│   └── static/           # JS + CSS
└── pyproject.toml        # Poetry config
```

### Next.js (This version)
```
freetar-nextjs/
├── src/
│   ├── app/              # Pages + API routes
│   ├── components/       # React components
│   ├── lib/             # Utilities (scraping)
│   └── types/           # TypeScript types
└── package.json         # npm config
```

## API Endpoints

### Search
```
GET /api/search?search_term=<query>&page=<number>
```

### Get Tab
```
GET /api/tab?path=<artist>/<song>/tab-<id>
```

## Environment

No environment variables needed for basic functionality.

Optional:
- `PORT` - Server port (default: 3000)

## Development Tips

1. **Hot Reload**: Changes auto-reload in dev mode
2. **TypeScript**: Errors shown in terminal and browser
3. **API Routes**: Located in `src/app/api/`
4. **Components**: All React components in `src/components/`

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
# Build
docker build -t freetar-nextjs .

# Run
docker run -p 3000:3000 freetar-nextjs
```

### Node.js
```bash
npm run build
npm start
```

## Troubleshooting

### Port already in use
```bash
# Change port
PORT=3001 npm run dev
```

### TypeScript errors
```bash
# Check types
npx tsc --noEmit
```

### Build errors
```bash
# Clear cache
rm -rf .next
npm run build
```

## Next Steps

1. Customize styling in `src/app/globals.css`
2. Add more features in components
3. Optimize API caching
4. Add error boundaries
5. Implement SEO improvements
6. Add testing (Jest, React Testing Library)
