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

/* Introduction : le mur s'écarte et révèle directement le bureau. */
const intro = document.querySelector('#intro');
const enterUniverse = document.querySelector('#enter-universe');
const homeWorld = document.querySelector('#home-world');

if (intro && enterUniverse && homeWorld) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const replay = document.querySelector('#replay-intro');
    const wall = intro.querySelector('.brick-wall');
    const showHome = (focus = false) => {
        intro.hidden = true;
        intro.inert = true;
        homeWorld.setAttribute('aria-hidden', 'false');
        homeWorld.inert = false;
        document.documentElement.classList.add('has-entered');
        document.body.classList.remove('entrance-active', 'entrance-revealing');
        if (focus) document.querySelector('.chapter')?.focus({ preventScroll: true });
    };
    const buildWall = () => {
        if (wall.dataset.built) return;
        wall.dataset.built = 'true';
        wall.querySelectorAll('.brick-wall__half').forEach((half, side) => {
            for (let row = 0; row < 10; row++) {
                const course = document.createElement('div');
                course.className = 'brick-wall__row';
                for (let col = 0; col < 5; col++) {
                    const brick = document.createElement('i');
                    brick.className = `wall-brick wall-brick--${(row * 3 + col + side * 2) % 5}`;
                    brick.style.setProperty('--assembly-delay', `${(9 - row) * 35 + col * 22}ms`);
                    course.append(brick);
                }
                half.append(course);
            }
        });
    };
    const showIntro = () => {
        buildWall();
        document.documentElement.classList.remove('has-entered');
        document.body.classList.add('entrance-active');
        intro.classList.remove('is-entering');
        intro.hidden = false;
        intro.inert = false;
        homeWorld.inert = true;
        homeWorld.setAttribute('aria-hidden', 'true');
        enterUniverse.disabled = false;
    };
    if (window.dossierEntrance?.skip) showHome();
    else showIntro();

    enterUniverse.addEventListener('click', () => {
        if (intro.classList.contains('is-entering')) return;
        window.dossierEntrance?.remember();
        intro.classList.add('is-entering');
        enterUniverse.disabled = true;
        document.body.classList.add('entrance-revealing');
        window.setTimeout(() => showHome(true), reducedMotion.matches ? 80 : 2250);
    });
    replay?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        showIntro();
        intro.scrollTop = 0;
        enterUniverse.focus({ preventScroll: true });
    });
    window.addEventListener('pageshow', event => {
        if (event.persisted && (history.state?.dossierHome || location.hash === '#accueil' || intro.classList.contains('is-entering'))) showHome();
    });
}

/* Carnet : cadenas puis navigation en trois pages. */
const journalLock = document.querySelector('#journal-lock');
const closedJournal = document.querySelector('#closed-journal');
const openJournal = document.querySelector('#open-journal');

if (journalLock && closedJournal && openJournal) {
    let journalPage = 1;
    const previous = document.querySelector('#journal-prev');
    const next = document.querySelector('#journal-next');
    const pageNumber = document.querySelector('#journal-page-number');
    const pages = [...document.querySelectorAll('[data-journal-page]')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let turning = false;

    const showJournalPage = (number) => {
        const target = Math.max(1, Math.min(3, number));
        if (turning || target === journalPage) return;
        turning = true;
        const direction = target > journalPage ? 'is-turning-next' : 'is-turning-prev';
        const updateSpread = () => {
            journalPage = target;
            // Une partie = un couple texte/photos. Les deux côtés changent ensemble.
            pages.forEach(page => {
                const active = Number(page.dataset.journalPage) === journalPage;
                page.hidden = !active;
                page.classList.toggle('is-active', active);
            });
            pageNumber.textContent = journalPage;
        };
        const finishTurn = () => {
            openJournal.classList.remove(direction);
            openJournal.removeAttribute('aria-busy');
            previous.disabled = journalPage === 1;
            next.disabled = journalPage === 3;
            previous.removeAttribute('aria-disabled');
            next.removeAttribute('aria-disabled');
            if (document.activeElement === previous && previous.disabled) next.focus({ preventScroll: true });
            if (document.activeElement === next && next.disabled) previous.focus({ preventScroll: true });
            turning = false;
        };
        if (reducedMotion.matches) {
            updateSpread();
            finishTurn();
            return;
        }
        previous.setAttribute('aria-disabled', 'true');
        next.setAttribute('aria-disabled', 'true');
        openJournal.setAttribute('aria-busy', 'true');
        openJournal.classList.add(direction);
        window.setTimeout(updateSpread, 320);
        window.setTimeout(finishTurn, 680);
    };

    journalLock.addEventListener('click', () => {
        journalLock.classList.add('is-unlocked');
        journalLock.disabled = true;
        window.setTimeout(() => closedJournal.classList.add('is-opening'), reducedMotion.matches ? 0 : 350);
        window.setTimeout(() => {
            closedJournal.hidden = true;
            openJournal.hidden = false;
            next.focus({ preventScroll: true });
        }, reducedMotion.matches ? 0 : 900);
    }, { once: true });
    previous.addEventListener('click', () => showJournalPage(journalPage - 1));
    next.addEventListener('click', () => showJournalPage(journalPage + 1));
    openJournal.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        showJournalPage(journalPage + (event.key === 'ArrowRight' ? 1 : -1));
    });
}

