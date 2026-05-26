// ============================================
// CINEXTMA - Components
// ============================================

const Components = {
    // Movie Card
    movieCard(movie, type = 'movie') {
        const poster = TMDB.image(movie.poster_path, 'w500');
        const title = movie.title || movie.name || 'Untitled';
        const date = movie.release_date || movie.first_air_date || '';
        const year = UI.getYear(date);
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
        const id = movie.id;

        return `
            <div class="movie-card" onclick="Router.go('detail', { id: ${id}, type: '${type}' })" data-id="${id}" data-type="${type}">
                <div class="movie-poster">
                    <img src="${poster}" alt="${title}" loading="lazy" 
                        onerror="this.onerror=null; UI.setImageFallback(this, 'poster')">
                    <div class="poster-overlay"></div>
                    <div class="play-btn"><i class="fas fa-play"></i></div>
                    <div class="movie-rating"><i class="fas fa-star"></i> ${rating}</div>
                </div>
                <div class="movie-info">
                    <h3>${title}</h3>
                    <div class="movie-meta">
                        <span>${year}</span>
                        <span class="dot"></span>
                        <span>${type === 'tv' ? 'TV Show' : 'Movie'}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Cast Card
    castCard(person) {
        const image = person.profile_path 
            ? TMDB.image(person.profile_path, 'w200')
            : `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"><circle cx="70" cy="70" r="70" fill="%23252429"/><text fill="%23666" x="70" y="75" text-anchor="middle" font-family="Poppins" font-size="24" font-weight="700">${person.name.charAt(0)}</text></svg>`)}`;

        return `
            <div class="cast-card">
                <img src="${image}" alt="${person.name}" loading="lazy"
                    onerror="this.onerror=null; UI.setImageFallback(this, 'avatar')">
                <h4>${person.name}</h4>
                <p>${person.character || 'Unknown'}</p>
            </div>
        `;
    },

    // Skeleton Card
    skeletonCard() {
        return `
            <div class="movie-card">
                <div class="skeleton skeleton-poster"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        `;
    },

    // Section with carousel
    section(title, id, seeAllCallback = null) {
        return `
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">${title}</h2>
                    ${seeAllCallback ? `<a class="see-all" onclick="${seeAllCallback}">See All <i class="fas fa-chevron-right"></i></a>` : ''}
                </div>
                <div class="carousel-container">
                    <button class="carousel-nav prev" onclick="Carousel.scroll('${id}', -1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="carousel" id="${id}"></div>
                    <button class="carousel-nav next" onclick="Carousel.scroll('${id}', 1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    // Pagination
    pagination(current, total, onChange) {
        if (total <= 1) return '';

        let html = `
            <button class="page-btn" onclick="${onChange}(${current - 1})" ${current <= 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);

        if (start > 1) {
            html += `<button class="page-btn" onclick="${onChange}(1)">1</button>`;
            if (start > 2) html += `<span class="page-btn dots">...</span>`;
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="${onChange}(${i})">${i}</button>`;
        }

        if (end < total) {
            if (end < total - 1) html += `<span class="page-btn dots">...</span>`;
            html += `<button class="page-btn" onclick="${onChange}(${total})">${total}</button>`;
        }

        html += `
            <button class="page-btn" onclick="${onChange}(${current + 1})" ${current >= total ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        return html;
    },

    // Empty State
    emptyState(icon, title, subtitle, action = null) {
        return `
            <div class="library-empty">
                <i class="fas ${icon}"></i>
                <h3>${title}</h3>
                <p>${subtitle}</p>
                ${action ? `<button class="btn btn-primary mt-4" onclick="${action}"><i class="fas fa-compass"></i> Discover</button>` : ''}
            </div>
        `;
    },

    // No Results
    noResults() {
        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
    },

    // Genre Tag
    genreTag(name) {
        return `<span class="genre-tag">${name}</span>`;
    },

    // Stat
    stat(value, label) {
        return `
            <div class="stat">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
            </div>
        `;
    }
};

// Carousel Controller
const Carousel = {
    scroll(id, direction) {
        const carousel = document.getElementById(id);
        if (!carousel) return;
        const scrollAmount = 220 * 3;
        carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
};

// Export
window.Components = Components;
window.Carousel = Carousel;
