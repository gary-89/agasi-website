/* Minimal enhancements: nav toggle, current year, and progressive-enhanced navigation */
(function () {
    const doc = document;

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
    const isInternalLink = (anchor) => {
        try {
            const url = new URL(anchor.href, window.location.href);
            return url.origin === window.location.origin && /\.html?$/.test(url.pathname);
        } catch {
            return false;
        }
    };

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

    const swapContent = (htmlText) => {
        const parser = new DOMParser();
        const nextDoc = parser.parseFromString(htmlText, 'text/html');
        const nextMain = nextDoc.querySelector('main#content');
        const currentMain = doc.querySelector('main#content');
        const nextTitle = nextDoc.querySelector('title');
        if (nextTitle) doc.title = nextTitle.textContent || doc.title;
        if (currentMain && nextMain) {
            // Replace content
            currentMain.innerHTML = nextMain.innerHTML;
            // Focus main for a11y
            currentMain.focus({ preventScroll: false });
        } else {
            // Fallback: full reload if structure missing
            return false;
        }
        return true;
    };

    const navigate = async (url, replace) => {
        // Close mobile nav if open
        if (siteNav && siteNav.classList.contains('open')) {
            siteNav.classList.remove('open');
            navToggle && navToggle.setAttribute('aria-expanded', 'false');
            navToggle && navToggle.classList.remove('is-open');
        }
        try {
            const res = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } });
            if (!res.ok) throw new Error('Failed to fetch');
            const htmlText = await res.text();
            const ok = swapContent(htmlText);
            if (!ok) return (window.location.href = url);
            const urlObj = new URL(url, window.location.href);
            if (supportsHistory) {
                if (replace) window.history.replaceState({}, '', urlObj.pathname);
                else window.history.pushState({}, '', urlObj.pathname);
            }
            setActiveNav(urlObj.pathname);
        } catch {
            window.location.href = url;
        }
    };

    if (supportsHistory) {
        // Intercept clicks
        doc.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            const anchor = target.closest('a');
            if (!anchor) return;
            if (anchor.target && anchor.target !== '_self') return;
            if (!isInternalLink(anchor)) return;
            const url = anchor.getAttribute('href');
            if (!url) return;
            e.preventDefault();
            navigate(url, false);
        });
        // Handle back/forward
        window.addEventListener('popstate', () => {
            navigate(window.location.pathname, true);
        });
        // Initialize active state
        setActiveNav(window.location.pathname);
    }
})();

