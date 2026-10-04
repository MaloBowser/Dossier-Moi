"""Serveur de lecture local pour les fichiers du site, sans dependance externe."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser
from exporter_mails import export_mails


class SiteHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def list_directory(self, path):
        self.send_error(403, 'Liste des fichiers desactivee')
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=0)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    # Préparer aussi une copie consultable sans serveur, depuis les mêmes Markdown.
    try:
        export_mails(root)
    except OSError as error:
        print(f'Copie de secours non actualisée : {error}', flush=True)
    handler = partial(SiteHandler, directory=str(root))
    with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        url = f'http://127.0.0.1:{server.server_port}/index.html'
        print(f'Dossier moi : {url}\nGarde cette fenetre ouverte. Ctrl + C pour arreter.', flush=True)
        if not args.no_browser:
            webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
