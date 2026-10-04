"""Serveur éphémère de test : mot de passe aléatoire transmis seulement au test parent."""
import json
import secrets
import sys
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from preparer_publication import ROOT, build, read_password, PUBLIC_FILES


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def list_directory(self, path):
        self.send_error(403)
        return None


temporary = Path(sys.argv[1]).resolve()
password = secrets.token_urlsafe(32)
output = temporary / 'mon-dossier'
count = build(ROOT, output, password)
assert set(path.name for path in output.iterdir()) == PUBLIC_FILES
assert not any(password.encode() in path.read_bytes() for path in output.iterdir())
assert not any(b'Muffin@TeamMuffin' in path.read_bytes() for path in output.iterdir())
empty = temporary / 'empty-config'
empty.mkdir()
(empty / 'securite.local.json').write_text('{"mot_de_passe":""}', encoding='utf-8')
try:
    read_password(empty)
except ValueError:
    pass
else:
    raise AssertionError('Un mot de passe vide doit être refusé')
# Une sortie mélangée avec un fichier privé doit être refusée sans effacer ce fichier.
unsafe = temporary / 'unsafe-output'
unsafe.mkdir()
(unsafe / 'notes.txt').write_text('À conserver', encoding='utf-8')
try:
    build(ROOT, unsafe, password)
except ValueError:
    assert (unsafe / 'notes.txt').read_text(encoding='utf-8') == 'À conserver'
else:
    raise AssertionError('Export mélangé accepté')
with ThreadingHTTPServer(('127.0.0.1',0), partial(QuietHandler,directory=str(temporary))) as server:
    print(json.dumps({'url':f'http://127.0.0.1:{server.server_port}/mon-dossier/',
                      'password':password,'files':count}),flush=True)
    server.serve_forever()
