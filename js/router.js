// ============================================
// CINEXTMA - Router
// ============================================

const Router = {
    routes: {
        'home': { page: 'home', init: () => HomePage.init() },
        'discover': { page: 'discover', init: () => DiscoverPage.init() },
        'search': { page: 'search', init: () => SearchPage.init() },
        'library': { page: 'library', init: () => LibraryPage.init() },
        'detail': { page: 'detail', init: (params) => DetailPage.init(params) },
        'movie': { page: 'detail', init: (params) => DetailPage.init({ ...params, type: 'movie' }) },
        'tv': { page: 'detail', init: (params) => DetailPage.init({ ...params, type: 'tv' }) }
    },

    currentRoute: null,

    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigate(e.state.route, e.state.params, false);
            }
        });

        // Initial route
        const hash = window.location.hash.slice(1) || 'home';
        this.navigate(hash, {}, false);
    },

    go(route, params = {}, pushState = true) {
        this.navigate(route, params, pushState);
    },

    navigate(route, params = {}, pushState = true) {
        const routeConfig = this.routes[route];
        if (!routeConfig) {
            console.error(`Route "${route}" not found`);
            return;
        }

        // Update URL
        if (pushState) {
            const url = route === 'home' ? '#' : `#${route}`;
            window.history.pushState({ route, params }, '', url);
        }

        // Update state
        AppState.setPage(routeConfig.page);
        this.currentRoute = route;

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === routeConfig.page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`page-${routeConfig.page}`);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Initialize page
        routeConfig.init(params);

        // Close any open modals
        AuthManager.hide();
        PlayerManager.close();
    },

    // Navigate to detail page
    toDetail(id, type = 'movie') {
        this.go('detail', { id, type });
    }
};

// Export
window.Router = Router;
