(function () {
    const doc = document;

    async function loadHTML(id, file, callback) {
        const res = await fetch(file);
        const text = await res.text();
        document.getElementById(id).innerHTML = text;
        if (callback) callback();
    }

    loadHTML("header", "partials/header.html", setupMenu);
    loadHTML("footer", "partials/footer.html", showRandomQuote);

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
                const viewportH = window.innerHeight || doc.documentElement.clientHeight;
                if (rect.bottom > 0 && rect.top < viewportH) {
                    const offset = -rect.top * factor;
                    img.style.transform = "translateY(" + offset.toFixed(1) + "px)";
                }
                ticking = false;
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
    }

    function updateFooterCurrentYear() {
        const yearEl = doc.getElementById("year");
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    }

    updateFooterCurrentYear();

    function initMobileToggleNavigation() {
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

        doc.addEventListener("click", (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (!siteNav.classList.contains("open")) return;
            if (target.closest("#site-nav") || target.closest(".nav-toggle")) return;
            siteNav.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.classList.remove("is-open");
        });
    }

    function applySeasonalEffect() {
        const pageHero = doc.querySelector(".page-hero");
        if (!pageHero) return;

        const month = new Date().getMonth();
        // Winter: November (10), December (11), January (0), February (1)
        const isWinter = month === 10 || month === 11 || month === 0 || month === 1;

        if (isWinter) {
            pageHero.classList.add("season-winter");
            pageHero.classList.remove("season-other");
        } else {
            pageHero.classList.add("season-other");
            pageHero.classList.remove("season-winter");
        }
    }

    applySeasonalEffect();

    setupHeroParallax();

    function highlightCurrentPage() {
        let currentPage = location.pathname.split("/").pop();

        if (currentPage === "") {
            currentPage = "index.html";
        }

        document.querySelectorAll("nav a").forEach((link) => {
            const linkPage = link.getAttribute("href").split("/").pop();

            if (linkPage === currentPage) {
                link.classList.add("active");
            }
        });
    }

    function setupMenu() {
        initMobileToggleNavigation();
        highlightCurrentPage();
        hideStarredItems();
    }

    const quotes = [
        { text: "Una lingua diversa è una diversa visione della vita.", author: "Federico Fellini" },
        { text: "La cultura è organizzazione, disciplina del proprio io.", author: "Antonio Gramsci" },
        { text: "Istruitevi, perché avremo bisogno di tutta la vostra intelligenza.", author: "Antonio Gramsci" },
        { text: "La scuola è il nostro passaporto per il futuro.", author: "Don Lorenzo Milani" },
        { text: "Sortirne tutti insieme è politica, sortirne da soli è avarizia.", author: "Don Lorenzo Milani" },
        { text: "La lingua è il più potente strumento di cultura.", author: "Tullio De Mauro" },
        { text: "La cultura rende liberi.", author: "Tullio De Mauro" },
        { text: "Ogni parola ha un volto e una storia.", author: "Italo Calvino" },
        { text: "Prendete la vita con leggerezza.", author: "Italo Calvino" },
        { text: "La fantasia è un posto dove ci piove dentro.", author: "Italo Calvino" },
        { text: "Le parole sono tutto quello che abbiamo.", author: "Andrea Camilleri" },
        { text: "Un classico è un libro che non ha mai finito di dire quel che ha da dire.", author: "Italo Calvino" },
        { text: "La lingua è la chiave del cuore di un popolo.", author: "Giuseppe Ungaretti" },
    ];

    function showRandomQuote() {
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById("quote-footer-content").innerHTML = `"${q.text}" — <em>${q.author}</em>`;
    }

    function hideStarredItems() {
        const today = new Date();
        const month = today.getMonth();
        const day = today.getDate();

        // Check if today is between March 1 and April 30
        const isBetween =
            (month === 2 && day >= 1) || // March (month=2)
            (month === 3 && day <= 30); // April (month=3)

        if (!isBetween) {
            document.querySelectorAll(".starred").forEach((el) => {
                el.style.display = "none";
            });
        }
    }

    hideStarredItems();
})();
