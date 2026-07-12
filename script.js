document.addEventListener('DOMContentLoaded', () => {
    // 1. Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // Toggle hamburger icon animation
            const spans = menuToggle.querySelectorAll('span');
            if (menuToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // 3. Stats Counter Animation
    const statsSection = document.querySelector('.stats-section');
    const statNumbers = document.querySelectorAll('.stat-number');

    if (statsSection && statNumbers.length > 0) {
        const countUp = (element) => {
            const target = parseInt(element.getAttribute('data-target'), 10);
            const duration = 2000; // ms
            const stepTime = 30; // ms
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + (element.getAttribute('data-suffix') || '');
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + (element.getAttribute('data-suffix') || '');
                }
            }, stepTime);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(num => countUp(num));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    // 4. Team Filtering & Searching
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.querySelector('.search-input');

    const filterTeam = () => {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const filterValue = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const sections = document.querySelectorAll('.hierarchy-section');
        sections.forEach(section => {
            let visibleCardsInSection = 0;
            const cards = section.querySelectorAll('.team-card');
            
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                const name = card.querySelector('.team-name') ? card.querySelector('.team-name').textContent.toLowerCase() : '';
                const role = card.querySelector('.team-role') ? card.querySelector('.team-role').textContent.toLowerCase() : '';

                const matchesFilter = filterValue === 'all' || category === filterValue;
                const matchesSearch = name.includes(searchValue) || role.includes(searchValue);

                if (matchesFilter && matchesSearch) {
                    card.style.display = 'block';
                    visibleCardsInSection++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Toggle section visibility based on card matches
            if (visibleCardsInSection > 0) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    };

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterTeam();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterTeam);
    }

    // 5. Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            let isValid = true;
            
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Name is required');
                isValid = false;
            } else {
                clearError(nameInput);
            }
            
            if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
                showError(emailInput, 'A valid email is required');
                isValid = false;
            } else {
                clearError(emailInput);
            }
            
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Message cannot be empty');
                isValid = false;
            } else {
                clearError(messageInput);
            }
            
            if (isValid) {
                // Mimic success submit
                const btn = contactForm.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Submitting...';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.textContent = 'Submitted Successfully!';
                    btn.style.backgroundColor = '#0f1d3a';
                    contactForm.reset();
                    
                    // Show a message in place of "Thanks for submitting!"
                    const successMessage = document.createElement('div');
                    successMessage.className = 'form-success-alert';
                    successMessage.innerHTML = '<p style="color: #0f1d3a; background: #dbeafe; padding: 1rem; border-radius: 8px; margin-top: 1rem; font-weight: 600; text-align: center;">Thank you! Your submission has been received.</p>';
                    contactForm.appendChild(successMessage);
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        btn.style.backgroundColor = '';
                        successMessage.remove();
                    }, 5000);
                }, 1500);
            }
        });
    }

    function showError(input, message) {
        const group = input.parentElement;
        let error = group.querySelector('.error-message');
        if (!error) {
            error = document.createElement('span');
            error.className = 'error-message';
            error.style.color = '#dc2626';
            error.style.fontSize = '0.8rem';
            error.style.marginTop = '0.25rem';
            error.style.display = 'block';
            group.appendChild(error);
        }
        error.textContent = message;
        input.style.borderColor = '#dc2626';
    }

    function clearError(input) {
        const group = input.parentElement;
        const error = group.querySelector('.error-message');
        if (error) {
            error.remove();
        }
        input.style.borderColor = '';
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // 6. Achievements Slideshow
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.achieve-slide');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const dotsContainer = document.querySelector('.slider-dots');

    if (slidesWrapper && slides.length > 0) {
        let currentSlide = 0;
        const totalSlides = slides.length;

        // Create dots dynamically
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
            dot.setAttribute('data-slide', idx);
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.slider-dot');

        const updateSlider = (idx) => {
            slidesWrapper.style.transform = `translateX(-${idx * 25}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[idx].classList.add('active');
            currentSlide = idx;
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let next = (currentSlide + 1) % totalSlides;
                updateSlider(next);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let prev = (currentSlide - 1 + totalSlides) % totalSlides;
                updateSlider(prev);
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.getAttribute('data-slide'), 10);
                updateSlider(idx);
            });
        });

        // Auto-rotation every 6 seconds
        setInterval(() => {
            let next = (currentSlide + 1) % totalSlides;
            updateSlider(next);
        }, 6000);
    }

    // 7. Knowledge Hub Resources Filtering & Searching
    const resourceFilterButtons = document.querySelectorAll('.resource-filter-btn');
    const resourceCards = document.querySelectorAll('.resource-card-item');
    const resourceSearchInput = document.querySelector('.resource-search-input');

    const filterResources = () => {
        const activeFilterBtn = document.querySelector('.resource-filter-btn.active');
        const filterValue = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        const searchValue = resourceSearchInput ? resourceSearchInput.value.toLowerCase().trim() : '';

        let visibleCount = 0;

        resourceCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
            const description = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';

            const matchesFilter = filterValue === 'all' || category === filterValue;
            const matchesSearch = title.includes(searchValue) || description.includes(searchValue);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update counts in UI if elements exist
        const countBadge = document.getElementById('resource-count-badge');
        if (countBadge) {
            countBadge.textContent = `${visibleCount} ${visibleCount === 1 ? 'Resource' : 'Resources'} Available`;
        }
    };

    if (resourceFilterButtons.length > 0) {
        resourceFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                resourceFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterResources();
            });
        });
    }

    if (resourceSearchInput) {
        resourceSearchInput.addEventListener('input', filterResources);
    }
});

