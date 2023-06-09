from flask import Flask, render_template, request

from .ug import ug_search, ug_tab
import waitress

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/search")
def search():
    search_term = request.args.get("search_term")
    if search_term:
        search_results = ug_search(search_term)
    else:
        search_results = []
    return render_template("index.html",
                           search_term=search_term,
                           search_results=search_results)


@app.route("/tab/<artist>/<song>")
def show_tab(artist: str, song: str):
    tab = ug_tab(f"{artist}/{song}")
    return render_template("index.html",
                           tab=tab)


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
