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

    // 8. Alumni Filtering & Searching
    const alumniFilterButtons = document.querySelectorAll('.alumni-filter-btn');
    const alumniCards = document.querySelectorAll('#alumni-grid .team-card');
    const alumniSearchInput = document.querySelector('.alumni-search-input');

    const filterAlumni = () => {
        const activeFilterBtn = document.querySelector('.alumni-filter-btn.active');
        const filterValue = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        const searchValue = alumniSearchInput ? alumniSearchInput.value.toLowerCase().trim() : '';

        alumniCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const name = card.querySelector('.team-name') ? card.querySelector('.team-name').textContent.toLowerCase() : '';
            const roles = Array.from(card.querySelectorAll('.team-role')).map(role => role.textContent.toLowerCase()).join(' ');

            const matchesFilter = filterValue === 'all' || category === filterValue;
            const matchesSearch = name.includes(searchValue) || roles.includes(searchValue);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };

    if (alumniFilterButtons.length > 0) {
        alumniFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                alumniFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterAlumni();
            });
        });
    }

    if (alumniSearchInput) {
        alumniSearchInput.addEventListener('input', filterAlumni);
    }

    // 9. About Slider (Home Page Auto-Swiping Cards)
    const aboutSlides = document.querySelectorAll('.about-slide');
    const aboutDots = document.querySelectorAll('.about-slider-dot');
    
    if (aboutSlides.length > 0) {
        let currentAboutSlide = 0;
        let aboutInterval;

        const updateAboutSlider = (idx) => {
            aboutSlides.forEach((slide, sIdx) => {
                if (sIdx === idx) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            aboutDots.forEach((dot, dIdx) => {
                if (dIdx === idx) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            currentAboutSlide = idx;
        };

        const startAboutTimer = () => {
            clearInterval(aboutInterval);
            aboutInterval = setInterval(() => {
                let next = (currentAboutSlide + 1) % aboutSlides.length;
                updateAboutSlider(next);
            }, 3000);
        };

        // Add dot click handlers
        aboutDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.getAttribute('data-slide'), 10);
                updateAboutSlider(idx);
                // Restart timer so it doesn't swipe immediately after manual click
                startAboutTimer();
            });
        });

        // Initialize timer
        startAboutTimer();
    }

    // 10. Interactive Collaborators Marquee
    const marqueeContainer = document.querySelector('.marquee-container');
    const marqueeContent = document.querySelector('.marquee-content');

    if (marqueeContainer && marqueeContent) {
        // Remove CSS animation so JS can control scroll position
        marqueeContent.classList.remove('autoplay-css');
        
        let isDown = false;
        let startX;
        let scrollLeftVal;
        let autoScrollSpeed = 0.8; // Pixels per frame
        let isInteracting = false;
        let interactionTimeout;
        
        // We have duplicated elements, so half of scrollWidth is the loop point
        let halfWidth = marqueeContent.scrollWidth / 2;
        
        // Recalculate widths on load and resize
        const recalculateWidth = () => {
            halfWidth = marqueeContent.scrollWidth / 2;
        };
        window.addEventListener('load', recalculateWidth);
        window.addEventListener('resize', recalculateWidth);
        
        // Auto-scroll loop
        function step() {
            if (!isDown && !isInteracting) {
                marqueeContainer.scrollLeft += autoScrollSpeed;
                
                // Loop scroll position
                if (marqueeContainer.scrollLeft >= halfWidth) {
                    marqueeContainer.scrollLeft = 0;
                }
            }
            requestAnimationFrame(step);
        }
        
        // Start auto-scroll
        requestAnimationFrame(step);
        
        // Reset interaction flag after a delay
        function resetInteractionTimer() {
            clearTimeout(interactionTimeout);
            interactionTimeout = setTimeout(() => {
                isInteracting = false;
            }, 3000); // Resume auto-scroll after 3 seconds of inactivity
        }
        
        // Drag-to-scroll event handlers
        marqueeContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            isInteracting = true;
            startX = e.pageX - marqueeContainer.offsetLeft;
            scrollLeftVal = marqueeContainer.scrollLeft;
            clearTimeout(interactionTimeout);
        });
        
        marqueeContainer.addEventListener('mouseleave', () => {
            isDown = false;
            if (isInteracting) resetInteractionTimer();
        });
        
        marqueeContainer.addEventListener('mouseup', () => {
            isDown = false;
            if (isInteracting) resetInteractionTimer();
        });
        
        marqueeContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - marqueeContainer.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier
            let targetScroll = scrollLeftVal - walk;
            
            // Loop bounds while dragging
            if (targetScroll >= halfWidth) {
                targetScroll = targetScroll - halfWidth;
                startX = x; // Reset start coordinates to prevent jump
                scrollLeftVal = targetScroll;
            } else if (targetScroll <= 0) {
                targetScroll = halfWidth + targetScroll;
                startX = x;
                scrollLeftVal = targetScroll;
            }
            
            marqueeContainer.scrollLeft = targetScroll;
        });
        
        // Mouse wheel horizontal scrolling
        marqueeContainer.addEventListener('wheel', (e) => {
            isInteracting = true;
            // Check if user is scrolling vertically or horizontally
            const scrollDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            
            let targetScroll = marqueeContainer.scrollLeft + scrollDelta;
            
            // Loop bounds while wheel scrolling
            if (targetScroll >= halfWidth) {
                targetScroll = targetScroll - halfWidth;
            } else if (targetScroll <= 0) {
                targetScroll = halfWidth + targetScroll;
            }
            
            marqueeContainer.scrollLeft = targetScroll;
            resetInteractionTimer();
            e.preventDefault(); // Prevent page scroll
        }, { passive: false });
    }

    // ----------------------------------------------------------------------
    // 6. GRANDEUR CMS DYNAMIC SYNCHRONIZATION & ADMIN ACCESS SHORTCUT
    // ----------------------------------------------------------------------

    // Admin Access Keyboard Shortcut (Ctrl + Shift + A)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            window.location.href = 'admin.html';
        }
    });

    async function syncGrandeurCMS() {
        // Try fetching from Supabase if client is active
        if (window.supabaseClient) {
            try {
                // Fetch Announcement Banner
                const { data: bannerData } = await window.supabaseClient.from('announcements').select('*').single();
                if (bannerData) renderBanner(bannerData.active, bannerData.text, bannerData.btn_text, bannerData.btn_url);

                // Fetch Recruitment Settings
                const { data: recData } = await window.supabaseClient.from('recruitment_settings').select('*').single();
                if (recData) applyRecruitmentState(recData.active, recData.form_url);

                // Fetch Team Members
                const teamHierarchy = document.querySelector('.team-hierarchy');
                if (teamHierarchy) {
                    const { data: teamData } = await window.supabaseClient.from('team_members').select('*').order('display_order', { ascending: true });
                    if (teamData && teamData.length > 0) renderDynamicTeamGrid(teamData, teamHierarchy);
                }
                return;
            } catch (err) {
                console.warn("Supabase fetch fallback to local storage:", err);
            }
        }

        // Fallback to localStorage
        const dataStr = localStorage.getItem('grandeur_admin_store');
        if (!dataStr) return;

        try {
            const store = JSON.parse(dataStr);

            if (store.banner) renderBanner(store.banner.active, store.banner.text, store.banner.btnText, store.banner.btnUrl);
            if (store.recruitment) applyRecruitmentState(store.recruitment.active, store.recruitment.formUrl);

            const teamHierarchy = document.querySelector('.team-hierarchy');
            if (teamHierarchy && store.team && store.team.length > 0) {
                renderDynamicTeamGrid(store.team, teamHierarchy);
            }
        } catch (e) {
            console.error("CMS Sync Error:", e);
        }
    }

    function renderBanner(active, text, btnText, btnUrl) {
        let bannerEl = document.getElementById('grandeur-global-banner');
        if (active) {
            if (!bannerEl) {
                bannerEl = document.createElement('div');
                bannerEl.id = 'grandeur-global-banner';
                bannerEl.className = 'global-announcement-banner';
                document.body.prepend(bannerEl);
            }
            const btnHtml = btnText ? `<a href="${btnUrl || '#'}" class="banner-btn">${escapeHtml(btnText)}</a>` : '';
            bannerEl.innerHTML = `
                <div class="banner-content">
                    <span>${escapeHtml(text)}</span>
                    ${btnHtml}
                </div>
            `;
        } else if (bannerEl) {
            bannerEl.remove();
        }
    }

    function applyRecruitmentState(active, formUrl) {
        const recElements = document.querySelectorAll('.recruitment-cta-btn, .recruitment-notice');
        recElements.forEach(el => {
            if (active) {
                el.style.display = 'inline-block';
                if (el.tagName === 'A' && formUrl) el.href = formUrl;
            } else {
                el.style.display = 'none';
            }
        });
    }

    function renderDynamicTeamGrid(teamMembers, container) {
        if (!container) return;
        if (!teamMembers || teamMembers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem 1rem; color: #94a3b8; background: rgba(30, 41, 59, 0.4); border: 1px dashed rgba(212, 175, 55, 0.3); border-radius: 16px; max-width: 600px; margin: 2rem auto;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👥</div>
                    <h3 style="color: #f8fafc; margin-bottom: 0.5rem;">No Active Team Members Listed</h3>
                    <p style="font-size: 0.95rem;">Use the Grandeur Admin Console to add team members, photos, and roles.</p>
                </div>
            `;
            return;
        }

        // Group by 6 official tiers
        const tiers = {
            faculty: { title: "Faculty In-Charge", members: [] },
            board: { title: "President & Vice President", members: [] },
            coordinators: { title: "Co-ordinators", members: [] },
            advisory: { title: "Advisory Committee", members: [] },
            core: { title: "Core Committee", members: [] },
            organizing: { title: "Organizing Committee", members: [] }
        };

        teamMembers.forEach(m => {
            const key = (m.tier || 'core').toLowerCase();
            if (tiers[key]) {
                tiers[key].members.push(m);
            } else {
                tiers.core.members.push(m);
            }
        });

        // Build HTML
        let html = '';
        Object.keys(tiers).forEach(tierKey => {
            const tierData = tiers[tierKey];
            if (tierData.members.length > 0) {
                html += `
                    <div class="hierarchy-section" data-tier="${tierKey}" style="margin-bottom: 3.5rem;">
                        <h4 class="tier-title" style="text-align: center; margin-bottom: 2rem; color: var(--gold, #d4af37); font-size: 1.5rem; text-transform: uppercase; letter-spacing: 1px;">${tierData.title}</h4>
                        <div class="team-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem; max-width: 1100px; margin: 0 auto;">
                            ${tierData.members.map(m => {
                                const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                const avatarHtml = m.photo ? 
                                    `<img src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem; border: 3px solid var(--gold, #d4af37); box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);">` :
                                    `<div class="avatar-placeholder" style="width: 110px; height: 110px; border-radius: 50%; background: #1e293b; color: #d4af37; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; margin: 0 auto 1rem; border: 3px solid #d4af37; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);">${initials}</div>`;

                                const linkedinHtml = m.linkedin ? `
                                    <div class="team-social" style="margin-top: 0.85rem;">
                                        <a href="${escapeHtml(m.linkedin)}" class="social-link" target="_blank" aria-label="LinkedIn Profile" style="color: #d4af37; font-size: 0.9rem; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem;">
                                            LinkedIn ↗
                                        </a>
                                    </div>
                                ` : '';

                                return `
                                    <div class="team-card" style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 14px; padding: 2rem 1.25rem; text-align: center; transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                                        ${avatarHtml}
                                        <div class="team-info">
                                            <h3 class="team-name" style="font-size: 1.25rem; margin-bottom: 0.35rem; color: #ffffff;">${escapeHtml(m.name)}</h3>
                                            <span class="team-role" style="color: #94a3b8; font-size: 0.95rem; font-weight: 500;">${escapeHtml(m.role)}</span>
                                            ${linkedinHtml}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        });

        if (html) container.innerHTML = html;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Contact form saver to CMS inbox & Supabase
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            const nameVal = document.getElementById('name')?.value || '';
            const emailVal = document.getElementById('email')?.value || '';
            const subjectVal = document.getElementById('subject')?.value || 'General Inquiry';
            const messageVal = document.getElementById('message')?.value || '';

            if (nameVal && emailVal && messageVal) {
                // If Supabase connected
                if (window.supabaseClient) {
                    try {
                        await window.supabaseClient.from('contact_inquiries').insert([
                            { name: nameVal, email: emailVal, subject: subjectVal, message: messageVal }
                        ]);
                    } catch(err) { console.error("Supabase insert error:", err); }
                }

                // Also save locally
                const dataStr = localStorage.getItem('grandeur_admin_store');
                if (dataStr) {
                    try {
                        const store = JSON.parse(dataStr);
                        if (!store.inbox) store.inbox = [];
                        store.inbox.unshift({
                            id: "in_" + Date.now(),
                            name: nameVal,
                            email: emailVal,
                            subject: subjectVal,
                            message: messageVal,
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        });
                        localStorage.setItem('grandeur_admin_store', JSON.stringify(store));
                    } catch(err){}
                }
            }
        });
    }

    // Execute sync
    syncGrandeurCMS();
    window.addEventListener('grandeur_store_updated', syncGrandeurCMS);
});





