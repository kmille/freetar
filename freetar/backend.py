import waitress
from flask import Flask, render_template, request
from flask_minify import Minify

from freetar.ug import ug_search, ug_tab
from freetar.utils import get_version


app = Flask(__name__)
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
def search():
    search_term = request.args.get("search_term")
    if search_term:
        search_results = ug_search(search_term)
    else:
        search_results = []
    return render_template("index.html",
                           search_term=search_term,
                           title=f"Freetar - Search: {search_term}",
                           search_results=search_results,)


@app.route("/tab/<artist>/<song>")
def show_tab(artist: str, song: str):
    tab = ug_tab(f"{artist}/{song}")
    return render_template("tab.html",
                           tab=tab,
                           title=f"{tab.artist_name} - {tab.song_name}")


@app.route("/tab/<tabid>")
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
    return render_template('about.html')


def main():
    host = "0.0.0.0"
    port = 22000
    if __name__ == '__main__':
        app.run(debug=True,
                host=host,
                port=port)
    else:
        print(f"Running backend on {host}:{port}")
        waitress.serve(app, listen=f"{host}:{port}")


if __name__ == '__main__':
    main()
