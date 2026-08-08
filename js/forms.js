/**
 * ============================================================================
 * KAWAD SWAD - Forms & Communication Engine (js/forms.js)
 * ============================================================================
 * Centralized, accessible, and asynchronous form engine providing inline validation,
 * ARIA live updates, mobile/email/pincode pattern matching, loading spinners, and
 * safe inquiry/checkout submission handling with explicit WhatsApp/email fallbacks.
 */

const FormEngine = {
    // ------------------------------------------------------------------------
    // Validation Helpers
    // ------------------------------------------------------------------------

    validateRequired(value) {
        if (value === null || value === undefined) return false;
        return String(value).trim().length > 0;
    },

    validateEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(email).trim());
    },

    validatePhone(phone) {
        if (!phone) return false;
        const cleaned = String(phone).replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
        return phoneRegex.test(cleaned);
    },

    validatePinCode(pin) {
        if (!pin) return false;
        const pinRegex = /^[1-9][0-9]{5}$/;
        return pinRegex.test(String(pin).trim());
    },

    // ------------------------------------------------------------------------
    // UI & ARIA Messaging Utilities
    // ------------------------------------------------------------------------

    showError(inputEl, message) {
        if (!inputEl) return;

        inputEl.setAttribute('aria-invalid', 'true');
        inputEl.classList.add('border-[#FE330E]', 'bg-red-50/20');
        inputEl.classList.remove('border-[#F3E6C8]', 'focus:border-[#FE330E]');

        const fieldId = inputEl.id || inputEl.name || 'field-' + Math.random().toString(36).substring(2, 9);
        if (!inputEl.id) inputEl.id = fieldId;

        let errorEl = document.getElementById(`${fieldId}-error`);
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.id = `${fieldId}-error`;
            errorEl.className = 'text-[11px] text-[#FE330E] font-medium mt-1 transition-all duration-200';
            errorEl.setAttribute('role', 'alert');
            errorEl.setAttribute('aria-live', 'polite');
            
            if (inputEl.nextSibling) {
                inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
            } else {
                inputEl.parentNode.appendChild(errorEl);
            }
        }
        errorEl.textContent = message;
        inputEl.setAttribute('aria-describedby', errorEl.id);
    },

    clearError(inputEl) {
        if (!inputEl) return;

        inputEl.removeAttribute('aria-invalid');
        inputEl.classList.remove('border-[#FE330E]', 'bg-red-50/20');
        inputEl.classList.add('border-[#F3E6C8]', 'focus:border-[#FE330E]');

        const fieldId = inputEl.id;
        if (fieldId) {
            const errorEl = document.getElementById(`${fieldId}-error`);
            if (errorEl) {
                errorEl.remove();
            }
        }
        inputEl.removeAttribute('aria-describedby');
    },

    showFallbackNotice(containerEl, title, message) {
        if (!containerEl) return;

        const box = document.createElement('div');
        box.className = 'p-6 bg-[#FFFDF7] border border-[#F3E6C8] rounded-xl text-center space-y-4 my-4 shadow-sm';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        
        const heading = document.createElement('h4');
        heading.className = 'font-serif text-xl font-bold text-[#4E342E]';
        heading.textContent = title;

        const text = document.createElement('p');
        text.className = 'text-xs text-[#5F5F5F] leading-relaxed font-light';
        text.textContent = message;

        const whatsappBtn = document.createElement('ahref');
        const waLink = document.createElement('a');
        waLink.href = 'https://wa.me/919630976867?text=Hello%20Kawad%20Swad%20Team%2C%20I%20would%20like%20to%20submit%20my%20form/order%20request.';
        waLink.target = '_blank';
        waLink.rel = 'noopener noreferrer';
        waLink.className = 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FE330E] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#d92500] transition-colors shadow-sm';
        waLink.innerHTML = `<span>Continue via WhatsApp</span>`;

        box.appendChild(heading);
        box.appendChild(text);
        box.appendChild(waLink);

        const existingStatus = containerEl.querySelector('[role="status"]');
        if (existingStatus) existingStatus.remove();

        containerEl.prepend(box);
    },

    toggleLoading(buttonEl, isLoading, defaultText = 'Submit') {
        if (!buttonEl) return;

        if (isLoading) {
            buttonEl.disabled = true;
            buttonEl.setAttribute('aria-busy', 'true');
            buttonEl.dataset.originalText = buttonEl.innerHTML;
            buttonEl.innerHTML = `
                <span class="inline-flex items-center justify-center gap-2">
                    <svg class="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                </span>
            `;
        } else {
            buttonEl.disabled = false;
            buttonEl.removeAttribute('aria-busy');
            buttonEl.innerHTML = buttonEl.dataset.originalText || defaultText;
        }
    },

    resetForm(formEl) {
        if (!formEl) return;
        formEl.reset();

        const inputs = formEl.querySelectorAll('input, select, textarea');
        inputs.forEach(input => this.clearError(input));

        const statusBox = formEl.querySelector('[role="status"]');
        if (statusBox) statusBox.remove();
    }
};

