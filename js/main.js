/**
 * ============================================================================
 * KAWAD SWAD - Main Engine (js/main.js)
 * ============================================================================
 * Refactored into logical modules:
 * 1. Validation Module
 * 2. Form Module (Payload Construction, State Flow)
 * 3. Animation Module (Scroll Reveals & Ripples)
 * 4. Utility Module (Accordions & Stat Counters)
 */

document.addEventListener('DOMContentLoaded', () => {
    ValidationModule.init();
    FormModule.init();
    AnimationModule.init();
    UtilityModule.init();
});

/* ============================================================================
 * 1. VALIDATION MODULE
 * ============================================================================ */
const ValidationModule = {
    rules: {
        isPhone(value) {
            const cleaned = value.replace(/[\s\-\+\(\)]/g, '');
            return /^[6-9]\d{9}$/.test(cleaned);
        },
        isEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        },
        isPincode(value) {
            return /^[1-9][0-9]{5}$/.test(value.trim());
        }
    },

    setFieldError(field, isError, customMsg = '') {
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
    },

    validate(form) {
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
                this.setFieldError(input, true);
                return;
            }

            if (input.type === 'email') {
                if (!this.rules.isEmail(val)) {
                    isValid = false;
                    this.setFieldError(input, true, 'Please enter a valid email address.');
                    return;
                }
            }

            if (input.type === 'tel' || input.name.includes('mobile')) {
                if (!this.rules.isPhone(val)) {
                    isValid = false;
                    this.setFieldError(input, true, 'Please enter a valid 10-digit mobile number.');
                    return;
                }
            }

            if (input.name === 'pincode') {
                if (!this.rules.isPincode(val)) {
                    isValid = false;
                    this.setFieldError(input, true, 'Please enter a valid 6-digit Indian PIN Code.');
                    return;
                }
            }

            this.setFieldError(input, false);
        });

        return isValid;
    },

    init() {
        // Event delegation for clearing error state on input
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.setFieldError(e.target, false);
            }
        });
    }
};

/* ============================================================================
 * 2. FORM MODULE (Payload Generation, Submission, & Flow)
 * ============================================================================ */
const FormModule = {
    init() {
        const contactForm = document.getElementById('contact-form');
        const businessForm = document.getElementById('business-enquiry-form');
        const checkoutForm = document.getElementById('checkout-form');

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (ValidationModule.validate(contactForm)) {
                    const payload = {
                        type: "contact",
                        fullName: contactForm.querySelector('#full-name')?.value.trim() || "",
                        mobile: contactForm.querySelector('#mobile')?.value.trim() || "",
                        email: contactForm.querySelector('#email-address')?.value.trim() || "",
                        subject: contactForm.querySelector('#subject')?.value || "",
                        message: contactForm.querySelector('#contact-message')?.value.trim() || "",
                        createdAt: new Date().toISOString(),
                        source: "website"
                    };
                    console.log("Contact Form Submission Payload:", payload);
                    this.handleSubmissionState(contactForm, 'Thank You!', 'Your contact message has been sent successfully. Our team will contact you shortly.', false);
                }
            });
        }

        if (businessForm) {
            businessForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (ValidationModule.validate(businessForm)) {
                    const payload = {
                        type: "business",
                        companyName: businessForm.querySelector('#company-name')?.value.trim() || "",
                        contactPerson: businessForm.querySelector('#contact-person')?.value.trim() || "",
                        mobile: businessForm.querySelector('#business-mobile')?.value.trim() || "",
                        email: businessForm.querySelector('#business-email')?.value.trim() || "",
                        businessType: businessForm.querySelector('#business-type')?.value || "",
                        city: businessForm.querySelector('#city')?.value.trim() || "",
                        state: businessForm.querySelector('#state')?.value.trim() || "",
                        monthlyRequirement: businessForm.querySelector('#monthly-req')?.value.trim() || "",
                        gstNumber: businessForm.querySelector('#gst-number')?.value.trim() || "",
                        website: businessForm.querySelector('#business-website')?.value.trim() || "",
                        yearsInBusiness: businessForm.querySelector('#years-in-business')?.value.trim() || "",
                        currentBrand: businessForm.querySelector('#current-brand')?.value.trim() || "",
                        message: businessForm.querySelector('#business-message')?.value.trim() || "",
                        createdAt: new Date().toISOString(),
                        source: "website"
                    };
                    console.log("Business Form Submission Payload:", payload);
                    this.handleSubmissionState(businessForm, 'Business Enquiry Received!', 'Thank you for your interest in partnering with Kawad Swad. Our commercial team will evaluate your details and respond shortly.', false);
                }
            });
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (ValidationModule.validate(checkoutForm)) {
                    const cartItems = typeof CartManager !== 'undefined' ? CartManager.getItems() : [];
                    const subtotal = typeof CartManager !== 'undefined' ? CartManager.calculateSubtotal() : 0;
                    const shipping = typeof CartManager !== 'undefined' ? CartManager.calculateShipping() : 0;
                    const total = typeof CartManager !== 'undefined' ? CartManager.calculateGrandTotal() : 0;

                    const payload = {
                        type: "order",
                        customer: {
                            firstName: checkoutForm.querySelector('#first-name')?.value.trim() || "",
                            lastName: checkoutForm.querySelector('#last-name')?.value.trim() || "",
                            mobile: checkoutForm.querySelector('#checkout-mobile')?.value.trim() || "",
                            email: checkoutForm.querySelector('#checkout-email')?.value.trim() || "",
                            address: checkoutForm.querySelector('#address')?.value.trim() || "",
                            landmark: checkoutForm.querySelector('#landmark')?.value.trim() || "",
                            city: checkoutForm.querySelector('#checkout-city')?.value.trim() || "",
                            state: checkoutForm.querySelector('#checkout-state')?.value.trim() || "",
                            pincode: checkoutForm.querySelector('#pincode')?.value.trim() || "",
                            country: checkoutForm.querySelector('#country')?.value.trim() || "India",
                            addressType: checkoutForm.querySelector('#address-type')?.value || "Home",
                            notes: checkoutForm.querySelector('#order-notes')?.value.trim() || ""
                        },
                        items: cartItems,
                        subtotal: subtotal,
                        shipping: shipping,
                        total: total,
                        createdAt: new Date().toISOString(),
                        source: "website"
                    };
                    console.log("Checkout Order Submission Payload:", payload);

                    this.handleSubmissionState(checkoutForm, 'Processing Order...', 'Redirecting to order confirmation page...', true);
                }
            });
        }
    },

    handleSubmissionState(form, successTitle, successMsg, shouldRedirect = false) {
        const submitBtn = form.querySelector('.submit-btn') || form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        setTimeout(() => {
            if (shouldRedirect) {
                if (typeof CartManager !== 'undefined') {
                    CartManager.clearCart();
                }
                window.location.href = 'order-success.html';
                return;
            }

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
};

/* ============================================================================
 * 3. ANIMATION MODULE
 * ============================================================================ */
const AnimationModule = {
    initScrollReveal() {
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
    },

    initButtonRipples() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button, a.bg-brand-dark, a.bg-brand-gold');
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
 * 4. UTILITY MODULE
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
