#!/usr/bin/env python3
"""Build/check the single offline release from authoritative editable sources."""
import argparse
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DISTRICTS = {'residential', 'nature', 'business', 'school'}


def encode(value):
    """JSON must not close its containing script element."""
    return (json.dumps(value, ensure_ascii=False, separators=(',', ':'))
            .replace('<', r'\u003c').replace('\u2028', r'\u2028')
            .replace('\u2029', r'\u2029'))


def read(name):
    return (ROOT / name).read_text(encoding='utf-8')


def validate(data):
    identities = set()
    for entry in data['entries']:
        identity = entry['lemmaId']
        if identity in identities:
            raise ValueError('Duplicate lemma: ' + identity)
        identities.add(identity)
        if (not re.search(r'[\u0600-\u06ff]', entry.get('displayLemmaPs') or '')
                or not entry.get('romanisation') or not entry.get('englishSenses')
                or not entry.get('forms')):
            raise ValueError('Incomplete playable entry: ' + identity)
        if (not entry.get('suitableDistricts')
                or not set(entry['suitableDistricts']).issubset(DISTRICTS)):
            raise ValueError('Invalid district: ' + identity)
        if any(not f.get('formId') or not f.get('pashto') for f in entry['forms']):
            raise ValueError('Missing forms: ' + identity)
        if entry.get('promotionCandidateId') or identity.startswith('candidate:'):
            review = entry.get('nativeReview', {})
            if (entry.get('reviewStatus') != 'approved' or not review.get('reviewer')
                    or not review.get('reference') or not entry.get('examples')):
                raise ValueError('Candidate requires documented native review')


def append_week2(game, week2):
    for day in week2['days']:
        number = day['day']
        for word in day['vocabulary']:
            game['words'].append(dict(
                id=word['id'], loop=number, place=day['opening'],
                ps=word['pashto'], roman=word['romanization'], en=word['english'],
                note='Week 2 draft vocabulary. Native Laghman review pending.',
                dialect='',
            ))
        for lesson in day['lessons']:
            for card in lesson['cards']:
                game['words'].append(dict(
                    id=card['id'], loop=number, place=lesson['location'],
                    type='sentence', ps=card['pashto'], roman=card['romanization'],
                    en=card['english'], note=card['note'],
                    dialect='Draft: local Laghman review pending.',
                    speaker=card['speaker'], recipient=card['recipient'],
                    status=card['status'],
                ))
            course = f"{number}-{lesson['location']}"
            game['courses'][course] = ([word['id'] for word in day['vocabulary']]
                                       + [card['id'] for card in lesson['cards']])
        game['loops'].append(dict(
            id=number, label=day['title'], person=day['topic'],
            icon='📚' if number == 14 else '🌿', subtitle=day['topic'],
            description=day['intro'],
        ))


def build():
    game = json.loads(read('content/WEEK1_RUNTIME.json'))
    week2 = json.loads(read('content/WEEK2_RUNTIME.json'))
    library = json.loads(read('content/LIBRARY_LEXICON.json'))
    validate(library)
    append_week2(game, week2)
    entries = {entry['lemmaId']: entry for entry in library['entries']}
    for card in game['words']:
        if card.get('type') in ['sentence', 'greeting']:
            continue
        refs = library['sourceMappings'].get(card['id'], [])
        if len(refs) != 1:
            raise ValueError('Lexical card requires one form identity: ' + card['id'])
        card['type'] = entries[refs[0]['lemmaId']]['partOfSpeech']
    library['cardTypes'] = {card['id']: card['type'] for card in game['words']}
    audio_dir = ROOT / 'audio'
    audio_ids = sorted(path.stem for path in audio_dir.glob('*.mp3')) if audio_dir.exists() else []
    script = (read('src/app.js')
              .replace('// @GAME_DATA', 'const GAME_DATA=' + encode(game) + ';')
              .replace('// @AUDIO_IDS', 'const BUNDLED_AUDIO_IDS=' + encode(audio_ids) + ';')
              .replace('// @WEEK2_DATA', 'const WEEK2_DATA=' + encode(week2) + ';')
              .replace('// @PROGRESSION', read('src/progression.js'))
              .replace('// @LIBRARY', 'const LIBRARY_DATA=' + encode(library) + ';\n'
                       + read('src/library-engine.js') + '\n' + read('src/library-ui.js')))
    return (read('src/app.html').replace('/* @STYLES */', read('src/app.css'))
            .replace('// @SCRIPT', script))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    rendered = build()
    output = ROOT / 'index.html'
    if args.check:
        if output.read_text(encoding='utf-8') != rendered:
            raise SystemExit('Stale release: run python3 tools/build.py')
    else:
        output.write_text(rendered, encoding='utf-8')
    print('Offline release synchronized.')
