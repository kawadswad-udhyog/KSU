/**
 * ============================================================================
 * KAWAD SWAD - Forms & Communication System (js/forms.js)
 * ============================================================================
 * Centralized, accessible, and asynchronous form engine providing inline validation,
 * ARIA live updates, mobile/email/pincode pattern matching, loading spinners, and
 * mock API submission endpoints ready for future backend integration.
 */

const FormEngine = {
    // ------------------------------------------------------------------------
    // Validation Helpers
    // ------------------------------------------------------------------------

    /**
     * Checks if value is non-empty after trimming
     */
    validateRequired(value) {
        return value !== null && value !== undefined && value.trim().length > 0;
    },

    /**
     * Validates standard email address format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    /**
     * Validates Indian mobile number format (10 digits starting with 6-9, optional +91 or 0 prefix)
     */
    validatePhone(phone) {
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
        return phoneRegex.test(cleaned);
    },

    /**
     * Validates Indian 6-digit PIN code format
     */
    validatePinCode(pin) {
        const pinRegex = /^[1-9][0-9]{5}$/;
        return pinRegex.test(pin.trim());
    },

    // ------------------------------------------------------------------------
    // UI & ARIA Messaging Utilities
    // ------------------------------------------------------------------------

    /**
     * Renders inline accessibility-compliant error message for a field
     */
    showError(inputEl, message) {
        if (!inputEl) return;

        inputEl.setAttribute('aria-invalid', 'true');
        inputEl.classList.add('border-brand-red', 'bg-red-50/20');
        inputEl.classList.remove('border-stone-300', 'focus:border-brand-gold');

        let errorEl = document.getElementById(`${inputEl.id}-error`);
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.id = `${inputEl.id}-error`;
            errorEl.className = 'text-[11px] text-brand-red font-medium mt-1 transition-all duration-200';
            errorEl.setAttribute('role', 'alert');
            inputEl.parentNode.appendChild(errorEl);
        }
        errorEl.textContent = message;
        inputEl.setAttribute('aria-describedby', errorEl.id);
    },

    /**
     * Clears error state and removes aria-invalid from input field
     */
    clearError(inputEl) {
        if (!inputEl) return;

        inputEl.removeAttribute('aria-invalid');
        inputEl.classList.remove('border-brand-red', 'bg-red-50/20');
        inputEl.classList.add('border-stone-300', 'focus:border-brand-gold');

        const errorEl = document.getElementById(`${inputEl.id}-error`);
        if (errorEl) {
            errorEl.remove();
        }
        inputEl.removeAttribute('aria-describedby');
    },

    /**
     * Displays a dismissible or auto-clearing toast/alert container
     */
    showSuccess(containerEl, title, message) {
        if (!containerEl) return;

        const successBox = document.createElement('div');
        successBox.className = 'p-6 bg-brand-cream border border-brand-gold/40 rounded-sm text-center space-y-3 fade-in my-4';
        successBox.setAttribute('role', 'status');
        successBox.setAttribute('aria-live', 'polite');
        successBox.innerHTML = `
            <div class="w-12 h-12 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </div>
            <h4 class="font-serif text-xl font-bold text-brand-dark">${title}</h4>
            <p class="text-xs text-brand-muted leading-relaxed font-light">${message}</p>
        `;

        const existingStatus = containerEl.querySelector('[role="status"]');
        if (existingStatus) existingStatus.remove();

        containerEl.prepend(successBox);
    },

    /**
     * Toggles submit button state with a loading spinner and aria-busy state
     */
    toggleLoading(buttonEl, isLoading, defaultText = 'Submit') {
        if (!buttonEl) return;

        if (isLoading) {
            buttonEl.disabled = true;
            buttonEl.setAttribute('aria-busy', 'true');
            buttonEl.dataset.originalText = buttonEl.innerHTML;
            buttonEl.innerHTML = `
                <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </span>
            `;
        } else {
            buttonEl.disabled = false;
            buttonEl.removeAttribute('aria-busy');
            buttonEl.innerHTML = buttonEl.dataset.originalText || defaultText;
        }
    },

    /**
     * Resets input fields and clears error states
     */
    resetForm(formEl) {
        if (!formEl) return;
        formEl.reset();
        const inputs = formEl.querySelectorAll('input, select, textarea');
        inputs.forEach(input => this.clearError(input));

        // Reset character counter if present
        const counterEl = formEl.querySelector('[data-char-counter]');
        if (counterEl) {
            const max = counterEl.dataset.max || 500;
            counterEl.textContent = `0 / ${max}`;
        }
    },

    // ------------------------------------------------------------------------
    // Future-Ready Mock API Endpoints
    // ------------------------------------------------------------------------

    async submitContact(payload) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, message: 'Your message has been received. Our team will contact you shortly.' };
    },

    async submitBusiness(payload) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Thank you for your business enquiry. Our corporate team will reach out within 24 hours.' };
    },

    async submitNewsletter(email) {
        await new Promise(resolve => setTimeout(resolve, 600));
        return { success: true, message: 'You have been successfully subscribed to KAWAD SWAD updates.' };
    },

    async submitCheckout(payload) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return { success: true, orderId: 'KS-' + Date.now().toString().slice(-6), message: 'Order validated successfully.' };
    }
};

