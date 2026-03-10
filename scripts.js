(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
class GallerySlider {
    constructor(viewport, options) {
        this.viewport = viewport;
        this.track = viewport.querySelector(".gallery__track");
        this.prevBtn = viewport.querySelector(".gallery__btn--prev");
        this.nextBtn = viewport.querySelector(".gallery__btn--next");
        this.dotsWrap = viewport.querySelector(".gallery__dots");

        this.folder = options.folder;
        this.total = options.total;
        this.intervalMs = options.intervalMs;
        this.startDelayMs = options.startDelayMs || 0;
        this.startAt = options.startAt || 0;

        this.index = 0;
        this.timer = null;
        this.startDelayTimer = null;
        this.isPaused = false;

        this.slides = [];
        this.dots = [];

        this._buildSlides();
        this._buildDots();
        this._bindEvents();
        this.goTo(this.startAt);
        this._startWithDelay();
    }

    _buildSlides() {
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= this.total; i++) {
            const img = document.createElement("img");
            img.className = "gallery__slide";
            img.src = `${this.folder}${i}.jpg`;
            img.alt = `Галерея — фото ${i}`;
            fragment.appendChild(img);
        }

        this.track.appendChild(fragment);
        this.slides = Array.from(this.track.querySelectorAll(".gallery__slide"));
    }

    _buildDots() {
        if (!this.dotsWrap) return;

        this.dotsWrap.innerHTML = "";

        this.dots = this.slides.map((_, i) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "gallery__dot" + (i === 0 ? " is-active" : "");
            dot.setAttribute("aria-label", `Перейти к слайду ${i + 1}`);
            dot.addEventListener("click", () => {
                this.goTo(i);
                this.restart();
            });
            this.dotsWrap.appendChild(dot);
            return dot;
        });
    }

    _bindEvents() {
        this.prevBtn?.addEventListener("click", () => {
            this.prev();
            this.restart();
        });

        this.nextBtn?.addEventListener("click", () => {
            this.next();
            this.restart();
        });

        this.viewport.addEventListener("mouseenter", () => { this.isPaused = true; });
        this.viewport.addEventListener("mouseleave", () => { this.isPaused = false; });

        this.viewport.addEventListener("focusin", () => { this.isPaused = true; });
        this.viewport.addEventListener("focusout", () => { this.isPaused = false; });

        this.viewport.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") { this.next(); this.restart(); }
            if (e.key === "ArrowLeft") { this.prev(); this.restart(); }
        });
    }

    _update() {
        this.track.style.transform = `translateX(${-this.index * 100}%)`;
        this.dots.forEach((d, i) => d.classList.toggle("is-active", i === this.index));
    }

    goTo(i) {
        const len = this.slides.length;
        if (!len) return;
        this.index = (i + len) % len;
        this._update();
    }

    next() { this.goTo(this.index + 1); }
    prev() { this.goTo(this.index - 1); }

    start() {
        this.stop();
        if (!this.slides.length || this.intervalMs <= 0) return;
        this.timer = setInterval(() => {
            if (!this.isPaused) this.next();
        }, this.intervalMs);
    }

    _startWithDelay() {
        if (!this.startDelayMs) {
            this.start();
            return;
        }

        this.stop();
        this.startDelayTimer = setTimeout(() => {
            this.startDelayTimer = null;
            this.start();
        }, this.startDelayMs);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        if (this.startDelayTimer) clearTimeout(this.startDelayTimer);
        this.startDelayTimer = null;
    }

    restart() {
        this.start();
    }
}

(() => {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    const viewports = document.querySelectorAll(".gallery__viewport");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    viewports.forEach((vp, idx) => {
        const folderKey = vp.getAttribute("data-gallery") || "g1";
        const total = Number(vp.getAttribute("data-total") || "29");
        const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0;

        const intervalMs = reduceMotion ? 0 : 2600 + idx * 420;
        const startDelayMs = reduceMotion ? 0 : idx * 680;
        const startAt = safeTotal > 0 ? (idx * 2) % safeTotal : 0;

        new GallerySlider(vp, {
            folder: `image/${folderKey}/`,
            total: safeTotal,
            intervalMs,
            startDelayMs,
            startAt
        });
    });
})();


(() => {
    const items = document.querySelectorAll(".panel--section, .teach__card, .exp__card, .awards__card, .pd__card, .projects__card, .project");
    items.forEach(el => el.classList.add("reveal"));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting && e.target.classList.add("is-visible"));
    }, { threshold: 0.12 });

    items.forEach(el => io.observe(el));
})();

(() => {
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    if (!navLinks.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const getOffset = () => {
        const header = document.querySelector(".site-header");
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        return Math.ceil(headerHeight + 10);
    };

    const scrollToSection = (hash, updateUrl = true) => {
        if (!hash || hash === "#") return;

        const target = document.querySelector(hash);
        if (!target) return;

        const y = target.getBoundingClientRect().top + window.scrollY - getOffset();
        window.scrollTo({
            top: Math.max(0, y),
            behavior: reduceMotion.matches ? "auto" : "smooth"
        });

        if (updateUrl) {
            history.pushState(null, "", hash);
        }
    };

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const hash = link.getAttribute("href");
            if (!hash || !hash.startsWith("#")) return;

            e.preventDefault();
            scrollToSection(hash, true);
        });
    });
})();

(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const root = document.documentElement;
    let ticking = false;

    const getScrollProgress = () => {
        const y = window.scrollY || window.pageYOffset;
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        return Math.min(1, Math.max(0, y / maxScroll));
    };

    const updateParallax = () => {
        const progress = getScrollProgress();
        const eased = progress * (2 - progress);
        const shift1 = eased * 56;
        const shift2 = -eased * 42;

        root.style.setProperty("--parallax-shift-1", `${shift1.toFixed(2)}px`);
        root.style.setProperty("--parallax-shift-2", `${shift2.toFixed(2)}px`);
        ticking = false;
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateParallax);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", onScroll, { passive: true });
})();
