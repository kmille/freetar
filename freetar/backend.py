import logging
import waitress
import sys
import os
from pathlib import Path
from flask import Flask, render_template, request
from flask_caching import Cache
from flask_minify import Minify

level = logging.DEBUG if os.getenv("DEBUG") == "1" else logging.INFO
logging.getLogger("urllib3").setLevel(logging.INFO)
logging.basicConfig(
    level=level,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


from freetar.ug import Search, ug_tab
from freetar.utils import get_version, FreetarError

FREETAR_CACHING = os.environ.get("FREETAR_CACHING", "ram")
CACHE_TIMEOUT = int(os.environ.get("FREETAR_CACHE_TIMEOUT", 0))
CACHE_DIR = os.environ.get("FREETAR_CACHE_DIR", "/tmp")

if FREETAR_CACHING == "off":
    logger.info("Disabling caching")
    cache_config = {'CACHE_TYPE': 'NullCache'}
elif FREETAR_CACHING == "ram":
    logger.info("Enabling memory caching")
    cache_config = {
        'CACHE_TYPE': 'SimpleCache',
        "CACHE_DEFAULT_TIMEOUT": CACHE_TIMEOUT,
        "CACHE_THRESHOLD": 100000,
    }
elif FREETAR_CACHING == "disk":
    Path(CACHE_DIR).mkdir(parents=True, exist_ok=True)
    logger.info(f"Enabling disk caching ({CACHE_DIR})")
    cache_config = {
        'CACHE_TYPE': 'FileSystemCache',
        "CACHE_DIR": CACHE_DIR,
        "CACHE_DEFAULT_TIMEOUT": CACHE_TIMEOUT,
        "CACHE_THRESHOLD": 100000,
    }
else:
    logger.error(f"Invalid FREETAR_CACHING value: {FREETAR_CACHING}")
    sys.exit(1)

app = Flask(__name__)
cache = Cache(config=cache_config)
cache.init_app(app)
Minify(app=app, html=True, js=True, cssless=True)


@app.context_processor
def export_variables():
    return {
        'version': get_version(),
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/search")
@cache.cached(query_string=True)
def search():
    search_term = request.args.get("search_term")
    try:
        page = int(request.args.get("page", 1))
    except ValueError:
        return render_template('error.html',
                               error="Invalid page requested. Not a number.")
    search_results = None
    if search_term:
        search_results = Search(search_term, page)
    return render_template("index.html",
                           search_term=search_term,
                           title=f"Freetar - Search: {search_term}",
                           search_results=search_results)


@app.route("/tab/<artist>/<song>")
@cache.cached()
def show_tab(artist: str, song: str):
    tab = ug_tab(f"{artist}/{song}")
    return render_template("tab.html",
                           tab=tab,
                           title=f"{tab.artist_name} - {tab.song_name}")


@app.route("/tab/<tabid>")
@cache.cached()
def show_tab2(tabid: int):
    tab = ug_tab(tabid)
    return render_template("tab.html",
                           tab=tab,
                           title=f"{tab.artist_name} - {tab.song_name}")


@app.route("/about")
def show_about():
    return render_template('about.html')


@app.errorhandler(403)
@app.errorhandler(500)
@app.errorhandler(FreetarError)
def internal_error(error):
    logger.exception("Exception occured")
    search_term = request.args.get("search_term")
    return render_template('error.html',
                           search_term=search_term,
                           error=error)


def main():
    host = os.getenv('FREETAR_HOST', '0.0.0.0')
    port = os.getenv('FREETAR_PORT', 22000)
    if __name__ == '__main__':
        app.run(debug=True,
                host=host,
                port=port)
    else:
        threads = os.environ.get("THREADS", "4")
        logger.info(f"Running freetar {get_version()} backend on {host}:{port} with {threads} threads")
        waitress.serve(app, listen=f"{host}:{port}", threads=threads)


if __name__ == '__main__':
    main()
