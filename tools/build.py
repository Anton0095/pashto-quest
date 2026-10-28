#!/usr/bin/env python3
"""Build/check the single offline release from authoritative editable sources."""
import argparse
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
# runpy-based content checks also resolve the sibling schema module.
sys.path.insert(0, str(ROOT / "tools"))
from curriculum_schema import validate_curriculum
DISTRICTS = {'residential', 'nature', 'business', 'school'}


def encode(value):
    """JSON must not close its containing script element."""
    return (json.dumps(value, ensure_ascii=False, separators=(',', ':'))
            .replace('<', r'\u003c').replace('\u2028', r'\u2028')
            .replace('\u2029', r'\u2029'))


def read(name):
    return (ROOT / name).read_text(encoding='utf-8')


def validate(data):
    validate_curriculum(data)
    identities = set()
    for entry in data['entries']:
        identity = entry['lemmaId']
        if identity in identities:
            raise ValueError('Duplicate lemma: ' + identity)
        identities.add(identity)
        if entry.get('vocabularyClass') not in ['district', 'universal']:
            raise ValueError('Missing vocabulary classification: ' + identity)
        if entry['countsTowardDailyQuota'] != (entry['vocabularyClass'] == 'district'):
            raise ValueError('Inconsistent quota classification: ' + identity)
        if entry['vocabularyClass'] == 'universal' and set(entry['suitableDistricts']) != DISTRICTS:
            raise ValueError('Universal entry must be available in every district: ' + identity)
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
            status = entry.get('reviewStatus')
            if status == 'native_approved':
                if not review.get('reviewer') or not review.get('reference'):
                    raise ValueError('Native-approved candidate requires review evidence')
            elif status == 'provisional_playable':
                provenance = entry.get('provenance', {})
                if (entry.get('userVerified') is not False
                        or provenance.get('nativeApproved') is not False
                        or not provenance.get('source') or not entry.get('examples')):
                    raise ValueError('Provisional candidate requires honest review metadata')
            else:
                raise ValueError('Candidate is neither provisional-playable nor approved')


def validate_expressions(data):
    identities = set()
    supplied = {'phrase-d1-home-welcome': 'ښه راغلاست',
                'phrase-day-2-opening': 'سهار مو پخیر!'}
    for phrase in data['expressions']:
        identity = phrase['id']
        if (identity in identities or phrase['audioContentId'] != identity
                or not re.fullmatch(r'[a-z0-9][a-z0-9_-]*', identity)):
            raise ValueError('Duplicate/unstable expression identity: ' + identity)
        identities.add(identity)
        if not phrase['active']:
            continue
        if (not re.search(r'[\u0600-\u06ff]', phrase.get('pashto') or '')
                or not phrase.get('romanisation') or not phrase.get('english')
                or not phrase.get('speaker') or not phrase.get('source')):
            raise ValueError('Incomplete active expression: ' + identity)
        review = phrase.get('nativeReview', {})
        if supplied.get(identity) != phrase['pashto'] and (review.get('status') != 'approved'
                or not review.get('reviewer') or not review.get('reference')):
            raise ValueError('Expression requires documented linguistic review: ' + identity)


