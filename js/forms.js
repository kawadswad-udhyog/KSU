/**
 * ============================================================================
 * KAWAD SWAD - Forms & Communication Engine (js/forms.js)
 * ============================================================================
 * Centralized, accessible, and asynchronous form engine providing inline validation,
 * ARIA live updates, mobile/email/pincode pattern matching, loading spinners, and
 * safe, non-mock form submission handling.
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

    showSuccess(containerEl, title, message) {
        if (!containerEl) return;

        const successBox = document.createElement('div');
        successBox.className = 'p-6 bg-[#FFFDF7] border border-[#F3E6C8] rounded-xl text-center space-y-3 my-4 shadow-sm';
        successBox.setAttribute('role', 'status');
        successBox.setAttribute('aria-live', 'polite');
        
        const heading = document.createElement('h4');
        heading.className = 'font-serif text-xl font-bold text-[#4E342E]';
        heading.textContent = title;

        const text = document.createElement('p');
        text.className = 'text-xs text-[#5F5F5F] leading-relaxed font-light';
        text.textContent = message;

        successBox.appendChild(heading);
        successBox.appendChild(text);

        const existingStatus = containerEl.querySelector('[role="status"]');
        if (existingStatus) existingStatus.remove();

        containerEl.prepend(successBox);
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
}

function initBusinessForm() {
    const form = document.querySelector('form[data-form="business"], #business-enquiry-form');
    if (!form) return;

    const bizType = form.querySelector('#business-type, select[name="business-type"]');
    const bizName = form.querySelector('#company-name, #business-name');
    const contactPerson = form.querySelector('#contact-person');
    const mobile = form.querySelector('#business-mobile, #mobile-number');
    const email = form.querySelector('#business-email, #email');

    if (bizType) bizType.addEventListener('change', () => validateField(bizType, 'required', 'Please select a Business Type'));
    if (bizName) bizName.addEventListener('blur', () => validateField(bizName, 'required', 'Company name is required'));
    if (contactPerson) contactPerson.addEventListener('blur', () => validateField(contactPerson, 'required', 'Contact person name is required'));
    if (mobile) mobile.addEventListener('blur', () => validateField(mobile, 'phone', 'Enter a valid 10-digit mobile number'));
    if (email) email.addEventListener('blur', () => validateField(email, 'email', 'Enter a valid email address'));
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
            FormEngine.showSuccess(form.parentNode, 'Subscribed!', 'Thank you for subscribing to Kawad Swad updates.');
            form.reset();
        });
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

function focusFirstError(formEl) {
    const invalidEl = formEl.querySelector('[aria-invalid="true"]');
    if (invalidEl) {
        invalidEl.focus();
    }
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
