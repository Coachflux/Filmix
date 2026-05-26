// ============================================
// CINEXTMA - Home Page
// ============================================

const HomePage = {
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.loadData();
    },

    async loadData() {
        // Load hero
        const trending = await TMDB.fetch('/trending/movie/day');
        if (trending && trending.results.length > 0) {
            AppState.featuredMovie = trending.results[0];
            this.renderHero(AppState.featuredMovie);
        }

        // Load carousels in parallel
        await Promise.all([
            this.loadCarousel('trending-today', '/trending/movie/day'),
            this.loadCarousel('trending-week', '/trending/movie/week'),
            this.loadCarousel('popular', '/movie/popular'),
            this.loadCarousel('now-playing', '/movie/now_playing'),
            this.loadCarousel('top-rated', '/movie/top_rated')
        ]);
    },

    renderHero(movie) {
        const backdrop = TMDB.backdrop(movie.backdrop_path);
        const genres = (movie.genre_ids || []).slice(0, 2).map(g => UI.getGenreName(g)).join(', ');

        document.getElementById('hero-backdrop').style.backgroundImage = `url(${backdrop})`;
        document.getElementById('hero-title').textContent = movie.title;
        document.getElementById('hero-meta').innerHTML = `
            <div class="rating"><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</div>
            <span class="year">${UI.getYear(movie.release_date)}</span>
            <span class="genre">${genres}</span>
        `;
        document.getElementById('hero-desc').textContent = movie.overview;
    },

    async loadCarousel(id, endpoint, params = {}) {
        const container = document.getElementById(id);
        if (!container) return;

        UI.showLoading(id, 6);

        const data = await TMDB.fetch(endpoint, params);
        if (data && data.results) {
            container.innerHTML = data.results.slice(0, 12).map(m => Components.movieCard(m)).join('');
        }
    },

    playFeatured() {
        if (!AppState.featuredMovie) return;
        PlayerManager.open(AppState.featuredMovie.id, 'movie', AppState.featuredMovie.title);
    },

    showFeaturedDetail() {
        if (AppState.featuredMovie) {
            Router.toDetail(AppState.featuredMovie.id, 'movie');
        }
    }
};

// Export
window.HomePage = HomePage;
