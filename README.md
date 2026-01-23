# freetar - an open source alternative front-end to ultimate-guitar.com

This is like [Invidious](https://invidious.io/) but only for [Ultimate Guitar](https://www.ultimate-guitar.com/).  

## Instances
- https://freetar.de
- https://freetar.habedieeh.re
- https://tabs.adast.dk

## Features
- no ads, popups, AI, blockchain. Just a simple design
- search for tabs and view them
- save your favorite chords as favs (everything is stored in session storage (not send to the server), no account needed)
- dark mode
- auto scroll
- useful for printing chords
- show chords


## How to use it
After successful installation, there is an executable called `freetar` in the PATH. Execute it without parameters and it listens on 0.0.0.0:22000.  

You can specify a custom listen host or port by setting one or both of the following environment variables:

* `FREETAR_HOST`
* `FREETAR_PORT`

**PyPi**  
Package: https://pypi.org/project/freetar/

```
pip install freetar
```

**Docker**  
Image: https://hub.docker.com/r/kmille2/freetar  
Port: 22000

```shell
sudo docker pull kmille2/freetar
sudo docker run -p 127.0.0.1:22000:22000 kmille2/freetar
```

Or use Docker compose:

```shell
sudo docker compose up -d
```

Set a custom bind port with the environment variable `FREETAR_PORT`

You can also build and run the local repository instead of pulling from Docker Hub:

```shell
docker compose build
docker compose up -d
```


### Dev environment
You need [poetry](https://python-poetry.org/). Then:
```
poetry install
vim freetar/*.py
poetry run python freetar/backend.py
Visit localhost:22000 in browser

# static files: freetar/static/*
# html templates: freetar/templates/*
poetry run freetar
```

## Future work

- ~~show chords~~
- improve UX on mobile devices
- on smartphones: prevent lock screen
- ~~share chords (qr code)?~~ (done by #12 with export/import functionality)
- save favs encrypted server side?
- ~~Browser Extension like [Invidious Redirection](https://addons.mozilla.org/en-US/firefox/addon/invidious-redirection/)~~ ([done](https://github.com/libredirect/browser_extension/issues/942))

## Contributions

Feel free to contribute, but please create an issue before with a proposal of the feature. I don't want freetar to be bloated (neither UI nor functionality).
