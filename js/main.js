/**
 * ============================================================================
 * KAWAD SWAD - Main Engine (js/main.js)
 * ============================================================================
 * Production UI engine supporting prefers-reduced-motion scroll reveal observers,
 * statistic counters, and general UI utility functions. 
 * NOTE: All form submission and validation logic has been strictly removed 
 * and consolidated into js/forms.js per P0 defect requirements.
 */

const APP_SOURCE = "website";
const SCHEMA_VERSION = 1;

document.addEventListener('DOMContentLoaded', () => {
    AnimationModule.init();
    UtilityModule.init();
});

/* ============================================================================
 * 1. ANIMATION MODULE
 * ============================================================================ */
const AnimationModule = {
    initScrollReveal() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const animatedElements = document.querySelectorAll('.slide-up, .fade-in');

        if (!animatedElements.length) return;

        if (prefersReducedMotion) {
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    },

    initButtonRipples() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button, a.bg-[#2D1F17], a.bg-[#fbec0a]');
            if (!btn) return;

            btn.classList.add('active:scale-95', 'transition-transform');
            setTimeout(() => {
                btn.classList.remove('active:scale-95');
            }, 150);
        });
    },

    init() {
        this.initScrollReveal();
        this.initButtonRipples();
    }
};

/* ============================================================================
 * 2. UTILITY MODULE
 * ============================================================================ */
const UtilityModule = {
    initAccordions() {
        const detailsElements = document.querySelectorAll('details');
        detailsElements.forEach(targetDetails => {
            if (targetDetails.dataset.accordionBound) return;
            targetDetails.dataset.accordionBound = 'true';

            targetDetails.addEventListener('toggle', () => {
                if (targetDetails.open) {
                    const parentGroup = targetDetails.closest('.space-y-4, .space-y-6');
                    if (parentGroup) {
                        parentGroup.querySelectorAll('details').forEach(sibling => {
                            if (sibling !== targetDetails && sibling.open) {
                                sibling.open = false;
                            }
                        });
                    }
                }
            });
        });
    },

    initStatCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const targetValue = parseInt(counter.getAttribute('data-counter'), 10) || 0;
                    let currentValue = 0;
                    const increment = Math.max(1, Math.ceil(targetValue / 50));

                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= targetValue) {
                            counter.textContent = targetValue;
                            clearInterval(timer);
                        } else {
                            counter.textContent = currentValue;
                        }
                    }, 30);

                    obs.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    init() {
        this.initAccordions();
        this.initStatCounters();
    }
};
