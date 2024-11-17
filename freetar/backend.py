import waitress
import os
from flask import Flask, render_template, request
from flask_caching import Cache
from flask_minify import Minify

from freetar.ug import Search, ug_tab
from freetar.utils import get_version, FreetarError

cache = Cache(config={'CACHE_TYPE': 'SimpleCache',
                      "CACHE_DEFAULT_TIMEOUT": 0,
                      "CACHE_THRESHOLD": 10000})

TOR_ENABLED = "FREETAR_ENABLE_TOR" in os.environ

app = Flask(__name__)
cache.init_app(app)
Minify(app=app, html=True, js=True, cssless=True)


@app.context_processor
def export_variables():
    return {
        'version': get_version(),
    }


@app.route("/")
def index():
    return render_template("index.html", favs=True)


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


@app.route("/favs")
def show_favs():
    return render_template("index.html",
                           title="Freetar - Favorites",
                           favs=True)


@app.route("/about")
def show_about():
    return render_template('about.html',
                           tor_enabled=TOR_ENABLED)


@app.errorhandler(403)
@app.errorhandler(500)
@app.errorhandler(FreetarError)
def internal_error(error):
    search_term = request.args.get("search_term")
    return render_template('error.html',
                           search_term=search_term,
                           error=error)


def main():
    host = "0.0.0.0"
    port = 22000
    if __name__ == '__main__':
        app.run(debug=True,
                host=host,
                port=port)
    else:
        threads = os.environ.get("THREADS", "4")
        print(f"Running backend on {host}:{port} with {threads} threads")
        waitress.serve(app, listen=f"{host}:{port}", threads=threads)


if __name__ == '__main__':
    main()
