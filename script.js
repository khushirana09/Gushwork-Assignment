function scrollCarousel(id, dir) {
    const el = document.getElementById(id === 'apps' ? 'appsCarousel' : 'testCarousel');
    el.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.chevron').textContent = '∨';
    });
    if (!isOpen) {
        item.classList.add('open');
        btn.querySelector('.chevron').textContent = '∧';
    }
}

function switchTab(btn, id) {
    document.querySelectorAll('.process-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

const galleryMain = document.querySelector('.gallery-main');
const galleryMainImg = galleryMain ? galleryMain.querySelector('img') : null;
const zoomLens = galleryMain ? galleryMain.querySelector('.zoom-lens') : null;
const zoomPreview = document.querySelector('.hero-zoom-preview');
const galleryThumbs = document.querySelectorAll('.gallery-thumb');
const galleryButtons = document.querySelectorAll('.gallery-btn');
let activeGalleryIndex = Math.max(0, Array.from(galleryThumbs).findIndex(t => t.classList.contains('active')));

function syncZoomPreviewImage() {
    if (!galleryMainImg || !zoomPreview) {
        return;
    }
    const imgSrc = galleryMainImg.getAttribute('src') || '';
    zoomPreview.style.backgroundImage = imgSrc ? `url("${imgSrc}")` : 'none';
}

syncZoomPreviewImage();

function setActiveGalleryItem(index) {
    if (!galleryThumbs.length || !galleryMainImg) {
        return;
    }

    const max = galleryThumbs.length;
    activeGalleryIndex = ((index % max) + max) % max;

    galleryThumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === activeGalleryIndex);
    });

    const activeThumbImg = galleryThumbs[activeGalleryIndex].querySelector('img');
    if (!activeThumbImg) {
        return;
    }

    const nextSrc = activeThumbImg.getAttribute('src');
    const nextAlt = activeThumbImg.getAttribute('alt');
    if (nextSrc) {
        galleryMainImg.setAttribute('src', nextSrc);
    }
    if (nextAlt) {
        galleryMainImg.setAttribute('alt', nextAlt);
    }

    galleryThumbs[activeGalleryIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
    });

    syncZoomPreviewImage();
}

// Gallery thumbnail click
galleryThumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
        setActiveGalleryItem(index);
    });
});

if (galleryButtons.length >= 2) {
    galleryButtons[0].addEventListener('click', () => {
        setActiveGalleryItem(activeGalleryIndex - 1);
    });

    galleryButtons[1].addEventListener('click', () => {
        setActiveGalleryItem(activeGalleryIndex + 1);
    });
}

if (galleryMain && galleryMainImg && zoomLens && zoomPreview) {
    const zoomFactor = 2.2;
    const lensW = 132;
    const lensH = 132;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function hideZoom() {
        galleryMain.classList.remove('zoom-active');
    }

    function showZoom() {
        if (window.innerWidth <= 992) {
            return;
        }
        galleryMain.classList.add('zoom-active');
    }

    function updateZoom(e) {
        if (window.innerWidth <= 992) {
            hideZoom();
            return;
        }

        const rect = galleryMainImg.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return;
        }

        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        x = clamp(x, 0, rect.width);
        y = clamp(y, 0, rect.height);

        const lensX = clamp(x - lensW / 2, 0, rect.width - lensW);
        const lensY = clamp(y - lensH / 2, 0, rect.height - lensH);

        zoomLens.style.left = `${lensX}px`;
        zoomLens.style.top = `${lensY}px`;

        zoomPreview.style.backgroundSize = `${rect.width * zoomFactor}px ${rect.height * zoomFactor}px`;

        const bgX = clamp((x * zoomFactor) - (zoomPreview.clientWidth / 2), 0, (rect.width * zoomFactor) - zoomPreview.clientWidth);
        const bgY = clamp((y * zoomFactor) - (zoomPreview.clientHeight / 2), 0, (rect.height * zoomFactor) - zoomPreview.clientHeight);

        zoomPreview.style.backgroundPosition = `-${bgX}px -${bgY}px`;
    }

    galleryMain.addEventListener('mouseenter', showZoom);
    galleryMain.addEventListener('mousemove', updateZoom);
    galleryMain.addEventListener('mouseleave', hideZoom);
    window.addEventListener('resize', hideZoom);
    galleryMainImg.addEventListener('load', syncZoomPreviewImage);
}