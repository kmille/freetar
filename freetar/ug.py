import requests
from bs4 import BeautifulSoup
from urllib.parse import quote, urlparse
import json
import re

from dataclasses import dataclass, field
from .utils import FreetarError

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3"


@dataclass
class SearchResult:
    artist_name: str
    song_name: str
    tab_url: str
    artist_url: str
    _type: str
    version: int
    votes: int
    rating: float

    def __init__(self, data: str):
        self.artist_name = data["artist_name"]
        self.song_name = data["song_name"]
        self.tab_url = urlparse(data["tab_url"]).path
        self.artist_url = data["artist_url"]
        self._type = data["type"]
        self.version = data["version"]
        self.votes = int(data["votes"])
        self.rating = round(data["rating"], 1)

    def __repr__(self):
        return f"{self.artist_name} - {self.song_name} (ver {self.version}) ({self._type} {self.rating}/5 - {self.votes} votes)"


@dataclass
class SongDetail:
    tab: str
    artist_name: str
    song_name: str
    version: int
    difficulty: str
    capo: str
    key: str
    tuning: str
    tab_url: str
    tab_url_path: str
    alternatives: list[SearchResult] = field(default_factory=list)

    def __init__(self, data: dict):
        self.raw_tab = data["store"]["page"]["data"]["tab_view"]["wiki_tab"]["content"].replace('\r\n', '\n')
        self.artist_name = data["store"]["page"]["data"]["tab"]['artist_name']
        self.key = data["store"]["page"]["data"]["tab"].get('tonality_name')
        self.song_name = data["store"]["page"]["data"]["tab"]["song_name"]
        self.version = int(data["store"]["page"]["data"]["tab"]["version"])
        self._type = data["store"]["page"]["data"]["tab"]["type"]
        self.rating = int(data["store"]["page"]["data"]["tab"]["rating"])
        self.difficulty = data["store"]["page"]["data"]["tab_view"]["ug_difficulty"]
        self.appliciture = data["store"]["page"]["data"]["tab_view"]["applicature"]
        self.chords = []
        self.fingers_for_strings = []
        if type(data["store"]["page"]["data"]["tab_view"]["meta"]) is dict:
            self.capo = data["store"]["page"]["data"]["tab_view"]["meta"].get("capo")
            _tuning = data["store"]["page"]["data"]["tab_view"]["meta"].get("tuning")
            self.tuning = f"{_tuning['value']} ({_tuning['name']})" if _tuning else None
        else:
            self.capo = None
            self.tuning = None
        self.tab_url = data["store"]["page"]["data"]["tab"]["tab_url"]
        self.tab_url_path = urlparse(self.tab_url).path
        self.alternatives = []
        for alternative in data["store"]["page"]["data"]["tab_view"]["versions"]:
            if alternative.get("type", "") != "Official":
                self.alternatives.append(SearchResult(alternative))
        self.fix_tab()

    def __repr__(self):
        return f"{self.artist_name} - {self.song_name}"

    def fix_tab(self):
        tab = self.raw_tab
        tab = tab.replace("\n", "<br/>")
        tab = tab.replace(" ", "&nbsp;")
        tab = tab.replace("[tab]", "")
        tab = tab.replace("[/tab]", "")

        # (?P<root>[A-Ha-h](#|b)?) : Chord root is any letter A - H with an optional sharp or flat at the end
        # (?P<quality>[^[/]+)?  : Chord quality is anything after the root, but before the `/` for the base note
        # (?P<bass>/[A-Ha-h](#|b)?)? :  Chord quality is anything after the root, including parens in the case of 'm(maj7)'
        # tab = re.sub(r'\[ch\](?P<root>[A-Ga-g](#|b)?)(?P<quality>[#\w()]+)?(?P<bass>/[A-Ga-g](#|b)?)?\[\/ch\]', self.parse_chord, tab)
        tab = re.sub(r'\[ch\](?P<root>[A-Ha-h](#|b)?)(?P<quality>[^[/]+)?(?P<bass>/[A-Ha-h](#|b)?)?\[\/ch\]', self.parse_chord, tab)
        self.tab = tab

    def plain_text(self):
        tab = self.raw_tab
        tab = tab.replace("[tab]", "")
        tab = tab.replace("[/tab]", "")
        tab = re.sub(r'\[ch\]([^\[]*)\[\/ch\]', lambda match: match.group(1), tab)
        return tab

    def parse_chord(self, chord):
        root = '<span class="chord-root">%s</span>' % chord.group('root')
        quality = ''
        bass = ''
        if chord.group('quality') is not None:
            quality = '<span class="chord-quality">%s</span>' % chord.group('quality')
        if chord.group('bass') is not None:
            bass = '/<span class="chord-bass">%s</span>' % chord.group('bass')[1:]
        return '<span class="chord fw-bold">%s</span>' % (root + quality + bass)

    def download_url(self):
        return '/download/' + self.tab_url_path.split('/', 2)[2]


