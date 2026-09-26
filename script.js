const chapters = document.querySelectorAll('.chapter');

chapters.forEach((chapter, index) => {
    chapter.style.setProperty('--delay', `${index * 70}ms`);
});

const revealChapters = () => {
    chapters.forEach((chapter) => chapter.classList.add('is-visible'));
};

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealChapters();
} else {
    window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(revealChapters), { once: true });
}

const renderMarkdownFile = async (container, source, emptyMessage = 'Texte à ajouter') => {
    container.classList.add('is-loading');
    container.textContent = 'Chargement du texte…';

    try {
        const response = await fetch(source, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }

        const markdownText = await response.text();

        if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
            throw new Error('Le lecteur Markdown est indisponible.');
        }

        const renderedHtml = marked.parse(markdownText, { breaks: true });
        container.innerHTML = DOMPurify.sanitize(renderedHtml);
        container.classList.remove('is-loading');

        const hasVisibleContent = container.textContent.trim() || container.querySelector('img, hr, blockquote, ul, ol');

        if (!hasVisibleContent) {
            container.textContent = emptyMessage;
            container.classList.add('markdown-content--empty');
        }
    } catch (error) {
        container.classList.remove('is-loading');
        container.classList.add('markdown-content--error');
        container.textContent = 'Le texte Markdown n’a pas pu être chargé. Ouvrez le site depuis un serveur local, puis actualisez la page.';
    }
};

const markdownPageContent = document.querySelector('[data-markdown-source]');

if (markdownPageContent) {
    renderMarkdownFile(
        markdownPageContent,
        markdownPageContent.dataset.markdownSource,
        'Ce texte est encore vide.'
    );
}

/*
 * Souvenirs autour d'une image
 *
 * Pour ajouter un souvenir, dupliquez une entrée de cette liste puis renseignez
 * ses champs. Le tableau "images" accepte un ou plusieurs chemins d'images.
 */
const souvenirs = [
    {
        lieu: 'Lisbonne, Portugal',
        latitude: 38.7223,
        longitude: -9.1393,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/lisbonne.md',
        images: []
    },
    {
        lieu: 'Londres, Royaume-Uni',
        latitude: 51.5074,
        longitude: -0.1278,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/londres.md',
        images: []
    },
    {
        lieu: 'Rennes, France',
        latitude: 48.1173,
        longitude: -1.6778,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/rennes.md',
        images: []
    },
    {
        lieu: 'Châteaugiron, France',
        latitude: 48.0489,
        longitude: -1.5019,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/chateaugiron.md',
        images: []
    },
    {
        lieu: 'Chanteloup, France',
        latitude: 47.9667,
        longitude: -1.6142,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/chanteloup.md',
        images: []
    },
    {
        lieu: 'ZooParc de Beauval, France',
        latitude: 47.2478,
        longitude: 1.3535,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/beauval.md',
        images: []
    },
    {
        lieu: 'Vezzano Ligure, Italie',
        latitude: 44.1413,
        longitude: 9.8901,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/vezzano-ligure.md',
        images: []
    },
    {
        lieu: 'Vinaròs, Espagne',
        latitude: 40.4708,
        longitude: 0.4748,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/vinaros.md',
        images: []
    },
    {
        lieu: 'Gérardmer, France',
        latitude: 48.0731,
        longitude: 6.8794,
        titre: '',
        date: '',
        texte: '',
        markdown: '../textes/souvenirs/gerardmer.md',
        images: []
    }
];

const mapElement = document.querySelector('#souvenir-map');

