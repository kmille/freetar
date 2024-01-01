# freetar - an alternative frontend for ultimate-guitar.com

This is like [Invidious](https://invidious.io/) but only for [Ultimate Guitar](https://www.ultimate-guitar.com/).  
Try it out: https://freetar.androidloves.me

## Features
- no ads, popups, just a simple design
- search for tabs and view them
- save your favorite chords as favs (everything is stored in session storage, no account needed)
- dark mode
- auto scroll
- useful for printing chords

## Future work
- ~~show chords~~
- improve UX on mobile devices
- on smartphones: prevent lock screen
- share chords (qr code)?
- save favs encrypted server side?


## How to use it
**PyPi**  
Package: https://pypi.org/project/freetar/

```
pip install freetar
```

**Docker**  
Image: https://hub.docker.com/r/kmille2/freetar  
Port: 22000

```
sudo docker pull kmille2/freetar
sudo docker run -p 127.0.0.1:22000:22000 kmille2/freetar
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

