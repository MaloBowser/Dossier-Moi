"""Chiffre le site entier pour GitHub Pages. Ne publie rien sur Internet."""
import argparse
import base64
import gzip
import hashlib
import json
import mimetypes
import os
from pathlib import Path

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = Path(__file__).resolve().parent.parent
FORMAT = 'dossier-moi-v1'
ITERATIONS = 600_000
PUBLIC_FILES = {'index.html', 'entree.css', 'entree.js', 'coffre-worker.js',
                '404.html', 'dossier.json', 'dossier.bin', '.nojekyll'}
TOP_FILES = ['index.html', 'accueil.js', 'script.js', 'projets.js', 'contenus.js',
             'contenus-rubriques.js', 'style.css', 'projets.css', 'parcours.css', 'contenus.css']
PRIVATE_FOLDERS = ['pages', 'textes', 'images', 'assets', 'videos', 'sons']
ALLOWED_SUFFIXES = {'.html', '.css', '.js', '.json', '.md', '.png', '.jpg', '.jpeg',
                    '.webp', '.avif', '.gif', '.svg', '.ico', '.mp4', '.webm', '.mp3',
                    '.wav', '.ogg', '.woff', '.woff2', '.ttf', '.pdf'}


def read_password(root):
    path = root / 'securite.local.json'
    try:
        password = json.loads(path.read_text(encoding='utf-8-sig')).get('mot_de_passe', '')
    except (OSError, ValueError):
        raise ValueError('Ouvre securite.local.json et renseigne le champ mot_de_passe.') from None
    if not isinstance(password, str) or len(password) < 16 or not password.strip():
        raise ValueError('Dans securite.local.json, choisis un mot de passe long (au moins 16 caractères, idéalement 5 mots sans lien entre eux).')
    return password


def collect_files(root):
    paths = [root / name for name in TOP_FILES]
    for folder in PRIVATE_FOLDERS:
        paths.extend(path for path in (root / folder).rglob('*') if path.is_file()
                     and path.suffix.lower() in ALLOWED_SUFFIXES
                     and path.name.lower() != 'readme.md'
                     and not any(part.startswith('.') for part in path.relative_to(root).parts))
    files = {}
    for path in sorted(set(paths)):
        resolved = path.resolve()
        if not resolved.is_relative_to(root.resolve()):
            raise ValueError('Un fichier du site pointe hors du dossier : export refusé.')
        if not path.is_file():
            raise ValueError(f'Fichier nécessaire absent : {path.name}')
        name = path.relative_to(root).as_posix()
        mime = {'.js': 'text/javascript', '.md': 'text/plain', '.svg': 'image/svg+xml'}.get(path.suffix.lower())
        mime = mime or mimetypes.guess_type(name)[0] or 'application/octet-stream'
        if mime.startswith('text/') or mime == 'application/json':
            mime += '; charset=utf-8'
        files[name] = {'type': mime, 'data': base64.b64encode(path.read_bytes()).decode('ascii')}
    return files


def build(root, output, password):
    root, output = root.resolve(), output.resolve()
    if output == root or root.is_relative_to(output):
        raise ValueError('Le dossier de publication doit être séparé des fichiers source.')
    if len(password) < 16:
        raise ValueError('Mot de passe trop court : au moins 16 caractères.')
    if output.exists() and any(path.name not in PUBLIC_FILES or not path.is_file() for path in output.iterdir()):
        raise ValueError('Le dossier de sortie contient des fichiers étrangers : export refusé pour ne rien écraser ni publier en clair.')
    files = collect_files(root)
    plaintext = gzip.compress(json.dumps({'format': FORMAT, 'files': files}, ensure_ascii=True,
                                        separators=(',', ':')).encode('utf-8'), mtime=0)
    salt, iv = os.urandom(16), os.urandom(12)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITERATIONS, dklen=32)
    ciphertext = AESGCM(key).encrypt(iv, plaintext, FORMAT.encode('ascii'))
    metadata = {'format': FORMAT, 'iterations': ITERATIONS,
                'salt': base64.b64encode(salt).decode('ascii'),
                'iv': base64.b64encode(iv).decode('ascii')}
    template = root / 'confidentialite'
    generated = {name: (template / name).read_bytes()
                 for name in ['index.html', 'entree.css', 'entree.js', 'coffre-worker.js', '404.html']}
    generated.update({'dossier.bin': ciphertext,
                      'dossier.json': json.dumps(metadata).encode('utf-8'), '.nojekyll': b''})
    output.mkdir(parents=True, exist_ok=True)
    for name, content in generated.items():
        (output / name).write_bytes(content)
    return len(files)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    try:
        from exporter_mails import export_mails
        export_mails(ROOT)
        count = build(ROOT, ROOT / 'publication-privee', read_password(ROOT))
    except (OSError, ValueError) as error:
        raise SystemExit(str(error)) from None
    print(f'Prêt : {count} fichiers chiffrés dans publication-privee. Aucun mot de passe dans cet export.')
    print('Publie UNIQUEMENT le contenu de publication-privee dans un dépôt GitHub séparé.')


if __name__ == '__main__':
    main()