if (mapElement && typeof L !== 'undefined') {
    const map = L.map(mapElement, {
        zoomControl: true,
        scrollWheelZoom: true,
        maxBoundsViscosity: 1
    });

    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Impossible de charger les frontières.');
            }
            return response.json();
        })
        .then((world) => {
            const countries = topojson.feature(world, world.objects.countries);

            L.geoJSON(countries, {
                interactive: false,
                style: {
                    color: '#7e918c',
                    weight: 1,
                    opacity: 0.9,
                    fillColor: '#eee9df',
                    fillOpacity: 1
                }
            }).addTo(map);
        })
        .catch(() => {
            mapElement.classList.add('souvenir-map--boundaries-unavailable');
        });

    const mapHeader = document.querySelector('#map-page-header');
    const mapView = document.querySelector('#map-view');
    const detailPage = document.querySelector('#memory-detail');
    const detailContent = document.querySelector('#memory-detail-content');
    const backToMapButton = document.querySelector('#memory-detail-back');
    const photoAlbum = document.querySelector('#photo-album');
    const photoAlbumWindow = photoAlbum.querySelector('.photo-album__window');
    const photoAlbumTitle = document.querySelector('#photo-album-title');
    const photoAlbumGallery = document.querySelector('#photo-album-gallery');
    const closePhotoAlbumButton = document.querySelector('#photo-album-close');
    let albumReturnFocus = null;
    const createTextElement = (tagName, className, text) => {
        const element = document.createElement(tagName);
        element.className = className;
        element.textContent = text;
        return element;
    };

    const souvenirSlug = (lieu) => lieu
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const closeMemoryPage = () => {
        detailPage.hidden = true;
        mapHeader.hidden = false;
        mapView.hidden = false;
        document.title = 'Souvenirs autour d’une image — Dossier Moi';
        requestAnimationFrame(() => map.invalidateSize());
    };

    const closePhotoAlbum = () => {
        photoAlbum.hidden = true;
        document.body.classList.remove('has-photo-album');

        if (albumReturnFocus?.isConnected) {
            albumReturnFocus.focus({ preventScroll: true });
        }
    };

    const openPhotoAlbum = (souvenir, triggerButton) => {
        albumReturnFocus = triggerButton;
        photoAlbumTitle.textContent = souvenir.lieu;
        photoAlbumGallery.replaceChildren();

        if (souvenir.images.length) {
            souvenir.images.forEach((imagePath, index) => {
                const figure = document.createElement('figure');
                const image = document.createElement('img');
                image.src = imagePath;
                image.alt = souvenir.titre
                    ? `${souvenir.titre} — photo ${index + 1}`
                    : `${souvenir.lieu} — photo ${index + 1}`;
                image.loading = 'lazy';
                figure.append(image);
                photoAlbumGallery.append(figure);
            });
        } else {
            photoAlbumGallery.append(
                createTextElement('p', 'photo-album__empty', 'Aucune photo ajoutée pour le moment.')
            );
        }

        photoAlbum.hidden = false;
        document.body.classList.add('has-photo-album');
        photoAlbumWindow.focus({ preventScroll: true });
    };

    const openMemoryPage = (souvenir, updateHistory = true) => {
        detailContent.replaceChildren();

        const eyebrow = createTextElement('p', 'memory-detail__eyebrow', 'Souvenir autour d’une image');
        const heading = createTextElement('h2', 'memory-detail__place', souvenir.lieu);
        heading.id = 'memory-detail-place';
        detailContent.append(eyebrow, heading);

        if (souvenir.titre) {
            detailContent.append(createTextElement('h3', 'memory-detail__title', souvenir.titre));
        }

        if (souvenir.date) {
            detailContent.append(createTextElement('p', 'memory-detail__date', souvenir.date));
        }

        const albumButton = document.createElement('button');
        albumButton.className = 'memory-detail__album-button';
        albumButton.type = 'button';
        albumButton.innerHTML = `
            <span class="memory-detail__album-icon" aria-hidden="true">▣</span>
            <span>
                <strong>Ouvrir l’album photos</strong>
                <small>${souvenir.images.length ? `${souvenir.images.length} photo${souvenir.images.length > 1 ? 's' : ''}` : 'Photos à ajouter'}</small>
            </span>
            <span class="memory-detail__album-arrow" aria-hidden="true">→</span>
        `;
        albumButton.addEventListener('click', () => openPhotoAlbum(souvenir, albumButton));
        detailContent.append(albumButton);

        if (souvenir.texte) {
            detailContent.append(createTextElement('p', 'memory-detail__story', souvenir.texte));
        } else if (souvenir.markdown) {
            const markdownStory = document.createElement('div');
            markdownStory.className = 'memory-detail__story markdown-content';
            detailContent.append(markdownStory);
            renderMarkdownFile(markdownStory, souvenir.markdown, 'Description à ajouter');
        } else {
            detailContent.append(createTextElement('p', 'memory-detail__story memory-detail__story--empty', 'Description à ajouter'));
        }

        mapHeader.hidden = true;
        mapView.hidden = true;
        detailPage.hidden = false;
        document.title = `${souvenir.lieu} — Dossier Moi`;
        window.scrollTo({ top: 0, behavior: 'instant' });
        backToMapButton.focus({ preventScroll: true });

        if (updateHistory) {
            history.pushState(
                { souvenir: souvenirSlug(souvenir.lieu) },
                '',
                `#souvenir=${souvenirSlug(souvenir.lieu)}`
            );
        }
    };

    souvenirs.forEach((souvenir) => {
        const markerIcon = L.divIcon({
            className: 'memory-marker',
            html: '<span aria-hidden="true"></span>',
            iconSize: [36, 48],
            iconAnchor: [18, 45],
            tooltipAnchor: [0, -39]
        });

        const marker = L.marker([souvenir.latitude, souvenir.longitude], {
            icon: markerIcon,
            title: souvenir.lieu,
            alt: `Ouvrir le souvenir de ${souvenir.lieu}`,
            riseOnHover: true
        }).addTo(map);

        marker.bindTooltip(souvenir.lieu, {
            direction: 'top',
            offset: [0, -4],
            opacity: 0.96
        });

        marker.on('click', () => openMemoryPage(souvenir));
    });

    const europeBounds = L.latLngBounds(
        [33, -16],
        [62, 32]
    );

    map.setMaxBounds(europeBounds.pad(0.08));
    map.fitBounds(europeBounds);
    map.setMinZoom(map.getZoom());

    backToMapButton.addEventListener('click', () => {
        if (history.state?.souvenir) {
            history.back();
        } else {
            closeMemoryPage();
            history.replaceState(null, '', window.location.pathname);
        }
    });

    closePhotoAlbumButton.addEventListener('click', closePhotoAlbum);
    photoAlbum.querySelector('[data-close-album]').addEventListener('click', closePhotoAlbum);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !photoAlbum.hidden) {
            closePhotoAlbum();
        }
    });

    window.addEventListener('popstate', () => {
        const slug = window.location.hash.replace('#souvenir=', '');
        const souvenir = souvenirs.find((item) => souvenirSlug(item.lieu) === slug);

        if (souvenir) {
            openMemoryPage(souvenir, false);
        } else {
            closeMemoryPage();
        }
    });

    const initialSlug = window.location.hash.replace('#souvenir=', '');
    const initialSouvenir = souvenirs.find((item) => souvenirSlug(item.lieu) === initialSlug);

    if (initialSouvenir) {
        openMemoryPage(initialSouvenir, false);
    }
} else if (mapElement) {
    mapElement.textContent = 'La carte n\u2019a pas pu se charger. Vérifiez votre connexion internet puis actualisez la page.';
    mapElement.classList.add('souvenir-map--error');
}
