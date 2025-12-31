/* Minimal enhancements: nav toggle, current year, and progressive-enhanced navigation */
(function () {
    const doc = document;

    // Parallax for hero background image (lightweight, only on homepage hero)
    function setupHeroParallax() {
        const hero = doc.querySelector('.hero');
        const img = hero && hero.querySelector('.hero-art img');
        if (!hero || !img) return;
        let ticking = false;
        const factor = 0.25; // move 25% of scroll
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const rect = hero.getBoundingClientRect();
                // Only animate while hero is at least partially in viewport
                const viewportH = window.innerHeight || doc.documentElement.clientHeight;
                if (rect.bottom > 0 && rect.top < viewportH) {
                    const offset = -rect.top * factor;
                    img.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
                }
                ticking = false;
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
    }

    // Current year in footer
    const yearEl = doc.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Mobile nav toggle
    const navToggle = doc.querySelector('.nav-toggle');
    const siteNav = doc.getElementById('site-nav');
    if (navToggle && siteNav) {
        const toggle = () => {
            const open = siteNav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.classList.toggle('is-open', open);
        };
        navToggle.addEventListener('click', toggle);
        // Close on outside click (desktop not needed)
        doc.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (!siteNav.classList.contains('open')) return;
            if (target.closest('#site-nav') || target.closest('.nav-toggle')) return;
            siteNav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('is-open');
        });
    }

    // Progressive-enhanced navigation: intercept internal links to .html pages
    const supportsHistory = 'pushState' in window.history && 'replaceState' in window.history;    

    const setActiveNav = (path) => {
        const links = doc.querySelectorAll('nav#site-nav a');
        links.forEach((a) => {
            const href = a.getAttribute('href') || '';
            const url = new URL(href, window.location.href);
            if (url.pathname === path) {
                a.setAttribute('aria-current', 'page');
            } else {
                a.removeAttribute('aria-current');
            }
        });
    };

    // Initialize behaviors on first load
    setupHeroParallax();

    if (supportsHistory) {
        // Initialize active state
        setActiveNav(window.location.pathname);
    }
})();

