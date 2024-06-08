import json
import re
from dataclasses import dataclass, field

from freetar.ug import SongDetail

def song_to_chordpro(song: SongDetail):
    tab_lines = untokenise_tab(intersperse_chords(tokenise_tab(song.raw_tab)))
    header_lines = [
        chordpro_directive('title', f'{song.artist_name} - {song.song_name}'),
        chordpro_meta('artist', song.artist_name),
        chordpro_meta('capo', song.capo),
        chordpro_meta('key', song.key),
        chordpro_meta('tuning', song.tuning),
        chordpro_meta('version', song.version),
        chordpro_meta('difficulty', song.difficulty),
    ]
    return ''.join((line + '\n' for line in (header_lines + tab_lines + ['']) if line is not None))

def chordpro_meta(key: str, value: str):
    if value is None:
        return None
    if type(value) is not str:
        value = str(value)
    return chordpro_directive('meta', key + ' ' + value)

def chordpro_directive(name: str, argstr: str):
    if argstr:
        return '{' + name + ': ' + argstr + '}'
    else:
        return '{' + name + '}'

@dataclass
class Chord():
    text: str
    pos: int

    def __str__(self):
        return '[' + self.text + ']'

@dataclass
class Section():
    text: str

    def id(self):
        text = re.sub(r'\s+$', '_', self.text.lower())
        text = re.sub(r'[^a-z_]*', '', text)
        text = re.sub(r'^verse_[0-9]*$', 'verse', text)
        text = re.sub(r'_*$', '', text)
        return text

    def label(self):
        return self.text

@dataclass
class SectionStart():
    sec: Section

    def __str__(self):
        return chordpro_directive('start_of_' + self.sec.id(), self.sec.label())

@dataclass
class SectionEnd():
    sec: Section

    def __str__(self):
        return chordpro_directive('end_of_' + self.sec.id(), self.sec.label())

@dataclass
class Instrumental():
    line: list

    def __str__(self):
        return chordpro_directive('c', untokenise_line(self.line))

def tokenise_line(line: str):
    section_match = re.match(r'^\s*\[([^\[\]]*)\]\s*$', line)
    if section_match:
        return SectionStart(Section(section_match.group(1)))
    return list(tokenise_symbols(line))

def tokenise_symbols(line: str):
    pos = 0
    while len(line) > 0:
        chord_match = re.match(r'^\[ch\]([^[]*)\[\/ch\](.*)$', line)
        if chord_match:
            line = chord_match.group(2)
            yield Chord(text=chord_match.group(1), pos=pos)
            pos += len(chord_match.group(1))
        else:
            c, line = line[0], line[1:]
            pos += 1
            yield c.replace('[', '(').replace(']', ')')


def insert_chords_between_tokens(chords: list, line: list):
    for i, x in enumerate(line):
        while chords and chords[0].pos <= i:
            yield chords[0]
            chords = chords[1:]
        yield x

    yield from chords

def only_whitespace(line):
    return type(line) is list and all((type(x) is str and x.isspace() for x in line))

def only_chords(line):
    return type(line) is list and all((type(x) is Chord or (type(x) is str and x.isspace()) for x in line))

def has_chords(line):
    return type(line) is list and any((type(x) is Chord for x in line))

def has_lyrics_and_nothing_else(line):
    return (not has_chords(line)) and (not only_whitespace(line))

def intersperse_chords(tlines):
    skip = True
    for this, next in zip([None] + tlines, tlines):
        if skip:
            skip = False
            continue
        elif has_chords(this) and only_chords(this) and (has_lyrics_and_nothing_else(next)):
            yield list(insert_chords_between_tokens([x for x in this if type(x) is Chord], next))
            skip = True
        elif has_chords(this):
            yield Instrumental(this)
        else:
            yield this

def untokenise_line(line):
    if type(line) is list:
        return ''.join((str(x) for x in line))
    return str(line)

def insert_section_ends(tlines):
    cur_sec = None
    for line in tlines:
        if type(line) is SectionStart:
            if cur_sec:
                yield SectionEnd(cur_sec)
            cur_sec = line.sec
        yield line

    if cur_sec:
        yield SectionEnd(cur_sec)

def move_section_borders(tlines):
    i = 0
    while i < len(tlines) - 1:
        i = 0
        while i < len(tlines) - 1:
            if only_whitespace(tlines[i]) and type(tlines[i + 1]) is SectionEnd:
                tlines[i], tlines[i + 1] = tlines[i + 1], tlines[i]
                break
            if only_whitespace(tlines[i + 1]) and type(tlines[i]) is SectionStart:
                tlines[i], tlines[i + 1] = tlines[i + 1], tlines[i]
                break
            i += 1
    return tlines


def untokenise_tab(tlines):
    tlines = move_section_borders(list(insert_section_ends(tlines)))
    return [untokenise_line(line) for line in tlines]

def tokenise_tab(tab):
    tab = tab.replace("[tab]", "")
    tab = tab.replace("[/tab]", "")
    return [tokenise_line(line) for line in tab.split('\n')]
