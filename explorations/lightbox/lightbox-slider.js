document.addEventListener("DOMContentLoaded", function () {
    const lightboxContainer = document.querySelector('.lightbox-container');
    const closeBtn = document.querySelector('.close-btn');
    const slider = document.querySelector('.slider');

    // Open lightbox
    slider.addEventListener('click', function (event) {
        if (event.target.tagName === 'IMG') {
            lightboxContainer.style.display = 'flex';
            lightboxContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Display selected image
            const imgSrc = event.target.src;
            const imgAlt = event.target.alt;
            lightboxContainer.innerHTML = `
                <div class="lightbox-content">
                    <span class="close-btn">&times;</span>
                    <div class="slider">
                        <img src="${imgSrc}" alt="${imgAlt}">
                    </div>
                </div>
            `;
        }
    });

    // Close lightbox
    closeBtn.addEventListener('click', function () {
        lightboxContainer.style.display = 'none';
    });

    lightboxContainer.addEventListener('click', function (event) {
        if (event.target === lightboxContainer) {
            lightboxContainer.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            lightboxContainer.style.display = 'none';
        }
    });
});
