// ============================================
// CINEXTMA - Utilities
// ============================================

const CONFIG = {
    TMDB_API_KEY: 'becc030248ec01bad5e0a45c4239fac3',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
    FIREBASE_CONFIG: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef"
    }
};

const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
    10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
    10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

// State management
const AppState = {
    currentPage: 'home',
    currentContentType: 'movie',
    currentFilter: 'discover',
    currentDetail: null,
    currentUser: null,
    watchlist: JSON.parse(localStorage.getItem('cinextma_watchlist') || '[]'),
    authMode: 'signin',
    discoverPage: 1,
    searchQuery: '',
    featuredMovie: null,

    setPage(page) { this.currentPage = page; },
    setContentType(type) { this.currentContentType = type; },
    setFilter(filter) { this.currentFilter = filter; },
    setDetail(id, type) { this.currentDetail = { id, type }; },

    addToWatchlist(item) {
        const exists = this.watchlist.some(w => w.id === item.id && w.type === item.type);
        if (!exists) {
            this.watchlist.push({ ...item, saved_date: new Date().toISOString() });
            this.saveWatchlist();
            return true;
        }
        return false;
    },

    removeFromWatchlist(id, type) {
        const index = this.watchlist.findIndex(w => w.id === id && w.type === type);
        if (index > -1) {
            this.watchlist.splice(index, 1);
            this.saveWatchlist();
            return true;
        }
        return false;
    },

    isInWatchlist(id, type) {
        return this.watchlist.some(w => w.id === id && w.type === type);
    },

    saveWatchlist() {
        localStorage.setItem('cinextma_watchlist', JSON.stringify(this.watchlist));
        if (this.currentUser && typeof firebase !== 'undefined') {
            firebase.firestore().collection('users').doc(this.currentUser.uid)
                .set({ watchlist: this.watchlist }, { merge: true })
                .catch(() => {});
        }
    },

    async loadWatchlistFromFirebase() {
        if (!this.currentUser || typeof firebase === 'undefined') return;
        try {
            const doc = await firebase.firestore().collection('users').doc(this.currentUser.uid).get();
            if (doc.exists && doc.data().watchlist) {
                this.watchlist = doc.data().watchlist;
                localStorage.setItem('cinextma_watchlist', JSON.stringify(this.watchlist));
            }
        } catch (e) {
            console.log('Could not load from Firebase');
        }
    }
};

