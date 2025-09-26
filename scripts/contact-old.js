// Contact page functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeContactForms();
    initializeDateValidation();
    initializeFormValidation();
    setupNotificationContainer();
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
    const errorMessage = formGroup.querySelector('.error-message');
    
    // Remove existing validation classes
    formGroup.classList.remove('error', 'success');
    
    // Create error message element if it doesn't exist
    if (!errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        formGroup.appendChild(errorDiv);
    }
    
    let isValid = true;
    let message = '';
    
    // Required field validation
    if (field.required && !field.value.trim()) {
        isValid = false;
        message = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s]?[\d]{1,4}[\s]?[\d]{1,4}[\s]?[\d]{1,9}$/;
        if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
    }
    
    // Date validation
    if (field.type === 'date' && field.value) {
        const selectedDate = new Date(field.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            isValid = false;
            message = 'Date cannot be in the past';
        }
    }
    
    // Update UI based on validation result
    const errorElement = formGroup.querySelector('.error-message');
    if (isValid) {
        formGroup.classList.add('success');
        if (errorElement) {
            errorElement.textContent = '';
        }
    } else {
        formGroup.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    return isValid;
}

// Validate entire form
function validateForm(form) {
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    fields.forEach(field => {
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
    
    // Show loading state
    setButtonLoading(submitButton, true);
    
    // Collect form data
    const formData = new FormData(form);
    const bookingData = {
        type: 'booking',
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        guests: formData.get('guests'),
        checkin: formData.get('checkin'),
        checkout: formData.get('checkout'),
        room: formData.get('room'),
        message: formData.get('message')
    };
    
    // Simulate email sending (replace with actual implementation)
    setTimeout(() => {
        sendEmailToOwner(bookingData)
            .then(() => {
                showNotification('Booking request sent successfully! We\'ll contact you within 24 hours.', 'success');
                form.reset();
                removeFormValidation(form);
            })
            .catch(() => {
                showNotification('Failed to send booking request. Please try again or call us directly.', 'error');
            })
            .finally(() => {
                setButtonLoading(submitButton, false);
            });
    }, 2000);
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
    
    // Show loading state
    setButtonLoading(submitButton, true);
    
    // Collect form data
    const formData = new FormData(form);
    const reviewData = {
        type: 'review',
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
    
    // Simulate email sending (replace with actual implementation)
    setTimeout(() => {
        sendEmailToOwner(reviewData)
            .then(() => {
                showNotification('Thank you for your review! Your feedback helps us improve our service.', 'success');
                form.reset();
                removeFormValidation(form);
            })
            .catch(() => {
                showNotification('Failed to send review. Please try again or email us directly.', 'error');
            })
            .finally(() => {
                setButtonLoading(submitButton, false);
            });
    }, 2000);
}

// Send email to owner (placeholder function)
function sendEmailToOwner(data) {
    return new Promise((resolve, reject) => {
        // This is a placeholder implementation
        // In a real application, you would send this data to a server endpoint
        // that handles email sending using a service like EmailJS, Nodemailer, etc.
        
        console.log('Sending email with data:', data);
        
        // For demonstration, we'll create a mailto link as fallback
        const subject = data.type === 'booking' ? 'New Booking Request' : 'Guest Review';
        let body = '';
        
        if (data.type === 'booking') {
            body = `New booking request from ${data.name}\n\n` +
                   `Email: ${data.email}\n` +
                   `Phone: ${data.phone || 'Not provided'}\n` +
                   `Guests: ${data.guests}\n` +
                   `Check-in: ${data.checkin}\n` +
                   `Check-out: ${data.checkout}\n` +
                   `Room Preference: ${data.room || 'No preference'}\n\n` +
                   `Special Requests:\n${data.message || 'None'}`;
        } else {
            body = `New review from ${data.name}\n\n` +
                   `Email: ${data.email}\n` +
                   `Overall Satisfaction: ${data.satisfaction}/5 stars\n` +
                   `Would Recommend: ${data.recommend}\n` +
                   `Room Cleanliness: ${data.cleanliness}\n` +
                   `Staff Service: ${data.service}\n\n` +
                   `Problems Encountered:\n${data.problems || 'None'}\n\n` +
                   `Suggested Improvements:\n${data.improvements || 'None'}\n\n` +
                   `Additional Comments:\n${data.comments || 'None'}`;
        }
        
        // Create mailto link (this will open the user's email client)
        const mailtoLink = `mailto:simphiwe.guesthouse@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // For demo purposes, we'll just resolve after a delay
        // In production, replace this with actual email sending logic
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% success rate for demo
                resolve();
            } else {
                reject(new Error('Email sending failed'));
            }
        }, 1000);
    });
}

// Set button loading state
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.dataset.originalText = button.textContent;
        button.textContent = 'Sending...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = button.dataset.originalText || 'Submit';
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
    
    container.appendChild(notification);
    
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
        
        // Clear saved data on successful submission
        form.addEventListener('submit', function() {
            clearSavedFormData(formId);
        });
    });
}

// Save form data to localStorage
function saveFormData(form, formId) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
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
                    if (field.type === 'radio') {
                        const radioField = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radioField) radioField.checked = true;
                    } else {
                        field.value = data[key];
                    }
                }
            });
        } catch (e) {
            console.error('Error loading saved form data:', e);
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

// Initialize auto-save on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAutoSave();
});