// ----------------------------------------------------------------------------
// Form Controllers & Event Bindings
// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
    initBusinessForm();
    initNewsletterForms();
    initCheckoutForm();
    initCharacterCounters();
});

function initContactForm() {
    const form = document.querySelector('form[data-form="contact"], #contact-form');
    if (!form) return;

    const nameInput = form.querySelector('#full-name, input[name="full-name"]');
    const phoneInput = form.querySelector('#mobile, input[name="mobile"]');
    const emailInput = form.querySelector('#email-address, input[name="email-address"]');
    const subjectSelect = form.querySelector('#subject, select[name="subject"]');
    const messageInput = form.querySelector('#contact-message, textarea[name="contact-message"]');

    if (nameInput) nameInput.addEventListener('blur', () => validateField(nameInput, 'required', 'Full Name is required'));
    if (phoneInput) phoneInput.addEventListener('blur', () => validateField(phoneInput, 'phone', 'Enter a valid 10-digit mobile number'));
    if (emailInput) emailInput.addEventListener('blur', () => validateField(emailInput, 'email', 'Enter a valid email address'));
    if (subjectSelect) subjectSelect.addEventListener('change', () => validateField(subjectSelect, 'required', 'Please select a subject'));
    if (messageInput) messageInput.addEventListener('blur', () => validateField(messageInput, 'required', 'Message cannot be empty'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v1 = validateField(nameInput, 'required', 'Full Name is required');
        const v2 = validateField(phoneInput, 'phone', 'Enter a valid 10-digit mobile number');
        const v3 = validateField(emailInput, 'email', 'Enter a valid email address');
        const v4 = validateField(messageInput, 'required', 'Message cannot be empty');

        if (!v1 || !v2 || !v3 || !v4) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        FormEngine.toggleLoading(submitBtn, true);

        setTimeout(() => {
            FormEngine.toggleLoading(submitBtn, false, 'Send Message');
            FormEngine.showFallbackNotice(
                form, 
                'Direct Submission Notice', 
                'Automated server endpoint is currently offline. Please click below to send your enquiry instantly via WhatsApp or email info.av.kkswad@gmail.com.'
            );
        }, 800);
    });
}

function initBusinessForm() {
    const form = document.querySelector('form[data-form="business"], #business-enquiry-form, #business-general-form');
    if (!form) return;

    const nameInput = form.querySelector('#gen-name, input[name="name"]');
    const mobileInput = form.querySelector('#gen-mobile, input[name="mobile"]');
    const emailInput = form.querySelector('#gen-email, input[name="email"]');
    const messageInput = form.querySelector('#gen-message, textarea[name="message"]');

    if (nameInput) nameInput.addEventListener('blur', () => validateField(nameInput, 'required', 'Full Name is required'));
    if (mobileInput) mobileInput.addEventListener('blur', () => validateField(mobileInput, 'phone', 'Enter a valid 10-digit mobile number'));
    if (emailInput) emailInput.addEventListener('blur', () => validateField(emailInput, 'email', 'Enter a valid email address'));
    if (messageInput) messageInput.addEventListener('blur', () => validateField(messageInput, 'required', 'Message is required'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v1 = validateField(nameInput, 'required', 'Full Name is required');
        const v2 = validateField(mobileInput, 'phone', 'Enter a valid 10-digit mobile number');
        const v3 = validateField(emailInput, 'email', 'Enter a valid email address');
        const v4 = validateField(messageInput, 'required', 'Message is required');

        if (!v1 || !v2 || !v3 || !v4) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        FormEngine.toggleLoading(submitBtn, true);

        setTimeout(() => {
            FormEngine.toggleLoading(submitBtn, false, 'Send Business Message');
            FormEngine.showFallbackNotice(
                form, 
                'Commercial Enquiry Notice', 
                'B2B endpoint pending server linkage. Connect with our corporate team instantly via WhatsApp or direct email.'
            );
        }, 800);
    });
}

