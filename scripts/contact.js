// contact.js

document.addEventListener('DOMContentLoaded', function() {
    initializeContactForms();
    initializeDateValidation();
    initializeFormValidation();
    setupNotificationContainer();
    initializeAutoSave(); 
});

// Initialize contact forms
function initializeContactForms() {
    const bookingForm = document.getElementById('booking-form');
    const reviewForm = document.getElementById('review-form');

    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmission);
    }
}

// Initialize date validation
function initializeDateValidation() {
    const checkinDate = document.getElementById('checkin-date');
    const checkoutDate = document.getElementById('checkout-date');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (checkinDate) {
        checkinDate.min = today;
        checkinDate.addEventListener('change', function() {
            if (checkoutDate) {
                checkoutDate.min = this.value;
                
                // If checkout date is before or same as checkin, clear it
                if (checkoutDate.value && checkoutDate.value <= this.value) {
                    checkoutDate.value = '';
                }
            }
        });
    }
    
    if (checkoutDate) {
        checkoutDate.addEventListener('change', function() {
            if (checkinDate && this.value <= checkinDate.value) {
                showNotification('Check-out date must be after check-in date', 'error');
                this.value = '';
            }
        });
    }
}

// Form validation
function initializeFormValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const formGroup = field.closest('.form-group');
    let errorMessage = formGroup.querySelector('.error-message');
    
    // Remove existing validation classes
    formGroup.classList.remove('error', 'success');
    
    // Create error message element if it doesn't exist
    if (!errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        formGroup.appendChild(errorDiv);
        errorMessage = errorDiv;
    }
    
    let isValid = true;
    let message = '';
    
    // Required field validation
    if (field.required && !field.value.trim()) {
        isValid = false;
        message = 'This field is required';
    }
    
    // Email validation
    if (isValid && field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (isValid && field.type === 'tel' && field.value) {
        // Updated regex to be more flexible
        const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s]?[\d]{1,4}[\s]?[\d]{1,4}[\s]?[\d]{1,9}$/;
        if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
    }
    
    // Date validation (check against today)
    if (isValid && field.type === 'date' && field.value) {
        const selectedDate = new Date(field.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            isValid = false;
            message = 'Date cannot be in the past';
        }
    }
    
    // Update UI based on validation result
    if (isValid) {
        formGroup.classList.add('success');
        errorMessage.textContent = '';
    } else {
        formGroup.classList.add('error');
        errorMessage.textContent = message;
    }
    
    return isValid;
}

// Validate entire form
function validateForm(form) {
    // Only check fields with validation logic (i.e., required fields)
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    fields.forEach(field => {
        // We run validateField on ALL fields to show all errors at once
        // We use the result to check overall validity
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Handle booking form submission
function handleBookingSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateForm(form)) {
        showNotification('Please fix the errors in the form before submitting', 'error');
        return;
    }
    
    // Show loading state, setting custom text for the button
    setButtonLoading(submitButton, true, 'Sending Request...');
    
    // Collect form data
    const formData = new FormData(form);
    const bookingData = {
        type: 'booking', // Crucial for the backend to identify the email template
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        guests: formData.get('guests'),
        checkin: formData.get('checkin'),
        checkout: formData.get('checkout'),
        room: formData.get('room'),
        message: formData.get('message')
    };
    
    // Send request to backend API
    sendEmailToOwner(bookingData)
        .then(() => {
            showNotification('Booking request sent successfully! We\'ll contact you within 24 hours.', 'success');
            form.reset();
            removeFormValidation(form);
            clearSavedFormData(form.id);
        })
        .catch((error) => {
            console.error('Submission Error:', error);
            showNotification('Failed to send booking request. Please try again or call us directly. (Error: ' + error.message + ')', 'error');
        })
        .finally(() => {
            setButtonLoading(submitButton, false);
        });
}

// Handle review form submission
function handleReviewSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateForm(form)) {
        showNotification('Please complete all required fields before submitting', 'error');
        return;
    }
    
    // Show loading state, setting custom text for the button
    setButtonLoading(submitButton, true, 'Submitting Review...');
    
    // Collect form data
    const formData = new FormData(form);
    const reviewData = {
        type: 'review', // Crucial for the backend to identify the email template
        name: formData.get('name'),
        email: formData.get('email'),
        satisfaction: formData.get('satisfaction'),
        recommend: formData.get('recommend'),
        cleanliness: formData.get('cleanliness'),
        service: formData.get('service'),
        problems: formData.get('problems'),
        improvements: formData.get('improvements'),
        comments: formData.get('comments')
    };
    
    // Send request to backend API
    sendEmailToOwner(reviewData)
        .then(() => {
            showNotification('Thank you for your review! Your feedback helps us improve our service.', 'success');
            form.reset();
            removeFormValidation(form);
            clearSavedFormData(form.id);
        })
        .catch((error) => {
            console.error('Submission Error:', error);
            showNotification('Failed to send review. Please try again or email us directly. (Error: ' + error.message + ')', 'error');
        })
        .finally(() => {
            setButtonLoading(submitButton, false);
        });
}

