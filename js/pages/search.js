// ============================================
// CINEXTMA - Search Page (FIXED)
// ============================================

const SearchPage = {
    init() {
        // Set up search input on search page
        const searchInput = document.getElementById('page-search-input');
        if (searchInput) {
            searchInput.value = AppState.searchQuery || '';
            searchInput.focus();

            // Remove old listener to prevent duplicates
            const newInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newInput, searchInput);

            newInput.addEventListener('input', UI.debounce((e) => {
                const query = e.target.value.trim();
                AppState.searchQuery = query;
                if (query.length > 0) {
                    this.performSearch(query);
                } else {
                    this.showEmpty();
                }
            }, 500));

            // Also handle enter key
            newInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query.length > 0) {
                        AppState.searchQuery = query;
                        this.performSearch(query);
                    }
                }
            });
        }

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
        const subtitle = document.getElementById('search-subtitle');
        if (subtitle) subtitle.textContent = 'Find your favorite movies and TV shows';
    },

    async performSearch(query) {
        const grid = document.getElementById('search-grid');
        const empty = document.getElementById('search-empty');
        if (!grid) return;

        UI.showLoading('search-grid', 8);
        if (empty) empty.style.display = 'none';

        const subtitle = document.getElementById('search-subtitle');
        if (subtitle) subtitle.textContent = `Results for "${query}"`;

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

// Export
window.SearchPage = SearchPage;