def build():
    curriculum = json.loads(read('content/LEARNING_CURRICULUM.json'))
    archived1 = json.loads(read('docs/grammar/attestations/WEEK1_AUTHORED.json'))
    archived2 = json.loads(read('docs/grammar/attestations/WEEK2_AUTHORED.json'))
    library = json.loads(read('content/LIBRARY_LEXICON.json'))
    narrative = json.loads(read('content/NARRATIVE_EXPRESSIONS.json'))
    overrides = json.loads(read('content/CURRICULUM_OVERRIDES.json'))
    approval = overrides['approval']
    if approval.get('approved'):
        if not all(approval.get(k) for k in ['reviewer', 'date', 'reference']):
            raise ValueError('Curriculum override needs explicit human approval evidence')
        entries = {e['lemmaId']: e for e in library['entries']}
        seen = set()
        for row in overrides['introductions']:
            eid = row['lemmaId']
            if eid not in entries or eid in seen:
                raise ValueError('Unknown or duplicate curriculum override')
            seen.add(eid)
            e = entries[eid]
            if not e['firstIntroductionConstraints']['earliestDay'] <= row['day'] <= 13:
                raise ValueError('Override violates earliest grammar day')
            e['introduction'].update({k: row[k] for k in ['day', 'district', 'teachingOrder']})
            e['introduction']['verifiedStatus'] = 'human_curriculum_approved'
            for f in e['forms']:
                f['firstAllowedDay'] = max(row['day'], f['grammarFirstDay'])
            # Authorial scheduling approval NEVER changes linguistic review status.
    library['sentenceFrames'] = json.loads(read('content/SENTENCE_FRAMES.json'))
    candidates = json.loads(read('content/DISTRICT_VOCABULARY_CANDIDATES.json'))
    library['inventorySummary'] = {
        'activeContentLemmas': sum(e['countsTowardDailyQuota'] for e in library['entries']),
        'universalLemmas': sum(e['vocabularyClass']=='universal' for e in library['entries']),
        'inactiveCandidates': sum(not e.get('promotedLemmaId') for e in candidates['candidates']),
    }
    validate(library)
    validate_expressions(narrative)
    authored = {w['id']: w for w in archived1['words']}
    for day in archived2['days']:
        for lesson in day['lessons']:
            for c in lesson['cards']:
                authored[c['id']] = dict(ps=c['pashto'], en=c['english'], roman=c['romanization'])
    for a in library.get('generationAttestations', []):
        w = authored.get(a['sourceId'])
        if not w or (a['pashto'], a['english'], a['romanisation']) != (w['ps'], w['en'], w['roman']):
            raise ValueError('Generation evidence differs from authored corpus: ' + a['sourceId'])
    audio_sources = set(authored) | {q['id'] for d in archived2['days'] for q in d['dialogues']} | {w['id'] for d in archived2['days'] for w in d['vocabulary']}
    for e in library['entries']:
        for f in e['forms']:
            if f.get('audioContentId') and f['audioContentId'] not in audio_sources:
                raise ValueError('Orphan audio source: ' + f['formId'])
    # Only licensed spans cross the runtime boundary. Full authored clauses remain
    # in the evidence archive and cannot be selected as playable cards or fallbacks.
    library['generationEvidence'] = {
        f['formId']: dict(sourceId=f['featureEvidence']['sourceId'],
                          pashto=f['pashto'], romanisation=f['romanisation'])
        for e in library['entries'] for f in e['forms'] if f['composition']['enabled']}
    for key in ['generationAttestations', 'lessonSentenceTargets', 'storyRequirements',
                'lessonContexts', 'challengeGrammarMappings', 'sourceMappingCorrections']:
        library.pop(key, None)
    library['sourceMappings'] = {}
    library['cardTypes'] = {}
    library['curriculum'] = curriculum
    library['grammarAssessment'] = json.loads(read('content/GRAMMAR_ASSESSMENT.json'))
    for concept in library['grammarAssessment']['concepts']:
        if (not 1 <= concept['day'] <= 13 or len(concept['misconceptions']) != 3
                or len(set([concept['correct'], *concept['misconceptions']])) != 4
                or any(re.search(r'[\u0600-\u06ff]', text) for text in
                       [concept['reference'], concept['case'], concept['correct'], *concept['misconceptions']])):
            raise ValueError('Invalid English grammar assessment concept: ' + concept['id'])
    library.pop('grammar', None)
    library['phrases'] = json.loads(read('content/FIXED_PHRASES.json'))['phrases']
    fixed_sources = {p['id']: p['ps'] for p in archived1['words'] if p.get('type') == 'greeting'}
    fixed_sources.update({p['id']: p['pashto'] for p in narrative['expressions'] if p['active']})
    for phrase in library['phrases']:
        if fixed_sources.get(phrase['id']) != phrase['pashto'] or not phrase.get('exceptionReason'):
            raise ValueError('Unregistered fixed expression; authored sentences cannot become exceptions')
    if len({p['id'] for p in library['phrases']}) != len(library['phrases']):
        raise ValueError('Duplicate fixed phrase exception')
    for entry in library['entries']:
        entry.pop('examples', None)
        for f in entry['forms']:
            f.pop('contextRomanisation', None)
    audio_dir = ROOT / 'audio'
    audio_ids = sorted(path.stem for path in audio_dir.glob('*.mp3')) if audio_dir.exists() else []
    # Explicit dependency order; modules use factories with injected services.
    modules = [
        'library-engine', 'sentence-engine', 'progression', 'content', 'question-engine',
        'assessment-content', 'learning', 'questions', 'save-schema', 'storage', 'audio', 'answer-feedback', 'sentence-scene', 'ui',
        'narrative-ui', 'tutorial-ui', 'grammar-ui', 'lesson-ui', 'challenge-ui',
        'world-ui', 'library-ui', 'app',
    ]
    datasets = {'LIBRARY_DATA': library,
                'NARRATIVE_DATA': narrative, 'BUNDLED_AUDIO_IDS': audio_ids}
    script = '\n'.join('const ' + name + '=' + encode(value) + ';'
                       for name, value in datasets.items()) + '\n'
    script += '\n'.join(read('src/' + name + '.js') for name in modules)
    script = '(() => {\n\"use strict\";\n' + script + '\n})();'
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
