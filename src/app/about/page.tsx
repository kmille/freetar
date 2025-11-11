import {
  FaMagnifyingGlass,
  FaSparkles,
  FaScroll,
  FaMusic,
  FaStar,
  FaMoon,
  FaCircleInfo,
  FaCodeBranch,
  FaAward
} from 'react-icons/fa6';

export default function About() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-4xl mb-4">About Freetar</h1>
          <p className="text-lg text-base-content/80 mb-6">
            Freetar is an open-source alternative frontend to Ultimate Guitar.
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
              <FaSparkles className="text-2xl text-primary mt-1" />
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
          </div>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4">Privacy</h2>
          <div className="alert alert-info mb-6">
            <FaCircleInfo className="text-xl" />
            <span>
              Freetar respects your privacy. All favorites are stored locally in your browser
              using localStorage. No data is sent to any server except when searching for tabs
              from Ultimate Guitar.
            </span>
          </div>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaCodeBranch /> Open Source
          </h2>
          <p className="mb-6">
            This project is open source and available on GitHub. Contributions are welcome!
          </p>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaAward /> Credits
          </h2>
          <p>
            All chord and tab data is provided by Ultimate Guitar. This project is not
            affiliated with Ultimate Guitar.
          </p>
        </div>
      </div>
    </div>
  );
}