// TMDB API
const TMDB = {
    async fetch(endpoint, params = {}) {
        const queryParams = new URLSearchParams({ ...params, language: 'en-US' });
        const url = `${CONFIG.TMDB_BASE_URL}${endpoint}?${queryParams}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.TMDB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('TMDB Error:', error);
            UI.showToast('Failed to load data. Please try again.', 'error');
            return null;
        }
    },

    image(path, size = 'w500') {
        return path ? `${CONFIG.TMDB_IMAGE_BASE}/${size}${path}` : '';
    },

    backdrop(path) {
        return this.image(path, 'original');
    }
};

// UI Utilities
const UI = {
    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Modal management
    showModal(id) {
        document.getElementById(id).classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    hideModal(id) {
        document.getElementById(id).classList.remove('active');
        document.body.style.overflow = '';
    },

    // Loading states
    showLoading(containerId, count = 6) {
        const container = document.getElementById(containerId);
        container.innerHTML = Array(count).fill(0).map(() => `
            <div class="movie-card">
                <div class="skeleton skeleton-poster"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        `).join('');
    },

    showSpinner(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="loading-center">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    },

    // Format utilities
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    },

    formatCurrency(num) {
        if (!num || num === 0) return '-';
        return '$' + this.formatNumber(num);
    },

    formatRuntime(minutes) {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    },

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    },

    getGenreName(id) {
        return GENRE_MAP[id] || 'Movie';
    },

    getYear(dateStr) {
        return dateStr ? dateStr.split('-')[0] : 'N/A';
    },

    // Debounce utility
    debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    },

    // Image fallback
    setImageFallback(img, type = 'poster') {
        const svg = type === 'poster' 
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23252429" width="200" height="300"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" font-family="Poppins" font-size="14">No Image</text></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"><circle cx="70" cy="70" r="70" fill="%23252429"/><text fill="%23666" x="70" y="75" text-anchor="middle" font-family="Poppins" font-size="12">?</text></svg>`;
        img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
};

// Theme Manager
const ThemeManager = {
    init() {
        const saved = localStorage.getItem('cinextma_theme') || 'dark';
        this.set(saved);
    },

    set(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('cinextma_theme', theme);
        this.updateIcons(theme);
    },

    toggle() {
        const current = document.body.getAttribute('data-theme');
        this.set(current === 'dark' ? 'light' : 'dark');
    },

    updateIcons(theme) {
        const icon = theme === 'dark' ? 'fa-moon' : 'fa-sun';
        document.querySelectorAll('[id^="theme-icon"]').forEach(el => {
            el.className = `fas ${icon}`;
        });
    }
};

// Firebase Manager
const FirebaseManager = {
    initialized: false,

    init() {
        try {
            if (typeof firebase === 'undefined') return;
            if (firebase.apps.length === 0) {
                firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
            }
            this.initialized = true;

            firebase.auth().onAuthStateChanged(user => {
                AppState.currentUser = user;
                AuthManager.updateUI();
                if (user) {
                    AppState.loadWatchlistFromFirebase();
                    UI.showToast(`Welcome back!`, 'success');
                }
            });
        } catch (e) {
            console.log('Firebase not available');
        }
    },

    async signIn(email, password) {
        if (!this.initialized) throw new Error('Firebase not initialized');
        return await firebase.auth().signInWithEmailAndPassword(email, password);
    },

    async signUp(email, password) {
        if (!this.initialized) throw new Error('Firebase not initialized');
        return await firebase.auth().createUserWithEmailAndPassword(email, password);
    },

    async signOut() {
        if (!this.initialized) return;
        await firebase.auth().signOut();
    }
};

// Auth Manager
const AuthManager = {
    mode: 'signin',

    show() {
        if (AppState.currentUser) {
            if (confirm('Sign out of your account?')) {
                FirebaseManager.signOut().then(() => {
                    UI.showToast('Signed out successfully', 'info');
                });
            }
            return;
        }
        this.setMode('signin');
        UI.showModal('auth-modal');
    },

    hide() {
        UI.hideModal('auth-modal');
    },

    setMode(mode) {
        this.mode = mode;
        const isSignIn = mode === 'signin';

        document.getElementById('auth-title').textContent = isSignIn ? 'Welcome Back' : 'Create Account';
        document.getElementById('auth-subtitle').textContent = isSignIn 
            ? 'Sign in to access your library' 
            : 'Join CINEXTMA today';
        document.getElementById('auth-btn').innerHTML = isSignIn 
            ? '<i class="fas fa-sign-in-alt"></i> Sign In' 
            : '<i class="fas fa-user-plus"></i> Sign Up';
        document.getElementById('auth-footer-text').textContent = isSignIn 
            ? "Don't have an account?" 
            : 'Already have an account?';
        document.getElementById('auth-toggle').textContent = isSignIn ? 'Sign Up' : 'Sign In';
    },

    toggleMode() {
        this.setMode(this.mode === 'signin' ? 'signup' : 'signin');
    },

    async handleSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (!FirebaseManager.initialized) {
            UI.showToast('Please configure Firebase first', 'error');
            return;
        }

        try {
            if (this.mode === 'signin') {
                await FirebaseManager.signIn(email, password);
                UI.showToast('Welcome back!', 'success');
            } else {
                await FirebaseManager.signUp(email, password);
                UI.showToast('Account created successfully!', 'success');
            }
            this.hide();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },

    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const userAvatar = document.getElementById('user-avatar');
        const userInitial = document.getElementById('user-initial');

        if (AppState.currentUser) {
            loginBtn.style.display = 'none';
            userAvatar.style.display = 'flex';
            const name = AppState.currentUser.displayName || AppState.currentUser.email || 'U';
            userInitial.textContent = name.charAt(0).toUpperCase();
        } else {
            loginBtn.style.display = 'flex';
            userAvatar.style.display = 'none';
        }
    }
};

// Player Manager
const PlayerManager = {
    open(id, type = 'movie', title = '') {
        const src = `https://vidsrc.xyz/embed/${type}?tmdb=${id}`;
        document.getElementById('player-iframe').src = src;
        document.getElementById('player-title').textContent = title;
        UI.showModal('player-modal');
    },

    close() {
        UI.hideModal('player-modal');
        document.getElementById('player-iframe').src = '';
    }
};

// Export for use in other modules
window.CONFIG = CONFIG;
window.AppState = AppState;
window.TMDB = TMDB;
window.UI = UI;
window.ThemeManager = ThemeManager;
window.FirebaseManager = FirebaseManager;
window.AuthManager = AuthManager;
window.PlayerManager = PlayerManager;
