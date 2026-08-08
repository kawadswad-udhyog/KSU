/**
 * ============================================================================
 * KAWAD SWAD - Forms & Communication Engine (js/forms.js)
 * ============================================================================
 * Centralized, accessible, and asynchronous form engine.
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
            inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
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
            if (errorEl) errorEl.remove();
        }
        inputEl.removeAttribute('aria-describedby');
    },

    showStatus(message, type) {
        const banner = document.getElementById('form-status-banner');
        if (banner) {
            banner.textContent = message;
            banner.className = `mb-8 p-4 rounded-xl text-sm font-medium border ${type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`;
            banner.classList.remove('hidden');
        } else {
            alert(message);
        }
    },

    showFallbackNotice(containerEl, title, message) {
        if (!containerEl) return;
        const box = document.createElement('div');
        box.className = 'p-6 bg-[#FFFDF7] border border-[#F3E6C8] rounded-xl text-center space-y-4 my-4 shadow-sm';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        box.innerHTML = `
            <h4 class='font-serif text-xl font-bold text-[#4E342E]'>${title}</h4>
            <p class='text-xs text-[#5F5F5F] leading-relaxed font-light'>${message}</p>
            <a href='https://wa.me/919630976867' target='_blank' class='inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FE330E] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#d92500] transition-colors shadow-sm'>Continue via WhatsApp</a>
        `;
        const existing = containerEl.querySelector('[role="status"]');
        if (existing) existing.remove();
        containerEl.prepend(box);
    },

    toggleLoading(buttonEl, isLoading, defaultText = 'Submit') {
        if (!buttonEl) return;
        if (isLoading) {
            buttonEl.disabled = true;
            buttonEl.setAttribute('aria-busy', 'true');
            buttonEl.dataset.originalText = buttonEl.innerHTML;
            buttonEl.innerHTML = `<span class="inline-flex items-center justify-center gap-2">Processing...</span>`;
        } else {
            buttonEl.disabled = false;
            buttonEl.removeAttribute('aria-busy');
            buttonEl.innerHTML = buttonEl.dataset.originalText || defaultText;
        }
    }
};

// ----------------------------------------------------------------------------
// Form Controllers
// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
    initBusinessForm();
    initNewsletterForms();
    initCheckoutForm();
    initReviewForm();
    initCharacterCounters();
});

function initReviewForm() {
    const reviewForm = document.querySelector('form[data-form="review"]');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(reviewForm);
        const data = Object.fromEntries(formData.entries());
        
        if (!data['reviewer-name'] || !data['review-text']) {
            FormEngine.showStatus('Please fill in all required fields.', 'error');
            return;
        }

        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        FormEngine.toggleLoading(submitBtn, true);

        // Simulate submission
        setTimeout(() => {
            FormEngine.toggleLoading(submitBtn, false, 'Submit Review');
            reviewForm.reset();
            FormEngine.showStatus('Thank you for your feedback! Your review has been submitted.', 'success');
        }, 800);
    });
}

// ... include initContactForm, initBusinessForm, initNewsletterForms, 
//     initCheckoutForm, validateField, and initCharacterCounters from your previous code ...
