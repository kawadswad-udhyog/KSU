/**
 * ============================================================================
 * KAWAD SWAD - Main Communication & Validation Engine (js/main.js)
 * ============================================================================
 * Handles reusable form validation, contact/business form submissions,
 * scroll animations, and interactive controls without external dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAccordions();
    initScrollAnimations();
    initButtonRipples();
    initFormValidation();
    initStatCounters();
});

/**
 * Reusable Validator Rules
 */
const Validators = {
    isPhone(value) {
        // Strict 10-digit Indian Mobile number validation
        const cleaned = value.replace(/[\s\-\+\(\)]/g, '');
        return /^[6-9]\d{9}$/.test(cleaned);
    },
    isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    },
    isPincode(value) {
        // 6-digit Indian PIN Code
        return /^[1-9][0-9]{5}$/.test(value.trim());
    }
};

/**
 * Toggles visual error state on form elements
 */
function setFieldError(field, isError, customMsg = '') {
    const parent = field.closest('div');
    const errorSpan = parent ? parent.querySelector('.error-msg') : null;

    if (isError) {
        field.classList.add('border-brand-red');
        field.classList.remove('border-stone-300', 'focus:border-brand-gold');
        if (errorSpan) {
            if (customMsg) errorSpan.textContent = customMsg;
            errorSpan.classList.remove('hidden');
        }
    } else {
        field.classList.remove('border-brand-red');
        field.classList.add('border-stone-300', 'focus:border-brand-gold');
        if (errorSpan) {
            errorSpan.classList.add('hidden');
        }
    }
}

/**
 * Validates any given form element based on HTML rules and customs
 */
function validateForm(form) {
    let isValid = true;
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    requiredInputs.forEach(input => {
        const val = input.value.trim();

        if (input.type === 'checkbox') {
            const consentError = form.querySelector('.error-msg-consent');
            if (!input.checked) {
                isValid = false;
                if (consentError) consentError.classList.remove('hidden');
            } else if (consentError) {
                consentError.classList.add('hidden');
            }
            return;
        }

        if (!val) {
            isValid = false;
            setFieldError(input, true);
            return;
        }

        if (input.type === 'email') {
            if (!Validators.isEmail(val)) {
                isValid = false;
                setFieldError(input, true, 'Please enter a valid email address.');
                return;
            }
        }

        if (input.type === 'tel' || input.name.includes('mobile')) {
            if (!Validators.isPhone(val)) {
                isValid = false;
                setFieldError(input, true, 'Please enter a valid 10-digit mobile number.');
                return;
            }
        }

        if (input.name === 'pincode') {
            if (!Validators.isPincode(val)) {
                isValid = false;
                setFieldError(input, true, 'Please enter a valid 6-digit PIN Code.');
                return;
            }
        }

        setFieldError(input, false);
    });

    return isValid;
}

/**
 * Connects forms across Contact, Business, and Checkout pages
 */
function initFormValidation() {
    const contactForm = document.getElementById('contact-form');
    const businessForm = document.getElementById('business-enquiry-form');
    const checkoutForm = document.getElementById('checkout-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(contactForm)) {
                handleFormSubmitState(contactForm, 'Thank You!', 'Your contact message has been sent successfully. Our team will contact you shortly.');
            }
        });
    }

    if (businessForm) {
        businessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(businessForm)) {
                handleFormSubmitState(businessForm, 'Business Enquiry Received!', 'Thank you for your interest in partnering with Kawad Swad. Our commercial team will evaluate your details and respond shortly.');
            }
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(checkoutForm)) {
                if (typeof CartManager !== 'undefined') {
                    CartManager.clearCart();
                }
                window.location.href = 'order-success.html';
            }
        });
    }
}

/**
 * Handles loading spinner state and success banner rendering
 */
function handleFormSubmitState(form, successTitle, successMsg) {
    const submitBtn = form.querySelector('.submit-btn') || form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
    }

    setTimeout(() => {
        const successBox = document.createElement('div');
        successBox.className = 'p-8 bg-brand-cream border border-brand-gold/40 rounded-sm text-center space-y-4 fade-in';
        successBox.innerHTML = `
            <div class="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <h3 class="font-serif text-2xl font-bold text-brand-dark">${successTitle}</h3>
            <p class="text-sm text-brand-muted max-w-md mx-auto leading-relaxed">${successMsg}</p>
        `;

        form.innerHTML = '';
        form.appendChild(successBox);
    }, 600);
}

/**
 * Handles accordions single-open state
 */
function initAccordions() {
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
}

/**
 * Intersection Observer scroll animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.slide-up, .fade-in');
    if (!animatedElements.length) return;

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
}

/**
 * Button click ripple feedback
 */
function initButtonRipples() {
    if (document.dataset.rippleBound) return;
    document.dataset.rippleBound = 'true';

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
 * Counter animation for statistics
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
}