// ----------------------------------------------------------------------------
// Form Controllers & Event Bindings
// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
    initBusinessForm();
    initNewsletterForms();
    initCheckoutValidation();
    initCharacterCounters();
});

/**
 * Handles Form 1: Contact Form Validation & Submission
 */
function initContactForm() {
    const form = document.querySelector('form[data-form="contact"]');
    if (!form) return;

    const nameInput = form.querySelector('#full-name, input[name="full-name"]');
    const phoneInput = form.querySelector('#mobile, input[name="mobile"]');
    const emailInput = form.querySelector('#email-address, input[name="email-address"]');
    const subjectSelect = form.querySelector('#subject, select[name="subject"]');
    const messageInput = form.querySelector('#contact-message, textarea[name="contact-message"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Inline blur listeners
    if (nameInput) nameInput.addEventListener('blur', () => validateField(nameInput, 'required', 'Full Name is required'));
    if (phoneInput) phoneInput.addEventListener('blur', () => validateField(phoneInput, 'phone', 'Enter a valid 10-digit mobile number'));
    if (emailInput) emailInput.addEventListener('blur', () => validateField(emailInput, 'email', 'Enter a valid email address'));
    if (subjectSelect) subjectSelect.addEventListener('change', () => validateField(subjectSelect, 'required', 'Please select a subject'));
    if (messageInput) messageInput.addEventListener('blur', () => validateField(messageInput, 'required', 'Message cannot be empty'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isNameValid = validateField(nameInput, 'required', 'Full Name is required');
        const isPhoneValid = validateField(phoneInput, 'phone', 'Enter a valid 10-digit mobile number');
        const isEmailValid = validateField(emailInput, 'email', 'Enter a valid email address');
        const isSubjectValid = validateField(subjectSelect, 'required', 'Please select a subject');
        const isMessageValid = validateField(messageInput, 'required', 'Message cannot be empty');

        if (!isNameValid || !isPhoneValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
            focusFirstError(form);
            return;
        }

        FormEngine.toggleLoading(submitBtn, true);

        try {
            const payload = {
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectSelect.value,
                message: messageInput.value.trim()
            };

            const response = await FormEngine.submitContact(payload);
            if (response.success) {
                FormEngine.showSuccess(form, 'Message Sent!', response.message);
                FormEngine.resetForm(form);
            }
        } catch (err) {
            FormEngine.showError(messageInput, 'Failed to submit. Please try again later.');
        } finally {
            FormEngine.toggleLoading(submitBtn, false, 'Submit Message');
        }
    });
}

/**
 * Handles Form 2: Business Enquiry Validation & Submission
 */
function initBusinessForm() {
    const form = document.querySelector('form[data-form="business"], #enquiry-form form');
    if (!form) return;

    const bizType = form.querySelector('#business-type, select[name="business-type"]');
    const bizName = form.querySelector('#business-name, input[name="business-name"]');
    const contactPerson = form.querySelector('#contact-person, input[name="contact-person"]');
    const mobile = form.querySelector('#mobile-number, input[name="mobile-number"]');
    const email = form.querySelector('#email, input[name="email"]');
    const city = form.querySelector('#city, input[name="city"]');
    const state = form.querySelector('#state, input[name="state"]');
    const message = form.querySelector('#message, textarea[name="message"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const vType = validateField(bizType, 'required', 'Please select a Business Type');
        const vName = validateField(bizName, 'required', 'Business Name is required');
        const vContact = validateField(contactPerson, 'required', 'Contact Person Name is required');
        const vMobile = validateField(mobile, 'phone', 'Enter a valid 10-digit mobile number');
        const vEmail = validateField(email, 'email', 'Enter a valid email address');
        const vCity = validateField(city, 'required', 'City is required');
        const vState = validateField(state, 'required', 'State is required');

        if (!vType || !vName || !vContact || !vMobile || !vEmail || !vCity || !vState) {
            focusFirstError(form);
            return;
        }

        FormEngine.toggleLoading(submitBtn, true);

        try {
            const payload = {
                type: bizType.value,
                businessName: bizName.value.trim(),
                contactPerson: contactPerson.value.trim(),
                mobile: mobile.value.trim(),
                email: email.value.trim(),
                city: city.value.trim(),
                state: state.value.trim(),
                message: message ? message.value.trim() : ''
            };

            const response = await FormEngine.submitBusiness(payload);
            if (response.success) {
                FormEngine.showSuccess(form, 'Enquiry Submitted!', response.message);
                FormEngine.resetForm(form);
            }
        } catch (err) {
            FormEngine.showError(submitBtn, 'Submission failed. Please try again.');
        } finally {
            FormEngine.toggleLoading(submitBtn, false, 'Submit Enquiry');
        }
    });
}

