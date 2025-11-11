# Freetar - Next.js

An open-source alternative frontend to Ultimate Guitar, built with Next.js.

## Features

- 🎸 **Search guitar tabs and chords** from Ultimate Guitar
- 🎨 **Clean, ad-free interface** with no popups or distractions
- 📜 **Auto-scroll** for hands-free reading while playing
- 🎵 **Transpose chords** to any key (-11 to +11 semitones)
- ⭐ **Save favorites locally** (no account needed)
- 🌓 **Dark mode** support with system preference detection
- 🖨️ **Print-friendly** formatting
- 🎯 **Chord diagrams** with fingering positions
- 📱 **Responsive design** works on mobile and desktop
- 📝 **ChordPro format** support - view, export, and copy in standard ChordPro notation

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI:** React 18, Bootstrap 5
- **Data Fetching:** Axios, Cheerio (web scraping)
- **Deployment:** Vercel/Node.js

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd freetar-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
freetar-nextjs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── search/        # Search API endpoint
│   │   │   └── tab/           # Tab data API endpoint
│   │   ├── search/            # Search results page
│   │   ├── tab/               # Tab display page
│   │   ├── about/             # About page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (favorites)
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── Navbar.tsx         # Navigation bar with search
│   │   ├── SearchResults.tsx  # Search results table
│   │   ├── TabDisplay.tsx     # Tab display with controls
│   │   ├── ChordDiagram.tsx   # Chord fingering visualization
│   │   └── BootstrapClient.tsx # Bootstrap JS loader
│   ├── lib/                   # Utility libraries
│   │   └── ug.ts              # Ultimate Guitar scraping logic
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Shared types
├── public/                    # Static assets
│   └── guitar.png            # Logo/favicon
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
└── README.md                 # This file
```

## Usage

### Searching for Tabs

1. Enter a song name or artist in the search bar
2. Click the search button or press Enter
3. Browse results and click on a tab to view it

### Viewing Tabs

- **Auto-scroll:** Toggle the autoscroll switch and adjust speed with ❮❮ and ❯❯
- **Transpose:** Use ↑ and ↓ to change the key, click the displayed value to reset
- **Show chords:** Toggle chord diagrams with fingering positions
- **Favorites:** Click the ★ to save/remove from favorites
- **ChordPro View:** Switch between HTML and ChordPro format display
- **Export:** Download tabs as `.cho` files or copy to clipboard

See [CHORDPRO.md](CHORDPRO.md) for detailed ChordPro documentation.

### Managing Favorites

- View all favorites on the home page
- Export favorites to JSON file for backup
- Import favorites from JSON file

### Dark Mode

- Click the 🌓 icon to toggle dark/light mode
- Respects system preference by default
- Preference saved in browser localStorage

## Building for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
vercel
```

## Privacy

Freetar respects your privacy:
- All favorites are stored locally in your browser (localStorage)
- No user data is collected or sent to any server
- Searches and tab requests are proxied through the Next.js API routes
- No analytics or tracking

## Credits

- All chord and tab data is provided by Ultimate Guitar
- This project is not affiliated with Ultimate Guitar
- Original Python version: [freetar](https://github.com/kmille/freetar)

## License

GPL 3.0 - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues, please open an issue on GitHub.
