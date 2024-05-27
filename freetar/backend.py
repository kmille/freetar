from flask import Flask, render_template, request, send_file
from flask_minify import Minify

from freetar.ug import ug_search, ug_tab, SongDetail
import waitress
import io

app = Flask(__name__)
Minify(app=app, html=True, js=True, cssless=True)

@app.route("/")
def index():
    return render_template("index.html",
                           title="Freetar",
                           favs=True)



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

@app.route("/download/<artist>/<song>")
def download_tab(artist: str, song: str):
    tab = ug_tab(f"{artist}/{song}")
    format = request.args.get('format')
    return tab_to_dl_file(tab, format)

@app.route("/download/<tabid>")
def download_tab2(tabid: int):
    tab = ug_tab(tabid)
    format = request.args.get('format')
    return tab_to_dl_file(tab, format)

@app.route("/favs")
def show_favs():
    return render_template("index.html",
                           title="Freetar - Favorites",
                           favs=True)

def tab_to_dl_file(tab: SongDetail, format: str):
    if format == 'ug_txt':
        ext = 'ug.txt'
        content = tab.raw_tab
    elif format == 'txt':
        ext = 'txt'
        content = tab.plain_text()
    else:
        return f'no such format: {format}', 400

    filename = f'{tab.artist_name} - {tab.song_name}.{ext}'
    data = io.BytesIO(content.encode('utf-8'))
    return send_file(data, as_attachment=True, download_name=filename)


def main():
    host = "0.0.0.0"
    port = 22001
    if __name__ == '__main__':
        app.run(debug=True,
                host=host,
                port=port)
    else:
        print(f"Running backend on {host}:{port}")
        waitress.serve(app, listen=f"{host}:{port}")


if __name__ == '__main__':
    main()
