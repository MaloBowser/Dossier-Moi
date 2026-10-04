"""Prépare la copie de secours des mails pour l'ouverture directe du HTML.

Les fichiers Markdown restent la source de vérité. Aucun texte n'est inventé.
Usage : python outils/exporter_mails.py [--check]
"""
import argparse
import json
from pathlib import Path


def export_mails(root, check=False):
    folder = root / 'textes' / 'projets' / 'mails'
    mails = {f'mail-{number:02}': (folder / f'mail-{number:02}.md').read_text(encoding='utf-8-sig')
             for number in range(1, 21) if (folder / f'mail-{number:02}.md').is_file()}
    content = ('// Généré depuis textes/projets/mails/*.md par outils/exporter_mails.py.\n'
               '// Modifier les Markdown, pas cette copie de secours.\n'
               'window.DossierMailsSecours = ' + json.dumps(mails, ensure_ascii=True, indent=2) + ';\n')
    target = root / 'assets' / 'mails-secours.js'
    current = target.read_text(encoding='utf-8') if target.exists() else ''
    if check:
        if current != content:
            raise SystemExit('Copie des mails à actualiser : python outils/exporter_mails.py')
    elif current != content:
        target.write_text(content, encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    export_mails(Path(__file__).resolve().parent.parent, args.check)