@dataclass
class Search:
    results: dict
    total_pages: int
    current_page: int

    def __init__(self, value: str, page: int):
        try:
            resp = requests.get(f"https://www.ultimate-guitar.com/search.php?page={page}&search_type=title&value={quote(value)}",
                                headers={'User-Agent': USER_AGENT})
            resp.raise_for_status()
            bs = BeautifulSoup(resp.text, 'html.parser') # data can be None
            data = bs.find("div", {"class": "js-store"}) # KeyError
            data = json.loads(data.attrs['data-content'])
            self.results = self.get_results(data)
            self.total_pages = data['store']['page']['data']['pagination']['total']
            self.current_page = data['store']['page']['data']['pagination']['current']
            #print(json.dumps(data, indent=4))
        except requests.exceptions.RequestException:
            # don't print full URL here, in case of 404
            raise FreetarError(f"Could not find any chords for '{value}'.")
        except (KeyError, ValueError, AttributeError) as e:
            raise FreetarError(f"Could not search for chords: {e}") from e

    def get_results(self, data: object):
        results = data['store']['page']['data']['results']
        ug_results = []
        for result in results:
            _type = result.get("type")
            if _type and _type not in ("Pro", "Official"):
                s = SearchResult(result)
                ug_results.append(s)
        return ug_results


def get_chords(s: SongDetail) -> SongDetail:
    if s.appliciture is None:
        return dict(), dict()

    chords = {}
    fingerings = {}

    for chord in s.appliciture:
        for chord_variant in s.appliciture[chord]:
            frets = chord_variant["frets"]
            min_fret = min(frets)
            max_fret = max(frets)
            possible_frets = list(range(min_fret, max_fret+1))
            variants_temp = {
                possible_fret: [1 if b == possible_fret else 0 for b in frets][::-1]
                for possible_fret
                in possible_frets
                if possible_fret > 0
            }

            variants = dict()
            found = False
            for fret, fingers in variants_temp.items():
                try:
                    if not found and fingers.index(1) >= 0:
                        found = True
                except ValueError:
                    ...

                if found:
                    variants[fret] = fingers

            if not len(variants):
                continue
            while len(variants) < 6:
                variants[max(variants) + 1] = [0] * 6

            variant_strings_pressed = [*variants.values()]
            variant_strings_pressed = [sum(x) for x in zip(*variant_strings_pressed)]
            unstrummed_strings = [int(not bool(y)) for y in variant_strings_pressed]

            fingering_for_variant = []
            for finger, x in zip(chord_variant["fingers"][::-1], unstrummed_strings):
                fingering_for_variant.append("x" if x else finger)
            fingering_for_variant = fingering_for_variant

            if chord not in chords:
                chords[chord] = []
                fingerings[chord] = []
            chords[chord].append(variants)
            fingerings[chord].append(fingering_for_variant)

    return chords, fingerings


def ug_tab(url_path: str):
    try:
        resp = requests.get("https://tabs.ultimate-guitar.com/tab/" + url_path,
                            headers={'User-Agent': USER_AGENT})
        resp.raise_for_status()
        bs = BeautifulSoup(resp.text, 'html.parser')
        data = bs.find("div", {"class": "js-store"})
        data = data.attrs['data-content']
        data = json.loads(data)
        s = SongDetail(data)
        s.chords, s.fingers_for_strings = get_chords(s)
        return s
    except (KeyError, ValueError, AttributeError, requests.exceptions.RequestException) as e:
        raise FreetarError(f"Could not parse chord: {e}") from e