/**
 * Sends form data to the secure backend API endpoint for email processing.
 * @param {Object} data - The form data object.
 * @returns {Promise<Object>} - The JSON response from the server.
 */
function sendEmailToOwner(data) {
    // IMPORTANT: Make sure your Node.js server is running on this address/port.
    const API_URL = 'http://localhost:3000/api/send-email'; 
    
    console.log('Attempting to send email via API with data:', data);

    return fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Convert the JavaScript object into a JSON string for the body
        body: JSON.stringify(data)
    })
    .then(async response => {
        // Handle server-side errors (4xx or 5xx status codes)
        if (!response.ok) {
            // Attempt to read the error message sent back from the server
            const errorData = await response.json().catch(() => ({})); 
            const errorMessage = errorData.message || 'API request failed with status: ' + response.status;
            throw new Error(errorMessage);
        }
        // Success: parse the response JSON
        return response.json(); 
    });
}

// Set button loading state - Updated to accept a custom loading text
function setButtonLoading(button, isLoading, loadingText = 'Sending...') {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        // Save original text if not already saved
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }
        button.textContent = loadingText;
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        // Restore original text
        // Use a default text if originalText was never saved (e.g. if an error happened immediately)
        button.textContent = button.dataset.originalText || 'Submit'; 
        delete button.dataset.originalText; // Clean up the dataset after use
    }
}

// Remove form validation classes
function removeFormValidation(form) {
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = '';
        }
    });
}

// Setup notification container
function setupNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            z-index: 2000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
}

// Enhanced notification function
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) {
        setupNotificationContainer();
        // Immediately retry showing the notification after setting up the container
        return showNotification(message, type, duration); 
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Insert at the top of the container
    container.prepend(notification);
    
    // Auto remove after duration
    const autoRemoveTimer = setTimeout(() => {
        removeNotification(notification);
    }, duration);
    
    // Manual close
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        clearTimeout(autoRemoveTimer);
        removeNotification(notification);
    });
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
}

// Remove notification with animation
function removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Form auto-save functionality (optional)
function initializeAutoSave() {
    const forms = document.querySelectorAll('.contact-form');
    
    forms.forEach(form => {
        const formId = form.id;
        
        // Load saved data
        loadFormData(form, formId);
        
        // Save data on input
        form.addEventListener('input', debounce(function() {
            saveFormData(form, formId);
        }, 1000));
    });
}

// Save form data to localStorage
function saveFormData(form, formId) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        // Special handling for radio/checkboxes to ensure only the value of the checked one is saved
        const field = form.querySelector(`[name="${key}"]`);
        if (field && (field.type === 'radio' || field.type === 'checkbox')) {
            if (field.checked) {
                data[key] = value;
            } else if (data[key] === undefined) {
                // Initialize to empty/null if nothing is checked, preventing saving unchecked box
                data[key] = '';
            }
        } else {
            data[key] = value;
        }
    }
    
    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
}

// Load form data from localStorage
function loadFormData(form, formId) {
    const savedData = localStorage.getItem(`form_${formId}`);
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && data[key]) {
                    // Handle radio buttons
                    if (field.type === 'radio') {
                        const radioField = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radioField) radioField.checked = true;
                    } 
                    // Handle checkboxes
                    else if (field.type === 'checkbox') {
                         const checkboxField = form.querySelector(`[name="${key}"]`);
                         if (checkboxField) checkboxField.checked = (checkboxField.value === data[key]);
                    }
                    // Handle other inputs (text, email, date, select, textarea)
                    else {
                        field.value = data[key];
                    }
                }
            });
            // Re-run date validation after loading to apply min/max constraints
            initializeDateValidation(); 
        } catch (e) {
            console.error('Error loading saved form data:', e);
            localStorage.removeItem(`form_${formId}`); // Clear corrupted data
        }
    }
}

// Clear saved form data
function clearSavedFormData(formId) {
    localStorage.removeItem(`form_${formId}`);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}