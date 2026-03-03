/**
 * ASHUTOSH RAY — PORTFOLIO  script.js
 * ---------------------------------------------------------------
 * Performance-first rewrite:
 *  - NO GSAP pin/scrub on projects (removed lag source)
 *  - CSS overflow-x scroll for projects (buttery smooth)
 *  - Lightweight RAF-based cursor, spotlight, and card tilt
 *  - GSAP only for hero & reveal animations (targeted)
 *  - Animated counters, drag scroll, dot indicators
 * ---------------------------------------------------------------
 */

window.addEventListener('DOMContentLoaded', () => {

    /* ================================================================
       REGISTER GSAP PLUGINS
       ================================================================ */
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    /* ================================================================
       LOADER  (fast: 800ms total)
       ================================================================ */
    const loader = document.getElementById('loader');
    const loaderFill = loader?.querySelector('.loader-fill');
    const body = document.body;

    body.style.overflow = 'hidden';

    if (loaderFill) {
        gsap.to(loaderFill, {
            width: '100%',
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.to(loader, {
                    yPercent: -100,
                    duration: 0.7,
                    ease: 'power4.inOut',
                    delay: 0.1,
                    onComplete: () => {
                        loader.style.display = 'none';
                        body.style.overflow = '';
                        initAll();
                    }
                });
            }
        });
    } else {
        body.style.overflow = '';
        initAll();
    }

    /* ================================================================
       MAIN INIT
       ================================================================ */
    function initAll() {
        initCursor();
        initHeroSpotlight();
        initNav();
        initHero();
        initReveal();
        initCounters();
        initSkillBars();
        initCardTilt();
        initHScroll();  // ← no more GSAP pin
        initCaseStudies();
        initProcessSection();
        initForm();
        initMobileNav();
        initTicker();
    }

    /* ================================================================
       CUSTOM CURSOR  (RAF lerp — zero GSAP overhead per frame)
       ================================================================ */
    function initCursor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const dot = document.getElementById('cursor');
        const ring = document.getElementById('cursor-follower');
        if (!dot || !ring) return;

        let mx = 0, my = 0;
        let rx = 0, ry = 0;

        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
        });

        (function raf() {
            rx += (mx - rx) * 0.13;
            ry += (my - ry) * 0.13;
            ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
            requestAnimationFrame(raf);
        })();

        document.querySelectorAll('a,button,.proj-card,.skill-card,.tool-pill,input,textarea').forEach(el => {
            el.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
        });
    }

    /* ================================================================
       HERO SPOTLIGHT  (mouse move → CSS custom prop)
       ================================================================ */
    function initHeroSpotlight() {
        const hero = document.querySelector('.hero');
        const spotlight = document.getElementById('hero-spotlight');
        if (!hero || !spotlight) return;

        hero.addEventListener('mousemove', e => {
            const r = hero.getBoundingClientRect();
            spotlight.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
            spotlight.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
        });
    }

    /* ================================================================
       STICKY NAV
       ================================================================ */
    function initNav() {
        const nav = document.getElementById('nav');

        const observer = new IntersectionObserver(
            ([entry]) => nav.classList.toggle('scrolled', !entry.isIntersecting),
            { rootMargin: '-72px 0px 0px 0px' }
        );
        const sentinel = document.querySelector('.hero');
        if (sentinel) observer.observe(sentinel);

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]:not(.mobile-link)').forEach(link => {
            link.addEventListener('click', e => {
                const target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                gsap.to(window, { scrollTo: { y: target, offsetY: 72 }, duration: 0.4, ease: 'power2.out' });
            });
        });
    }

    /* ================================================================
       HERO ANIMATIONS
       ================================================================ */
    function initHero() {
        // Reveal title lines with GSAP (CSS sets translateY(120%) by default)
        const lines = document.querySelectorAll('.title-line');

        const tl = gsap.timeline({ delay: 0.05 });

        tl.from('#hero-badge', { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' })
            .from('#hero-eyebrow', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
            .to(lines, { y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.1 }, '-=0.2')
            .from('#hero-sub', { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
            .from('#hero-cta > *', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 }, '-=0.4')
            .from('#scroll-ind', { opacity: 0, duration: 0.5 }, '-=0.2');

        // No hero parallax scrub — removed (was causing scroll jank)
    }

    /* ================================================================
       SCROLL REVEAL  — CSS transition class toggle (lightest possible)
       Section titles are excluded (CSS forces them visible already)
       ================================================================ */
    function initReveal() {
        // Add 'is-visible' class — CSS handles the transition
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -30px 0px', threshold: 0.05 });

        // Observe non-title reveals only (titles are always visible via CSS)
        document.querySelectorAll('.reveal-text:not(.section-title), .reveal-card').forEach(el => obs.observe(el));

        // Section tags slide in
        const tagObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                tagObs.unobserve(entry.target);
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.section-tag').forEach(el => tagObs.observe(el));
    }

    /* ================================================================
       ANIMATED COUNTERS  (about stat cards)
       ================================================================ */
    function initCounters() {
        const nums = document.querySelectorAll('.stat-num');
        const targets = [3, 40, 15];   // match HTML values

        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (!entry.isIntersecting) return;
                const target = targets[i] || 3;
                const el = entry.target;
                let start = 0;
                const suffix = el.textContent.replace(/[0-9]/g, '');
                const step = target / 40;

                const tick = () => {
                    start = Math.min(start + step, target);
                    el.textContent = Math.floor(start) + suffix;
                    if (start < target) requestAnimationFrame(tick);
                };
                tick();
                obs.unobserve(el);
            });
        }, { threshold: 0.5 });

        nums.forEach(el => obs.observe(el));
    }

    /* ================================================================
       SKILL BARS
       ================================================================ */
    function initSkillBars() {
        const barObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const bar = entry.target;
                gsap.to(bar, { width: bar.dataset.w + '%', duration: 1.3, ease: 'power3.out' });
                barObs.unobserve(bar);
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.skill-bar').forEach(el => barObs.observe(el));
    }

    /* ================================================================
       3D CARD TILT  (mousemove on proj cards — no lib needed)
       ================================================================ */
    function initCardTilt() {
        document.querySelectorAll('.proj-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const cx = (e.clientX - r.left) / r.width - 0.5;  // -0.5 to 0.5
                const cy = (e.clientY - r.top) / r.height - 0.5;
                const rotX = (-cy * 8).toFixed(2);
                const rotY = (cx * 8).toFixed(2);
                card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ================================================================
       HORIZONTAL SCROLL  (Pure CSS scroll — no GSAP pin)
       Progress bar + dot indicators + drag support
       ================================================================ */
    function initHScroll() {
        const outer = document.getElementById('h-scroll-outer');
        const inner = document.getElementById('h-scroll-inner');
        const fill = document.getElementById('h-scroll-fill');
        const dots = document.querySelectorAll('.proj-dot');
        const cards = document.querySelectorAll('.proj-card');

        if (!outer || !inner) return;

        const CARD_W = 400 + 28; // card width + gap

        const hint = document.querySelector('.drag-hint');

        // ── Progress bar & Hint update ──
        function updateUI() {
            const max = inner.scrollWidth - outer.clientWidth;
            const pct = max > 0 ? outer.scrollLeft / max * 100 : 0;
            if (fill) fill.style.width = pct + '%';

            // Fade out and move the drag hint based on scroll position
            if (hint) {
                const opacity = Math.max(0, 1 - (outer.scrollLeft / 150));
                const tx = Math.min(20, outer.scrollLeft * 0.2);
                hint.style.opacity = opacity;
                hint.style.transform = `translateX(${-tx}px)`;
                hint.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
            }

            // Active dot
            const idx = Math.round(outer.scrollLeft / CARD_W);
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }

        outer.addEventListener('scroll', updateUI, { passive: true });

        // ── Dot click → scroll to card ──
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                outer.scrollTo({ left: i * CARD_W, behavior: 'smooth' });
            });
        });

        // ── Wheel horizontal redirect ──
        outer.addEventListener('wheel', e => {
            // Let natural horizontal trackpad swipes pass through
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            const atStart = outer.scrollLeft <= 0;
            const atEnd = outer.scrollLeft >= inner.scrollWidth - outer.clientWidth - 2;

            // At the end scrolling down → release to page scroll
            if (atEnd && e.deltaY > 0) return;
            // At the start scrolling up → release to page scroll
            if (atStart && e.deltaY < 0) return;

            e.preventDefault();
            outer.scrollLeft += e.deltaY * 1.2;
        }, { passive: false });

        // ── Drag-to-scroll ──
        let isDragging = false;
        let startX = 0, startScrollLeft = 0;

        inner.addEventListener('pointerdown', e => {
            isDragging = true;
            startX = e.pageX - outer.offsetLeft;
            startScrollLeft = outer.scrollLeft;
            inner.setPointerCapture(e.pointerId);
            e.preventDefault();
        });

        inner.addEventListener('pointermove', e => {
            if (!isDragging) return;
            const dx = (e.pageX - outer.offsetLeft - startX) * 1.3;
            outer.scrollLeft = startScrollLeft - dx;
        });

        inner.addEventListener('pointerup', () => { isDragging = false; });
        inner.addEventListener('pointercancel', () => { isDragging = false; });

        // Reveal cards as they enter viewport (simple, no pin)
        const cardObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                gsap.fromTo(entry.target,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
                );
                cardObs.unobserve(entry.target);
            });
        }, { root: outer, rootMargin: '0px 60px', threshold: 0.15 });

        cards.forEach(c => cardObs.observe(c));

        // Initial UI
        updateUI();
    }

    /* ================================================================
       CASE STUDY MODAL
       ================================================================ */
    const caseData = {
        1: {
            title: 'Nomad — Travel Planning App',
            tag: 'Mobile App · 2024',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
            icon: '🎨',
            overview: 'Nomad is a travel planning app used by 200k+ travellers worldwide. The existing app had a high booking drop-off rate and confusing navigation. My goal was to redesign the core booking and itinerary planning flows for clarity and delight.',
            role: 'Lead UX/UI Designer — end-to-end ownership: research, information architecture, wireframes, high-fidelity design, and handoff.',
            challenges: ['72% of users abandoned the booking flow mid-way', 'Complex navigation with 6+ levels of hierarchy', 'No design system — inconsistent components across platforms', 'Low discoverability of social/collaborative features'],
            solution: 'Reduced navigation to 3 primary tabs, consolidated the booking flow to 4 clear steps, introduced a smart itinerary builder, and built a 150-component design system in Figma.',
            metrics: [{ num: '34%', label: 'Drop-off Reduction' }, { num: '4.8★', label: 'App Store Rating' }, { num: '68%', label: 'Faster Task Completion' }]
        },
        2: {
            title: 'Prism — Analytics Dashboard',
            tag: 'SaaS Dashboard · 2024',
            gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
            icon: '💼',
            overview: 'Prism is a B2B analytics SaaS platform used by data teams at Series A–C startups. The platform had grown organically with no design system, leading to inconsistency and a steep learning curve. I led the redesign and built the Prism Design System.',
            role: 'Senior UX/UI Designer — UX strategy, design system architecture, 0→1 dashboard redesign, developer collaboration.',
            challenges: ['No single source of truth — 3 separate codebases with different UI', 'Power users demanded data density; new users needed simplicity', 'Daily active usage was plateauing at 35% retention', 'Onboarding took an average of 18 minutes'],
            solution: 'Created the Prism Design System (200+ components, 8 chart types, dark/light themes). Redesigned the dashboard with a progressive disclosure pattern — simple by default, powerful when needed.',
            metrics: [{ num: '41%', label: 'Task Completion ↑' }, { num: '72%', label: 'DAU Retention ↑' }, { num: '9 min', label: 'Onboarding Time' }]
        },
        3: {
            title: 'Kreo — Fashion E-Commerce',
            tag: 'E-Commerce · 2023',
            gradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
            icon: '🛍️',
            overview: 'Kreo is a modern fashion e-commerce brand targeting 18–35 urban shoppers. The site had a 2.1% conversion rate — well below industry benchmarks. I conducted a full UX audit and led the redesign of the discovery, filtering, and checkout flows.',
            role: 'UX Designer — UX audit, competitor analysis, A/B test planning, prototyping, and design QA.',
            challenges: ['Product filtering was unusable on mobile (42% mobile traffic)', 'Checkout had 7 steps — industry average is 3–4', 'No size guide or try-on feature leading to high return rates (31%)', 'Landing pages lacked visual hierarchy and trust signals'],
            solution: 'Rebuilt filtering with a floating drawer UX, collapsed checkout to 3 logical steps, introduced a visual size guide and AR try-on teaser, and redesigned landing pages with social proof patterns.',
            metrics: [{ num: '28%', label: 'Conversion Rate ↑' }, { num: '44%', label: 'Cart Abandonment ↓' }, { num: '19%', label: 'Return Rate ↓' }]
        },
        4: {
            title: 'MediSync — Patient App',
            tag: 'HealthTech · 2023',
            gradient: 'linear-gradient(135deg, #7c2d12 0%, #b45309 100%)',
            icon: '🏥',
            overview: 'MediSync connects patients with doctors for teleconsultations, prescription tracking, and health record management. The design had to balance trust, accessibility, and simplicity across diverse user groups including senior citizens.',
            role: 'UX/UI Designer — accessibility audit, inclusive design, user testing with 50+ participants across age groups.',
            challenges: ['Users aged 55+ struggled with small touch targets and medical jargon', 'WCAG AA compliance not met across most screens', 'Appointment scheduling had a 9-step process', 'Low trust in sharing health records digitally'],
            solution: 'Ran inclusive design workshops, rebuilt appointment flow to 4 steps, increased all touch targets to 48dp minimum, simplified copy using plain language guidelines, and introduced trust badges.',
            metrics: [{ num: '96%', label: 'WCAG AA Compliance' }, { num: '4.7★', label: 'User Satisfaction' }, { num: '55%', label: 'Booking Completion ↑' }]
        },
        5: {
            title: 'Lumina — Learning Platform',
            tag: 'EdTech · 2022',
            gradient: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
            icon: '🎓',
            overview: 'Lumina is an adaptive e-learning platform for professional upskilling. With a 34% course completion rate, the platform needed a fundamental rethink of its learner experience to drive engagement and knowledge retention.',
            role: 'Product Designer — journeys, gamification design, design system, and cross-functional collaboration with content and engineering teams.',
            challenges: ['66% of learners never finished a course (industry avg: 70% drop-off)', 'No sense of community or peer learning', 'Progress was tracked with a boring percentage bar', 'Content UI was identical across all course types'],
            solution: 'Introduced a gamified learning path with XP, streak tracking, and achievement badges. Built a peer collaboration sidebar for discussion and live notes. Differentiated content UIs for video, text, and quiz.',
            metrics: [{ num: '92%', label: 'Learner Satisfaction' }, { num: '61%', label: 'Completion Rate' }, { num: '3.2×', label: 'Daily Return Rate' }]
        }
    };

    function initCaseStudies() {
        const modal = document.getElementById('case-modal');
        const content = document.getElementById('case-modal-content');
        const closeBtn = document.getElementById('case-close');
        if (!modal) return;

        document.querySelectorAll('.proj-cta').forEach(btn => {
            btn.addEventListener('click', () => {
                const d = caseData[btn.dataset.case];
                if (!d) return;

                content.innerHTML = `
          <span class="case-tag">${d.tag}</span>
          <h2>${d.title}</h2>
          <div class="case-hero" style="background:${d.gradient}">
            <span style="font-size:64px;filter:drop-shadow(0 4px 20px rgba(0,0,0,0.4))">${d.icon}</span>
          </div>
          <div class="case-section"><h3>Overview</h3><p>${d.overview}</p></div>
          <div class="case-section"><h3>My Role</h3><p>${d.role}</p></div>
          <div class="case-section"><h3>Key Challenges</h3>
            <ul>${d.challenges.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
          <div class="case-section"><h3>Solution</h3><p>${d.solution}</p></div>
          <div class="case-section"><h3>Impact</h3>
            <div class="case-metrics">
              ${d.metrics.map(m => `<div class="case-metric"><span class="m-num">${m.num}</span><span class="m-label">${m.label}</span></div>`).join('')}
            </div>
          </div>
        `;

                modal.setAttribute('aria-hidden', 'false');
                modal.classList.add('open');
                body.style.overflow = 'hidden';
            });
        });

        const closeModal = () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            body.style.overflow = '';
        };

        closeBtn?.addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
        });
    }

    /* ================================================================
       PROCESS SECTION
       ================================================================ */
    function initProcessSection() {
        const stepObs = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (!entry.isIntersecting) return;
                gsap.from(entry.target, { y: 32, opacity: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out' });
                stepObs.unobserve(entry.target);
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.process-step').forEach(el => stepObs.observe(el));
    }

    /* ================================================================
       CONTACT FORM
       ================================================================ */
    function initForm() {
        const form = document.getElementById('contact-form');
        const msgBox = document.getElementById('form-msg');
        const btn = document.getElementById('form-submit');
        if (!form) return;

        form.addEventListener('submit', e => {
            e.preventDefault();
            msgBox.className = 'form-msg';

            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const message = form.message.value.trim();

            if (!name || !email || !message) {
                msgBox.textContent = '✕ Please fill in all required fields.';
                msgBox.classList.add('error');
                gsap.to(btn, { x: [-6, 6, -4, 4, -2, 2, 0], duration: 0.45, ease: 'none' });
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                msgBox.textContent = '✕ Please enter a valid email address.';
                msgBox.classList.add('error');
                gsap.to(btn, { x: [-6, 6, -4, 4, 0], duration: 0.45, ease: 'none' });
                return;
            }

            const spanText = btn.querySelector('.btn-text');
            if (spanText) spanText.textContent = 'Sending…';
            btn.disabled = true;

            setTimeout(() => {
                form.reset();
                if (spanText) spanText.textContent = 'Send Message';
                btn.disabled = false;
                msgBox.textContent = '✓ Message received! I\'ll get back to you within 24 hours.';
                msgBox.classList.add('success');
                gsap.from(msgBox, { y: 8, opacity: 0, duration: 0.4, ease: 'power3.out' });
            }, 1400);
        });

        // Focus micro-scale
        form.querySelectorAll('input, textarea').forEach(inp => {
            inp.addEventListener('focus', () => gsap.to(inp, { scale: 1.01, duration: 0.2, ease: 'power2.out' }));
            inp.addEventListener('blur', () => gsap.to(inp, { scale: 1.00, duration: 0.2, ease: 'power2.in' }));
        });
    }

    /* ================================================================
       MOBILE NAV
       ================================================================ */
    function initMobileNav() {
        const hamburger = document.getElementById('hamburger');
        const mobileNav = document.getElementById('mobile-nav');
        const closeBtn = document.getElementById('mobile-nav-close');
        const mobileLinks = document.querySelectorAll('.mobile-link');

        const openMenu = () => { mobileNav?.classList.add('open'); body.style.overflow = 'hidden'; };
        const closeMenu = () => { mobileNav?.classList.remove('open'); body.style.overflow = ''; };

        hamburger?.addEventListener('click', openMenu);
        closeBtn?.addEventListener('click', closeMenu);
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMenu();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    setTimeout(() => {
                        gsap.to(window, { scrollTo: { y: target, offsetY: 72 }, duration: 0.4, ease: 'power2.out' });
                    }, 300);
                }
            });
        });
    }

    /* ================================================================
       TICKER — pause on hover
       ================================================================ */
    function initTicker() {
        const ticker = document.querySelector('.ticker');
        const wrap = document.querySelector('.ticker-wrap');
        if (!ticker || !wrap) return;
        wrap.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
        wrap.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
    }

}); // end DOMContentLoaded
