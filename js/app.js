// ============================================
// CINEXTMA - Main App Controller
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    ThemeManager.init();

    // Initialize Firebase
    FirebaseManager.init();

    // Initialize router
    Router.init();

    // Setup global event listeners
    setupGlobalEvents();

    console.log('🍿 CINEXTMA initialized');
});

function setupGlobalEvents() {
    // Search input
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', UI.debounce((e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                AppState.searchQuery = query;
                Router.go('search');
                SearchPage.performSearch(query);
            }
        }, 500));

        searchInput.addEventListener('focus', () => {
            const shortcut = document.querySelector('.search-shortcut');
            if (shortcut) shortcut.style.display = 'none';
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+K for search
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) searchInput.focus();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            AuthManager.hide();
            PlayerManager.close();
        }
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                if (overlay.id === 'auth-modal') AuthManager.hide();
            }
        });
    });

    // Auth form
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', (e) => AuthManager.handleSubmit(e));
    }
}

// Global helper functions for inline onclick handlers
window.navigateTo = (page) => Router.go(page);
window.toggleTheme = () => ThemeManager.toggle();
window.showAuthModal = () => AuthManager.show();
window.closeAuthModal = () => AuthManager.hide();
window.toggleAuthMode = () => AuthManager.toggleMode();
window.handleAuth = (e) => AuthManager.handleSubmit(e);
window.scrollCarousel = (id, dir) => Carousel.scroll(id, dir);
window.setContentType = (type) => DiscoverPage.setContentType(type);
window.setFilter = (filter) => DiscoverPage.setFilter(filter);
window.changePage = (page) => DiscoverPage.changePage(page);
window.showDetail = (id, type) => Router.toDetail(id, type);
window.playFeatured = () => HomePage.playFeatured();
window.showFeaturedDetail = () => HomePage.showFeaturedDetail();
window.playCurrent = () => DetailPage.play();
window.toggleWatchlistCurrent = () => DetailPage.toggleWatchlist();
window.shareCurrent = () => DetailPage.share();
window.closePlayer = () => PlayerManager.close();
