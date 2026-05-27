// ============================================
// WATCHMORE - Search Page
// ============================================

const SearchPage = {
    init() {
        if (AppState.searchQuery) {
            this.performSearch(AppState.searchQuery);
        } else {
            this.showEmpty();
        }
    },

    showEmpty() {
        const grid = document.getElementById('search-grid');
        const empty = document.getElementById('search-empty');
        if (grid) grid.innerHTML = '';
        if (empty) empty.style.display = 'none';
        document.getElementById('search-subtitle').textContent = 'Find your favorite movies and TV shows';
    },

    async performSearch(query) {
        const grid = document.getElementById('search-grid');
        const empty = document.getElementById('search-empty');
        if (!grid) return;

        UI.showLoading('search-grid', 8);
        if (empty) empty.style.display = 'none';

        document.getElementById('search-subtitle').textContent = `Results for "${query}"`;

        const data = await TMDB.fetch('/search/multi', { query, page: 1 });
        if (data && data.results) {
            const results = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
            if (results.length === 0) {
                grid.innerHTML = '';
                if (empty) empty.style.display = 'block';
            } else {
                grid.innerHTML = results.map(item => 
                    Components.movieCard(item, item.media_type)
                ).join('');
            }
        }
    }
};

window.SearchPage = SearchPage;
