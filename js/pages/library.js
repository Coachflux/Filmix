// ============================================
// CINEXTMA - Library Page
// ============================================

const LibraryPage = {
    async init() {
        const grid = document.getElementById('library-grid');
        const empty = document.getElementById('library-empty');

        if (AppState.watchlist.length === 0) {
            if (grid) grid.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }

        if (empty) empty.style.display = 'none';
        if (grid) {
            UI.showLoading('library-grid', AppState.watchlist.length);

            const items = await Promise.all(
                AppState.watchlist.map(async (item) => {
                    const endpoint = item.type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
                    const data = await TMDB.fetch(endpoint);
                    return data ? Components.movieCard(data, item.type) : '';
                })
            );

            grid.innerHTML = items.join('');
        }
    }
};

// Export
window.LibraryPage = LibraryPage;
