// Gallery specific functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeGalleryFilter();
    initializeCounters();
    initializeLightbox();
    initializeLazyLoadingForGallery();
});

// Gallery filtering functionality
function initializeGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery items
            filterGalleryItems(galleryItems, filter);
        });
    });
}

// Filter gallery items with animation
function filterGalleryItems(items, filter) {
    items.forEach((item, index) => {
        const category = item.dataset.category;
        
        if (filter === 'all' || category === filter) {
            item.style.display = 'block';
            item.classList.remove('hidden');
            item.classList.add('filtered');
            item.style.animationDelay = `${index * 0.1}s`;
        } else {
            item.classList.add('hidden');
            item.classList.remove('filtered');
            setTimeout(() => {
                if (item.classList.contains('hidden')) {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });
}

// Initialize counter animations
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Animate counter numbers
function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    let current = 0;
    const increment = target / 60; // Complete in ~1 second at 60fps
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16); // ~60fps
}

// Enhanced lightbox functionality for gallery
function initializeLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    let currentImageIndex = 0;
    let images = [];
    let filteredImages = [];
    
    // Collect all gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            const imageData = {
                src: img.src,
                alt: img.alt,
                caption: item.dataset.caption || img.alt,
                category: item.dataset.category,
                element: item
            };
            images.push(imageData);
            
            item.addEventListener('click', function() {
                updateFilteredImages();
                const filteredIndex = filteredImages.findIndex(imgData => imgData === imageData);
                if (filteredIndex !== -1) {
                    currentImageIndex = filteredIndex;
                    openLightbox();
                }
            });
        }
    });
    
    function updateFilteredImages() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        if (activeFilter === 'all') {
            filteredImages = [...images];
        } else {
            filteredImages = images.filter(img => img.category === activeFilter);
        }
    }
    
    function openLightbox() {
        if (lightbox && filteredImages[currentImageIndex]) {
            const currentImage = filteredImages[currentImageIndex];
            lightboxImg.src = currentImage.src;
            lightboxImg.alt = currentImage.alt;
            lightboxCaption.textContent = currentImage.caption;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Preload adjacent images
            preloadAdjacentImages();
        }
    }
    
    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
        openLightbox();
    }
    
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        openLightbox();
    }
    
    function preloadAdjacentImages() {
        const preloadIndexes = [
            (currentImageIndex + 1) % filteredImages.length,
            (currentImageIndex - 1 + filteredImages.length) % filteredImages.length
        ];
        
        preloadIndexes.forEach(index => {
            const img = new Image();
            img.src = filteredImages[index].src;
        });
    }
    
    // Event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', nextImage);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', prevImage);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
    }
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox && lightbox.classList.contains('active')) {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    nextImage();
                    break;
            }
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                prevImage();
            } else {
                nextImage();
            }
        }
    }
}

// Enhanced lazy loading for gallery images
function initializeLazyLoadingForGallery() {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Create a temporary image to handle loading states
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        img.src = tempImg.src;
                        img.classList.add('loaded');
                        img.parentElement.classList.add('image-loaded');
                    };
                    tempImg.src = img.dataset.src || img.src;
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        galleryImages.forEach(img => {
            // Add loading placeholder
            img.parentElement.classList.add('image-loading');
            imageObserver.observe(img);
        });
    }
}

// Gallery search functionality
function initializeGallerySearch() {
    const searchInput = document.getElementById('gallery-search');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            galleryItems.forEach(item => {
                const caption = item.dataset.caption.toLowerCase();
                const alt = item.querySelector('img').alt.toLowerCase();
                
                if (caption.includes(searchTerm) || alt.includes(searchTerm)) {
                    item.style.display = 'block';
                    item.classList.remove('hidden');
                } else {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }
            });
        });
    }
}

// Gallery slideshow mode
function initializeSlideshow() {
    let slideshowInterval;
    let isSlideshow = false;
    
    function startSlideshow() {
        if (!isSlideshow) {
            isSlideshow = true;
            slideshowInterval = setInterval(() => {
                const nextBtn = document.getElementById('lightbox-next');
                if (nextBtn) nextBtn.click();
            }, 3000); // Change image every 3 seconds
        }
    }
    
    function stopSlideshow() {
        if (isSlideshow) {
            isSlideshow = false;
            clearInterval(slideshowInterval);
        }
    }
    
    // Add slideshow controls if needed
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        // Stop slideshow on user interaction
        lightbox.addEventListener('click', stopSlideshow);
        document.addEventListener('keydown', function(e) {
            if (lightbox.classList.contains('active') && 
                ['ArrowLeft', 'ArrowRight', 'Escape', ' '].includes(e.key)) {
                stopSlideshow();
            }
        });
    }
}

// Initialize additional gallery features
document.addEventListener('DOMContentLoaded', function() {
    initializeGallerySearch();
    initializeSlideshow();
});