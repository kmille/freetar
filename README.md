# freetar - an alternative frontend for ultimate-guitar.com

This is like [Invidious](https://invidious.io/) but only for [Ultimate Guitar](https://www.ultimate-guitar.com/).  
Try it out: https://freetar.androidloves.me

## Features
- no ads, popups, just a simple design
- search for tabs and view them
- save your favorite chords as favs (everything is stored in session storage, no account needed)
- dark mode
- auto scroll

## Future work
- show chords
- improve UX on mobile devices
- on smartphones: prevent lock screen
- share chords (qr code)?
- save favs encrypted server side?


## How to use it
You need [poetry](https://python-poetry.org/). Then:
```
poetry install
poetry run freetar
Visit localhost:22000 in browser
```

You can also use the [PyPi](https://pypi.org/project/freetar/) package

```
pip install freetar
```