/**
 * Handles Form 3: Newsletter Form Validation across page sections
 */
function initNewsletterForms() {
    const forms = document.querySelectorAll('form[data-form="newsletter"], footer form');

    forms.forEach(form => {
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateField(emailInput, 'email', 'Enter a valid email address')) {
                if (emailInput) emailInput.focus();
                return;
            }

            FormEngine.toggleLoading(submitBtn, true);

            try {
                const response = await FormEngine.submitNewsletter(emailInput.value.trim());
                if (response.success) {
                    FormEngine.showSuccess(form.parentNode, 'Subscribed!', response.message);
                    form.reset();
                }
            } catch (err) {
                FormEngine.showError(emailInput, 'Subscription failed.');
            } finally {
                FormEngine.toggleLoading(submitBtn, false, 'Subscribe');
            }
        });
    });
}

/**
 * Handles Form 4: Checkout Customer Information Validation
 */
function initCheckoutValidation() {
    const form = document.querySelector('form[data-form="checkout"], main form.grid');
    if (!form) return;

    const firstName = form.querySelector('input[placeholder="First Name"]');
    const lastName = form.querySelector('input[placeholder="Last Name"]');
    const email = form.querySelector('input[placeholder="Email Address"]');
    const mobile = form.querySelector('input[placeholder="Mobile Number"]');
    const address = form.querySelector('input[placeholder*="street"], input[placeholder*="House"]');
    const city = form.querySelector('input[placeholder="City"]');
    const state = form.querySelector('input[placeholder="State"]');
    const pin = form.querySelector('input[placeholder="PIN Code"]');
    const submitBtn = form.querySelector('a[href="order-success.html"], button[type="submit"]');

    const validateAll = () => {
        const vFn = validateField(firstName, 'required', 'First Name is required');
        const vLn = validateField(lastName, 'required', 'Last Name is required');
        const vEm = validateField(email, 'email', 'Enter a valid email address');
        const vMb = validateField(mobile, 'phone', 'Enter a valid 10-digit mobile number');
        const vAd = validateField(address, 'required', 'Street address is required');
        const vCt = validateField(city, 'required', 'City is required');
        const vSt = validateField(state, 'required', 'State is required');
        const vPn = validateField(pin, 'pincode', 'Enter a valid 6-digit PIN code');

        return vFn && vLn && vEm && vMb && vAd && vCt && vSt && vPn;
    };

    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            if (!validateAll()) {
                e.preventDefault();
                focusFirstError(form);
            } else if (submitBtn.tagName === 'BUTTON') {
                e.preventDefault();
                FormEngine.toggleLoading(submitBtn, true);
                const response = await FormEngine.submitCheckout({});
                if (response.success) {
                    window.location.href = 'order-success.html';
                }
            }
        });
    }
}

/**
 * Helper to validate a single field against a rule type
 */
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

/**
 * Automatically shifts focus to the first invalid field in a form
 */
function focusFirstError(formEl) {
    const invalidEl = formEl.querySelector('[aria-invalid="true"]');
    if (invalidEl) {
        invalidEl.focus();
    }
}

/**
 * Character counter observer for textarea inputs
 */
function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');

    textareas.forEach(textarea => {
        const max = textarea.getAttribute('maxlength') || 500;
        let counterEl = textarea.parentNode.querySelector('[data-char-counter]');

        if (!counterEl) {
            counterEl = document.createElement('div');
            counterEl.className = 'text-[10px] text-brand-muted text-right mt-1 font-mono';
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
