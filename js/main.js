/**
 * ============================================================================
 * KAWAD SWAD - Main UI & Interactivity Engine (main.js)
 * ============================================================================
 * Handles UI interactions including FAQ accordions, Intersection Observer fade-ins,
 * lightweight button ripple feedback, form validation, and numeric counters.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAccordions();
    initScrollAnimations();
    initButtonRipples();
    initFormValidation();
    initStatCounters();
});

/**
 * Handles smooth single-open behaviors for accordions and details HTML tags.
 */
function initAccordions() {
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(targetDetails => {
        targetTargetDetails = targetDetails;
        targetDetails.addEventListener('toggle', () => {
            if (targetDetails.open) {
                // Optionally auto-close sibling accordions within the same container
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
}

/**
 * Scroll reveal engine using IntersectionObserver for elements tagged with .slide-up or .fade-in.
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.slide-up, .fade-in');
    if (!animatedElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}

/**
 * Attaches a lightweight visual click feedback animation to buttons.
 */
function initButtonRipples() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a.bg-brand-dark, a.bg-brand-gold');
        if (!btn) return;

        btn.classList.add('active:scale-95', 'transition-transform');
        setTimeout(() => {
            btn.classList.remove('active:scale-95');
        }, 150);
    });
}

/**
 * Universal frontend form validation for contact, business, and newsletter submissions.
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');

            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    highlightInputError(input, true);
                } else {
                    highlightInputError(input, false);
                }

                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value.trim())) {
                        isValid = false;
                        highlightInputError(input, true);
                    }
                }
            });

            if (isValid) {
                showFormSuccessMessage(form);
            }
        });
    });
}

/**
 * Toggles input border states for validation feedback.
 */
function highlightInputError(input, isError) {
    if (isError) {
        input.classList.add('border-brand-red');
        input.classList.remove('border-stone-300', 'focus:border-brand-gold');
    } else {
        input.classList.remove('border-brand-red');
        input.classList.add('border-stone-300', 'focus:border-brand-gold');
    }
}

/**
 * Generates an in-place success toast banner for valid form submissions.
 */
function showFormSuccessMessage(form) {
    const originalContent = form.innerHTML;
    const successBox = document.createElement('div');
    successBox.className = 'p-6 bg-brand-cream border border-brand-gold/40 rounded-sm text-center space-y-3 fade-in';
    successBox.innerHTML = `
        <div class="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
        </div>
        <h4 class="font-serif text-xl font-bold text-brand-dark">Thank You!</h4>
        <p class="text-xs text-brand-muted">Your enquiry has been received successfully. Our team will contact you shortly.</p>
        <button type="button" class="reset-btn text-xs font-semibold uppercase tracking-wider text-brand-gold underline pt-2">Send Another Message</button>
    `;

    form.innerHTML = '';
    form.appendChild(successBox);

    const resetBtn = successBox.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.innerHTML = originalContent;
            initFormValidation();
        });
    }
}

/**
 * Animates statistical number elements when scrolled into view.
 */
function initStatCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const targetValue = parseInt(counter.getAttribute('data-counter'), 10) || 0;
                let currentValue = 0;
                const increment = Math.ceil(targetValue / 50);

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
}
