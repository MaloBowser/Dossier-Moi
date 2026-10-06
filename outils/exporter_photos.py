"""Recense les photos des souvenirs pour les albums du site."""
import json
from pathlib import Path
from urllib.parse import quote

LIEUX = ('lisbonne', 'londres', 'rennes', 'chateaugiron', 'chanteloup',
         'beauval', 'vezzano-ligure', 'vinaros', 'gerardmer')
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'}


def collect_photos(root):
    result = {}
    for lieu in LIEUX:
        folder = root / 'images' / 'souvenirs' / lieu
        result[lieu] = [
            '../' + quote(path.relative_to(root).as_posix(), safe='/')
            for path in sorted(folder.glob('*'), key=lambda p: p.name.casefold())
            if path.is_file() and path.suffix.lower() in EXTENSIONS
            and not path.name.startswith('.')
            and path.resolve().is_relative_to(root.resolve())
        ]
    return result


def export_photos(root):
    photos = collect_photos(root)
    content = ('// Généré par outils/exporter_photos.py.\n'
               'window.DossierPhotosSouvenirs = '
               + json.dumps(photos, ensure_ascii=True, indent=2) + ';\n')
    target = root / 'assets' / 'photos-souvenirs.js'
    if not target.exists() or target.read_text(encoding='utf-8') != content:
        target.write_text(content, encoding='utf-8')
    manifest = root / 'assets' / 'photos-souvenirs.json'
    manifest_content = json.dumps(photos, ensure_ascii=True, indent=2) + '\n'
    if not manifest.exists() or manifest.read_text(encoding='utf-8') != manifest_content:
        manifest.write_text(manifest_content, encoding='utf-8')


if __name__ == '__main__':
    export_photos(Path(__file__).resolve().parent.parent)