function initNewsletterForms() {
    const forms = document.querySelectorAll('form[data-form="newsletter"], footer form');

    forms.forEach(form => {
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailInput) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateField(emailInput, 'email', 'Enter a valid email address')) {
                emailInput.focus();
                return;
            }
            FormEngine.showFallbackNotice(form.parentNode, 'Subscription Notice', 'Newsletter server active sync pending. Reach out directly via WhatsApp.');
            form.reset();
        });
    });
}

function initCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    const fn = form.querySelector('#first-name');
    const ln = form.querySelector('#last-name');
    const mob = form.querySelector('#checkout-mobile');
    const em = form.querySelector('#checkout-email');
    const addr = form.querySelector('#address');
    const city = form.querySelector('#checkout-city');
    const state = form.querySelector('#checkout-state');
    const pin = form.querySelector('#pincode');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const v1 = validateField(fn, 'required', 'First name required');
        const v2 = validateField(ln, 'required', 'Last name required');
        const v3 = validateField(mob, 'phone', 'Valid 10-digit mobile required');
        const v4 = validateField(em, 'email', 'Valid email required');
        const v5 = validateField(addr, 'required', 'Address required');
        const v6 = validateField(city, 'required', 'City required');
        const v7 = validateField(state, 'required', 'State required');
        const v8 = validateField(pin, 'pincode', 'Valid 6-digit PIN required');

        if (!v1 || !v2 || !v3 || !v4 || !v5 || !v6 || !v7 || !v8) {
            return;
        }

        const cartItems = typeof KawadCart !== 'undefined' ? KawadCart.getItems() : [];
        if (cartItems.length === 0) {
            alert('Your shopping cart is empty.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        FormEngine.toggleLoading(submitBtn, true, 'Submit Order Request (COD)');

        setTimeout(() => {
            FormEngine.toggleLoading(submitBtn, false, 'Submit Order Request (COD)');
            FormEngine.showFallbackNotice(
                form, 
                'Order Request Prepared (COD / Direct)', 
                'To complete your Cash on Delivery order immediately without server delay, send your summary directly to our sales desk via WhatsApp.'
            );
        }, 1000);
    });
}

function validateField(fieldEl, rule, errorMessage) {
    if (!fieldEl) return true;

    const val = fieldEl.value;
    let isValid = true;

    if (rule === 'required') {
        isValid = FormEngine.validateRequired(val);
    } else if (rule === 'email') {
        isValid = FormEngine.validateEmail(val);
    } else if (rule === 'phone') {
        isValid = FormEngine.validatePhone(val);
    } else if (rule === 'pincode') {
        isValid = FormEngine.validatePinCode(val);
    }

    if (!isValid) {
        FormEngine.showError(fieldEl, errorMessage);
    } else {
        FormEngine.clearError(fieldEl);
    }

    return isValid;
}

function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');

    textareas.forEach(textarea => {
        const max = textarea.getAttribute('maxlength') || 500;
        let counterEl = textarea.parentNode.querySelector('[data-char-counter]');

        if (!counterEl) {
            counterEl = document.createElement('div');
            counterEl.className = 'text-[10px] text-[#8B8174] text-right mt-1 font-mono';
            counterEl.dataset.charCounter = 'true';
            counterEl.dataset.max = max;
            textarea.parentNode.appendChild(counterEl);
        }

        const updateCount = () => {
            const current = textarea.value.length;
            counterEl.textContent = `${current} / ${max}`;
        };

        textarea.addEventListener('input', updateCount);
        updateCount();
    });
}
