"""Prépare puis ouvre uniquement la version chiffrée sur cet ordinateur."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import webbrowser
from preparer_publication import ROOT, build, read_password
from exporter_mails import export_mails


class PrivatePreview(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def list_directory(self, path):
        self.send_error(403)
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=0)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    try:
        password = read_password(ROOT)
        export_mails(ROOT)
        build(ROOT, ROOT / 'publication-privee', password)
        password = None
    except (OSError, ValueError) as error:
        raise SystemExit(str(error)) from None
    handler = partial(PrivatePreview, directory=str(ROOT / 'publication-privee'))
    with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        # Le navigateur ouvre bien l'index de la version protégée, pas l'index source.
        url = f'http://127.0.0.1:{server.server_port}/index.html'
        print(f'Dossier privé : {url}\nGarde cette fenêtre ouverte. Ctrl + C pour arrêter.', flush=True)
        if not args.no_browser:
            webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