/* Lecteur d'interview : l'affiche d'attente disparaît quand le MP4 existe. */
const interviewVideo = document.querySelector('#interview-video');
const videoPlaceholder = document.querySelector('#video-placeholder');
if (interviewVideo && videoPlaceholder) {
    interviewVideo.addEventListener('loadedmetadata', () => { videoPlaceholder.hidden = true; });
    interviewVideo.addEventListener('error', () => { videoPlaceholder.hidden = false; });
}

/* Rêverie : traverser le halo, puis revenir au ciel de départ. */
const bedroom = document.querySelector('#bedroom');
const dreamWorld = document.querySelector('#dream-world');
const enterDream = document.querySelector('#enter-dream');
const wakeUp = document.querySelector('#wake-up');

if (bedroom && dreamWorld && enterDream && wakeUp) {
    const veil = document.querySelector('.dream-veil');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let transitioning = false;
    async function changeDream(entering) {
        if (transitioning) return;
        transitioning = true;
        enterDream.disabled = wakeUp.disabled = true;
        const outgoing = entering ? bedroom : dreamWorld;
        const incoming = entering ? dreamWorld : bedroom;
        const animations = [];
        const animate = (element, frames, duration) => {
            const animation = element.animate(frames, { duration, easing: 'ease-in-out', fill: 'forwards' });
            animations.push(animation);
            return animation.finished.catch(() => {});
        };
        try {
            if (!reducedMotion.matches) {
                await Promise.all([
                    animate(veil, [{ opacity: 0 }, { opacity: 1 }], 650),
                    animate(outgoing, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: entering ? 'scale(1.08)' : 'scale(.97)' }], 650)
                ]);
            }
            outgoing.hidden = true;
            incoming.hidden = false;
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (!reducedMotion.matches) {
                await Promise.all([
                    animate(veil, [{ opacity: 1 }, { opacity: 0 }], 700),
                    animate(incoming, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], 700)
                ]);
            }
        } finally {
            animations.forEach(animation => animation.cancel());
            enterDream.disabled = wakeUp.disabled = false;
            transitioning = false;
            (entering ? document.querySelector('#dream-reading-title') : enterDream).focus({ preventScroll: true });
        }
    }
    enterDream.addEventListener('click', () => changeDream(true));
    wakeUp.addEventListener('click', () => changeDream(false));
}

const renderMarkdownFile = (container, source, emptyMessage = 'Texte à ajouter') => {
    container.textContent = 'Chargement du texte…';
    return window.DossierMarkdown.mount(container, source, emptyMessage);
};

/*
 * Souvenirs autour d'une image
 *
 * Pour ajouter un souvenir, dupliquez une entrée de cette liste puis renseignez
 * ses champs. Les photos sont recensées dans images/souvenirs/<lieu>/.
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
        albumPhotos: false,
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
        albumPhotos: false,
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
        albumPhotos: false,
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
const applySouvenirPhotos = (photos) => {
    souvenirs.forEach((souvenir) => {
        const lieu = souvenir.markdown.split('/').pop().replace('.md', '');
        if (Array.isArray(photos?.[lieu])) souvenir.images = photos[lieu];
    });
};
applySouvenirPhotos(window.DossierPhotosSouvenirs);

const refreshSouvenirPhotos = async () => {
    if (window.location.protocol === 'file:') {
        await new Promise((resolve) => {
            const listScript = document.createElement('script');
            listScript.src = `../assets/photos-souvenirs.js?t=${Date.now()}`;
            listScript.onload = () => {
                applySouvenirPhotos(window.DossierPhotosSouvenirs);
                listScript.remove();
                resolve();
            };
            listScript.onerror = () => { listScript.remove(); resolve(); };
            document.head.append(listScript);
        });
        return;
    }
    try {
        const response = await fetch('../assets/photos-souvenirs.json', { cache: 'no-store' });
        if (response.ok) applySouvenirPhotos(await response.json());
    } catch (_) { /* La version exportée utilise la liste préparée à l'ouverture. */ }
};

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

    const openPhotoAlbum = async (souvenir, triggerButton) => {
        await refreshSouvenirPhotos();
        if (!triggerButton.isConnected) return;
        triggerButton.querySelector('small').textContent = souvenir.images.length
            ? `${souvenir.images.length} photo${souvenir.images.length > 1 ? 's' : ''}`
            : 'Photos à ajouter';
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

        if (souvenir.albumPhotos !== false) {
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
        }

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
