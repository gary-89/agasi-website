(function () {
    const doc = document;

    // Client-side includes (fetch and inject partials)
    async function loadClientIncludes() {
        const includeNodes = Array.from(doc.querySelectorAll("[data-include]"));
        if (includeNodes.length === 0) return false;
        await Promise.all(
            includeNodes.map(async (el) => {
                const url = el.getAttribute("data-include");
                if (!url) return;
                try {
                    const res = await fetch(url, {
                        headers: { "X-Requested-With": "fetch" },
                    });
                    if (!res.ok) return;
                    const html = await res.text();
                    const tpl = doc.createElement("template");
                    tpl.innerHTML = html.trim();
                    el.replaceWith(tpl.content.cloneNode(true));
                } catch {}
            })
        );
        return true;
    }

    // Parallax for hero background image (lightweight, only on homepage hero)
    function setupHeroParallax() {
        const hero = doc.querySelector(".hero");
        const img = hero && hero.querySelector(".hero-art img");
        if (!hero || !img) return;
        let ticking = false;
        const factor = 0.25; // move 25% of scroll
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const rect = hero.getBoundingClientRect();
                // Only animate while hero is at least partially in viewport
                const viewportH =
                    window.innerHeight || doc.documentElement.clientHeight;
                if (rect.bottom > 0 && rect.top < viewportH) {
                    const offset = -rect.top * factor;
                    img.style.transform =
                        "translateY(" + offset.toFixed(1) + "px)";
                }
                ticking = false;
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
    }

    // Current year in footer
    function updateYear() {
        const yearEl = doc.getElementById("year");
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    }
    updateYear();

    // Mobile nav toggle
    function initNavToggle() {
        const navToggle = doc.querySelector(".nav-toggle");
        const siteNav = doc.getElementById("site-nav");
        if (!(navToggle && siteNav)) return;
        if (navToggle.dataset.bound === "1") return;
        navToggle.dataset.bound = "1";
        const toggle = () => {
            const open = siteNav.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(open));
            navToggle.classList.toggle("is-open", open);
        };
        navToggle.addEventListener("click", toggle);
        // Close on outside click (desktop not needed)
        doc.addEventListener("click", (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (!siteNav.classList.contains("open")) return;
            if (target.closest("#site-nav") || target.closest(".nav-toggle"))
                return;
            siteNav.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.classList.remove("is-open");
        });
    }
    initNavToggle();

    // Progressive-enhanced navigation: intercept internal links to .html pages
    const supportsHistory =
        "pushState" in window.history && "replaceState" in window.history;

    const setActiveNav = (path) => {
        const links = doc.querySelectorAll("nav#site-nav a");
        links.forEach((a) => {
            const href = a.getAttribute("href") || "";
            const url = new URL(href, window.location.href);
            if (url.pathname === path) {
                a.setAttribute("aria-current", "page");
            } else {
                a.removeAttribute("aria-current");
            }
        });
    };

    // Apply seasonal effect to page-hero
    function applySeasonalEffect() {
        const pageHero = doc.querySelector(".page-hero");
        if (!pageHero) return;

        const month = new Date().getMonth();
        // Winter: November (10), December (11), January (0), February (1)
        const isWinter =
            month === 10 || month === 11 || month === 0 || month === 1;

        if (isWinter) {
            pageHero.classList.add("season-winter");
            pageHero.classList.remove("season-other");
        } else {
            pageHero.classList.add("season-other");
            pageHero.classList.remove("season-winter");
        }
    }
    applySeasonalEffect();

    // Initialize behaviors on first load
    setupHeroParallax();

    // Load includes, then re-init bits that depend on them
    loadClientIncludes().then((loaded) => {
        if (!loaded) return;
        updateYear();
        initNavToggle();
        setActiveNav(window.location.pathname);
    });

    if (supportsHistory) {
        // Initialize active state
        setActiveNav(window.location.pathname);
    }
})();
