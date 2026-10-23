#!/usr/bin/env python3
"""Embed the authored Week 2 draft bank in the standalone game; no third-party packages."""
import argparse
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def encode(value):
    # Keep authored strings from closing a script element, including future edits.
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', r'\u003c').replace('\u2028', r'\u2028').replace('\u2029', r'\u2029')

def embed(html, bank):
    match = re.search(r'const GAME_DATA\s*=\s*(\{.*?\});', html, re.S)
    if not match or html.count('const WEEK2_DATA=') != 1:
        raise ValueError('Expected the integrated standalone game, not an older reference')
    game = json.loads(match[1])
    game['words'] = [w for w in game['words'] if w['loop'] < 8]
    game['loops'] = [d for d in game['loops'] if d['id'] < 8]
    game['courses'] = {k: v for k, v in game['courses'].items() if int(k.split('-')[0]) < 8}
    if [d['day'] for d in bank['days']] != list(range(8, 15)):
        raise ValueError('Week 2 must contain exactly Days 8–14')
    for day in bank['days']:
        d = day['day']
        if len(day['lessons']) != 4 or any(len(l['cards']) != 5 for l in day['lessons']):
            raise ValueError('Expected four five-sentence lessons per day')
        for w in day['vocabulary']:
            game['words'].append(dict(id=w['id'], loop=d, place=day['opening'], type='noun', ps=w['pashto'], roman=w['romanization'], en=w['english'], note='Week 2 draft vocabulary. Native Laghman review pending.', dialect=''))
        for lesson in day['lessons']:
            for c in lesson['cards']:
                if not all(c.get(k) for k in ['pashto', 'romanization', 'english', 'speaker', 'recipient', 'status', 'review_refs']):
                    raise ValueError('Incomplete card: ' + c['id'])
                game['words'].append(dict(id=c['id'], loop=d, place=lesson['location'], type='sentence', ps=c['pashto'], roman=c['romanization'], en=c['english'], note=c['note'], dialect='Draft: local Laghman review pending.', speaker=c['speaker'], recipient=c['recipient'], status=c['status']))
            game['courses'][f"{d}-{lesson['location']}"] = [w['id'] for w in day['vocabulary']] + [c['id'] for c in lesson['cards']]
        game['loops'].append(dict(id=d, label=day['title'], person=day['topic'], icon='📚' if d == 14 else '🌿', subtitle=day['topic'], description=day['intro']))
    html = html[:match.start(1)] + encode(game) + html[match.end(1):]
    return re.sub(r'const WEEK2_DATA=(\{.*?\});', lambda _: 'const WEEK2_DATA=' + encode(bank) + ';', html, count=1, flags=re.S)

if __name__ == '__main__':
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('--check', action='store_true', help='Fail if the inline data does not match the authored bank')
    parsed = args.parse_args()
    path = ROOT / 'index.html'
    original = path.read_text(encoding='utf-8')
    rendered = embed(original, json.loads((ROOT / 'content/WEEK2_RUNTIME.json').read_text(encoding='utf-8')))
    if parsed.check and original != rendered:
        raise SystemExit('Inline Week 2 data is stale; run python3 tools/embed_week2.py')
    if not parsed.check:
        path.write_text(rendered, encoding='utf-8')
    print('Week 2 inline content is synchronized.' if parsed.check else 'Embedded Week 2 content; Week 1 data retained.')
