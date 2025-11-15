import {
  FaMagnifyingGlass,
  FaWandMagicSparkles,
  FaScroll,
  FaMusic,
  FaStar,
  FaMoon,
  FaCircleInfo,
  FaCodeBranch,
  FaAward,
  FaDownload,
  FaPrint,
  FaGuitar,
  FaHeart,
  FaShieldHalved,
  FaTextHeight
} from 'react-icons/fa6';

export default function About() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-4xl mb-4 flex items-center gap-3">
            <FaGuitar className="text-primary" />
            About Freetar
          </h1>
          <p className="text-lg text-base-content/80 mb-4">
            Freetar is a free, open-source alternative frontend to Ultimate Guitar that provides
            a clean, ad-free experience for viewing guitar chords and tabs.
          </p>
          <p className="text-base text-base-content/70 mb-6">
            Built with modern web technologies, Freetar scrapes and displays chord charts and tablature
            from Ultimate Guitar in a simple, distraction-free interface. No account required, no ads,
            no paywalls—just pure guitar learning.
          </p>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <FaMagnifyingGlass className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Search Tabs</h3>
                <p className="text-sm text-base-content/70">
                  Find guitar chords and tabs from Ultimate Guitar
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaWandMagicSparkles className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Clean Interface</h3>
                <p className="text-sm text-base-content/70">
                  Ad-free, distraction-free experience
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaScroll className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Auto-scroll</h3>
                <p className="text-sm text-base-content/70">
                  Hands-free reading while you play
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaMusic className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Transpose</h3>
                <p className="text-sm text-base-content/70">
                  Change chords to any key instantly
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaStar className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Save Favorites</h3>
                <p className="text-sm text-base-content/70">
                  Store locally, no account needed
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaMoon className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Dark Mode</h3>
                <p className="text-sm text-base-content/70">
                  Easy on the eyes, day or night
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaDownload className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Export ChordPro</h3>
                <p className="text-sm text-base-content/70">
                  Download tabs in ChordPro format
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaPrint className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Print-Friendly</h3>
                <p className="text-sm text-base-content/70">
                  Optimized for printing chord sheets
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaTextHeight className="text-2xl text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Adjustable Font Size</h3>
                <p className="text-sm text-base-content/70">
                  Customize text size for comfortable reading
                </p>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="badge badge-primary badge-lg">1</div>
              <div>
                <h3 className="font-semibold mb-1">Search for a song</h3>
                <p className="text-sm text-base-content/70">
                  Use the search bar to find any song, artist, or chord chart. Results are fetched
                  from Ultimate Guitar&apos;s extensive database.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="badge badge-primary badge-lg">2</div>
              <div>
                <h3 className="font-semibold mb-1">Choose a tab</h3>
                <p className="text-sm text-base-content/70">
                  Browse through different versions (chords, tabs, bass tabs) and ratings.
                  Filter by type and sort by popularity.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="badge badge-primary badge-lg">3</div>
              <div>
                <h3 className="font-semibold mb-1">Play along</h3>
                <p className="text-sm text-base-content/70">
                  View chord diagrams, transpose to your preferred key, enable auto-scroll,
                  and save favorites for later practice sessions.
                </p>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaShieldHalved /> Privacy & Security
          </h2>
          <div className="alert alert-info mb-4">
            <FaCircleInfo className="text-xl" />
            <div>
              <p className="font-semibold mb-1">Your privacy matters</p>
              <p className="text-sm">
                All favorites and preferences are stored locally in your browser using localStorage.
                No user data is collected, tracked, or sent to any server.
              </p>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <p className="text-sm text-base-content/70">
              <strong>No tracking:</strong> We don&apos;t use analytics, cookies, or any tracking tools.
            </p>
            <p className="text-sm text-base-content/70">
              <strong>No accounts:</strong> Your favorites are yours alone, stored only on your device.
            </p>
            <p className="text-sm text-base-content/70">
              <strong>No ads:</strong> Completely ad-free experience with no third-party scripts.
            </p>
            <p className="text-sm text-base-content/70">
              <strong>Open source:</strong> The entire codebase is publicly available for review.
            </p>
          </div>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaCodeBranch /> Open Source
          </h2>
          <p className="mb-4">
            Freetar is built with modern web technologies and is 100% open source under the MIT License.
            The entire project is available on GitHub for anyone to review, use, or contribute to.
          </p>
          <div className="bg-base-300 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Technology Stack:</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-base-content/70">
              <li><strong>Next.js 14</strong> - React framework with App Router</li>
              <li><strong>TypeScript</strong> - Type-safe development</li>
              <li><strong>Tailwind CSS + DaisyUI</strong> - Modern utility-first styling</li>
              <li><strong>Cheerio</strong> - Server-side HTML parsing for web scraping</li>
              <li><strong>React Icons</strong> - Beautiful icon library</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
            <a
              href="https://github.com/kmille36/freetar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <FaCodeBranch /> View on GitHub
            </a>
            <a
              href="https://github.com/kmille36/freetar/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Report an Issue
            </a>
          </div>
          <p className="text-sm text-base-content/70 flex items-center gap-2">
            <FaHeart className="text-error" />
            Built by guitarists, for guitarists. Contributions and feedback are always welcome!
          </p>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaAward /> Credits & Legal
          </h2>
          <div className="space-y-4">
            <p className="text-base-content/80">
              All chord and tab data is provided by <strong>Ultimate Guitar</strong> and their
              community of contributors. We are grateful for their extensive database of user-submitted content.
            </p>
            <div className="alert alert-warning">
              <FaCircleInfo className="text-xl" />
              <div>
                <p className="font-semibold mb-1">Important Notice</p>
                <p className="text-sm">
                  This project is an independent, open-source alternative frontend and is
                  <strong> not affiliated with, endorsed by, or connected to Ultimate Guitar</strong> in any way.
                  All content is accessed from publicly available sources on their website.
                </p>
              </div>
            </div>
            <p className="text-sm text-base-content/70">
              Freetar acts as a web scraper and proxy to provide a cleaner interface for accessing
              Ultimate Guitar&apos;s content. If you appreciate the tabs, please consider supporting the
              original creators and Ultimate Guitar directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
