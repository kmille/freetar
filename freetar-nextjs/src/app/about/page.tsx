export default function About() {
  return (
    <div className="col-12">
      <h1>About Freetar</h1>
      <p className="lead">
        Freetar is an open-source alternative frontend to Ultimate Guitar.
      </p>

      <h2 className="mt-4">Features</h2>
      <ul>
        <li>Search for guitar chords and tabs from Ultimate Guitar</li>
        <li>Clean, ad-free interface</li>
        <li>Auto-scroll for hands-free reading</li>
        <li>Transpose chords to any key</li>
        <li>Save favorites locally (no account needed)</li>
        <li>Dark mode support</li>
        <li>Print-friendly formatting</li>
      </ul>

      <h2 className="mt-4">Privacy</h2>
      <p>
        Freetar respects your privacy. All favorites are stored locally in your browser
        using localStorage. No data is sent to any server except when searching for tabs
        from Ultimate Guitar.
      </p>

      <h2 className="mt-4">Open Source</h2>
      <p>
        This project is open source and available on GitHub. Contributions are welcome!
      </p>

      <h2 className="mt-4">Credits</h2>
      <p>
        All chord and tab data is provided by Ultimate Guitar. This project is not
        affiliated with Ultimate Guitar.
      </p>
    </div>
  );
}
