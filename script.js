document.addEventListener('DOMContentLoaded', () => {
    // 1. Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        const closeMenu = () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            if (spans.length >= 3) {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        };

        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const spans = menuToggle.querySelectorAll('span');
            if (spans.length >= 3) {
                if (menuToggle.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
                } else {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });

        // Auto-close menu when clicking a nav link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Auto-close menu when clicking outside header
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && header && !header.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // 3. Stats Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    if (statNumbers.length > 0) {
        const animateCounter = (element) => {
            if (element.dataset.animated === "true") return;
            element.dataset.animated = "true";

            const targetAttr = element.getAttribute('data-target');
            if (!targetAttr) return;
            const target = parseInt(targetAttr, 10);
            if (isNaN(target)) return;

            const prefix = element.getAttribute('data-prefix') || '';
            const suffix = element.getAttribute('data-suffix') || '';
            const duration = 2000; // ms
            let startTime = null;

            // Set initial state to 0 as animation starts
            element.textContent = prefix + '0' + suffix;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out cubic calculation
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentCount = Math.floor(easeOut * target);

                element.textContent = prefix + currentCount.toLocaleString() + suffix;

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    element.textContent = prefix + target.toLocaleString() + suffix;
                }
            };

            requestAnimationFrame(step);
        };

        const checkAndAnimate = () => {
            statNumbers.forEach(element => {
                if (element.dataset.animated === "true") return;
                const rect = element.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rect.top <= windowHeight * 0.95 && rect.bottom >= 0) {
                    animateCounter(element);
                }
            });
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting || entry.intersectionRatio > 0) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

            statNumbers.forEach(num => observer.observe(num));
        }

        // Run immediate check and add scroll/resize listener fallbacks
        checkAndAnimate();
        window.addEventListener('scroll', checkAndAnimate, { passive: true });
        window.addEventListener('resize', checkAndAnimate, { passive: true });
        setTimeout(checkAndAnimate, 300);
        setTimeout(checkAndAnimate, 1000);
    }

    // 5. Contact Form Button Handler
    const btnSendAnother = document.getElementById('btn-send-another');
    if (btnSendAnother) {
        btnSendAnother.addEventListener('click', () => {
            const wrapper = document.getElementById('contact-form-wrapper');
            const successState = document.getElementById('contact-success-state');
            const contactForm = document.getElementById('contact-form');
            if (contactForm) contactForm.reset();
            if (wrapper && successState) {
                successState.style.display = 'none';
                wrapper.style.display = 'block';
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

        // Mobile touch swipe gestures
        let touchStartX = 0;
        let touchEndX = 0;

        slidesWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slidesWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 40) {
                // Swipe Left -> Next slide
                let next = (currentSlide + 1) % totalSlides;
                updateSlider(next);
            } else if (touchEndX - touchStartX > 40) {
                // Swipe Right -> Prev slide
                let prev = (currentSlide - 1 + totalSlides) % totalSlides;
                updateSlider(prev);
            }
        }, { passive: true });

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

        // Count badge preserved statically with Linktree icon link
        // const countBadge = document.getElementById('resource-count-badge');
        // if (countBadge) {
        //     countBadge.textContent = `${visibleCount} ${visibleCount === 1 ? 'Resource' : 'Resources'} Available`;
        // }
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
    const prevAboutBtn = document.getElementById('about-prev-btn');
    const nextAboutBtn = document.getElementById('about-next-btn');
    
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

            currentAboutSlide = idx;
        };

        const startAboutTimer = () => {
            clearInterval(aboutInterval);
            aboutInterval = setInterval(() => {
                let next = (currentAboutSlide + 1) % aboutSlides.length;
                updateAboutSlider(next);
            }, 3000);
        };

        if (prevAboutBtn) {
            prevAboutBtn.addEventListener('click', () => {
                let prev = (currentAboutSlide - 1 + aboutSlides.length) % aboutSlides.length;
                updateAboutSlider(prev);
                startAboutTimer();
            });
        }

        if (nextAboutBtn) {
            nextAboutBtn.addEventListener('click', () => {
                let next = (currentAboutSlide + 1) % aboutSlides.length;
                updateAboutSlider(next);
                startAboutTimer();
            });
        }

        const aboutSliderContainer = document.querySelector('.about-slider-container');
        if (aboutSliderContainer) {
            aboutSliderContainer.addEventListener('mouseenter', () => clearInterval(aboutInterval));
            aboutSliderContainer.addEventListener('mouseleave', startAboutTimer);

            let touchStartX = 0;
            let touchEndX = 0;
            aboutSliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            aboutSliderContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) {
                    let next = (currentAboutSlide + 1) % aboutSlides.length;
                    updateAboutSlider(next);
                    startAboutTimer();
                } else if (touchEndX - touchStartX > 50) {
                    let prev = (currentAboutSlide - 1 + aboutSlides.length) % aboutSlides.length;
                    updateAboutSlider(prev);
                    startAboutTimer();
                }
            }, { passive: true });
        }

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

    function getSupabase() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
            window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
            return window.supabaseClient;
        }
        return null;
    }

    async function syncGrandeurCMS() {
        const teamHierarchy = document.querySelector('.team-hierarchy');

        let recData = null;
        let localStore = null;

        const dataStr = localStorage.getItem('grandeur_admin_store');
        if (dataStr) {
            try {
                localStore = JSON.parse(dataStr);
            } catch (e) {}
        }

        if (window.GrandeurDB) {
            try {
                recData = await window.GrandeurDB.getRecruitment();
            } catch (err) {
                console.warn("Recruitment fetch warning:", err);
            }
        }

        const finalRec = (recData && (recData.title || recData.active !== undefined))
            ? { ...(localStore ? localStore.recruitment : {}), ...recData }
            : (localStore ? localStore.recruitment : null);

        if (finalRec) {
            applyRecruitmentState(finalRec);
        }

        if (teamHierarchy) {
            if (window.GrandeurDB) {
                try {
                    const teamData = await window.GrandeurDB.getTeamMembers();
                    if (teamData && teamData.length > 0) {
                        renderDynamicTeamGrid(teamData, teamHierarchy);
                        return;
                    }
                } catch(e) {}
            }
            if (localStore && localStore.team) {
                renderDynamicTeamGrid(localStore.team, teamHierarchy);
            }
        }
    }

    function isRecruitmentActive(recData) {
        if (!recData) return true;
        return typeof recData === 'object' ? recData.active !== false : !!recData;
    }

    function isRecruitmentExpired(recData) {
        if (!recData || typeof recData !== 'object') return false;
        const dtStr = recData.deadline_datetime || recData.deadlineDatetime;
        if (dtStr) {
            const cutoff = new Date(dtStr).getTime();
            if (!isNaN(cutoff) && Date.now() > cutoff) {
                return true;
            }
        }
        return false;
    }

    function applyRecruitmentState(recData) {
        if (!recData) return;
        const isActive = isRecruitmentActive(recData);
        const isExpired = isRecruitmentExpired(recData);

        const title = (recData && typeof recData.title === 'string' && recData.title.trim() !== '') ? recData.title.trim() : 'Grandeur Recruitment Drive 2026';
        const description = (recData && typeof recData.description === 'string' && recData.description.trim() !== '') ? recData.description.trim() : 'Join the premier Consulting & Knowledge Cell of SSCBS.';
        const deadline = (recData && typeof recData.deadline === 'string' && recData.deadline.trim() !== '') ? recData.deadline.trim() : 'August 20, 2026';

        // 1. Header & footer "Join Grandeur" nav links:
        const joinNavElements = document.querySelectorAll('.nav-item-join, .footer-join-link');
        joinNavElements.forEach(el => {
            el.style.display = isActive ? 'inline-block' : 'none';
        });

        // 2. Render Join Us page states
        const activeContainer = document.getElementById('join-active-state');
        const closedContainer = document.getElementById('join-closed-state');

        if (activeContainer && closedContainer) {
            if (!isActive || isExpired) {
                activeContainer.style.display = 'none';
                closedContainer.style.display = 'block';
            } else {
                activeContainer.style.display = 'block';
                closedContainer.style.display = 'none';

                const titleEl = document.getElementById('join-drive-title');
                if (titleEl) titleEl.textContent = title;

                const subtitleEl = document.getElementById('app-drive-subtitle');
                if (subtitleEl) subtitleEl.textContent = title;

                const descEl = document.getElementById('join-drive-desc');
                if (descEl) descEl.textContent = description;

                const deadlineEl = document.getElementById('join-drive-deadline');
                if (deadlineEl) deadlineEl.textContent = deadline;

                const applyBtns = document.querySelectorAll('.join-apply-btn');
                applyBtns.forEach(btn => {
                    btn.href = 'apply.html';
                });
            }
        }
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
            organizing: { title: "Board of Directors", members: [] },
            advisory: { title: "Advisory Committee", members: [] },
            core: { title: "Core Committee", members: [] }
        };

        teamMembers.forEach(m => {
            const key = (m.tier || 'core').toLowerCase();
            if (tiers[key]) {
                tiers[key].members.push(m);
            } else {
                tiers.core.members.push(m);
            }
        });

        function sortCategoryMembers(tierKey, membersList) {
            if (tierKey === 'board') {
                return [...membersList].sort((a, b) => {
                    const roleA = (a.role || '').toLowerCase();
                    const roleB = (b.role || '').toLowerCase();

                    const isPresA = roleA.includes('president') && !roleA.includes('vice');
                    const isPresB = roleB.includes('president') && !roleB.includes('vice');

                    if (isPresA && !isPresB) return -1;
                    if (!isPresA && isPresB) return 1;

                    const isVpA = roleA.includes('vice president') || roleA.includes('vp');
                    const isVpB = roleB.includes('vice president') || roleB.includes('vp');

                    if (isVpA && !isVpB) return -1;
                    if (!isVpA && isVpB) return 1;

                    return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
                });
            }

            return [...membersList].sort((a, b) => {
                return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
            });
        }

        // Build HTML
        let html = '';
        Object.keys(tiers).forEach(tierKey => {
            const tierData = tiers[tierKey];
            const sortedMembers = sortCategoryMembers(tierKey, tierData.members);
            if (sortedMembers.length > 0) {
                html += `
                    <div class="hierarchy-section" data-tier="${tierKey}">
                        <h4 class="tier-title">${tierData.title}</h4>
                        <div class="team-grid tier-grid-1">
                            ${sortedMembers.map(m => {
                                const initials = (m.name || 'M').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                const avatarHtml = m.photo ? 
                                    `<img src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 1.5rem auto 0.5rem; border: 3px solid var(--primary-light); display: block; box-shadow: var(--shadow-md);">` :
                                    `<div class="avatar-placeholder" style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; margin: 1.5rem auto 0.5rem; border: 3px solid var(--primary-light); box-shadow: var(--shadow-md);">${initials}</div>`;

                                const linkedinHtml = m.linkedin ? `
                                    <div style="margin-top: 0.75rem;">
                                        <a href="${escapeHtml(m.linkedin)}" target="_blank" style="color: #0077b5; font-size: 0.85rem; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 0.3rem;">
                                            <span>LinkedIn</span> ↗
                                        </a>
                                    </div>
                                ` : '';

                                return `
                                    <div class="team-card">
                                        ${avatarHtml}
                                        <div class="team-info">
                                            <h3 class="team-name">${escapeHtml(m.name)}</h3>
                                            <span class="team-role">${escapeHtml(m.role)}</span>
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

    window.renderDynamicTeamGrid = renderDynamicTeamGrid;

    function parseAchievementMeta(item) {
        let teamName = '';
        let members = '';
        let description = item.description || '';
        let photos = [];

        if (item.team_name) {
            try {
                const parsed = JSON.parse(item.team_name);
                if (parsed && typeof parsed === 'object') {
                    teamName = parsed.teamName || parsed.team || '';
                    members = parsed.members || '';
                    if (parsed.description) description = parsed.description;
                    if (Array.isArray(parsed.photos)) photos = parsed.photos;
                } else {
                    teamName = item.team_name;
                }
            } catch (e) {
                teamName = item.team_name;
            }
        }

        if (!members && teamName.includes('(') && teamName.includes(')')) {
            const match = teamName.match(/^(.*?)\((.*?)\)$/);
            if (match) {
                teamName = match[1].trim();
                members = match[2].trim();
            }
        }

        if (photos.length === 0 && item.image_url) {
            photos.push(item.image_url);
        }

        return {
            id: item.id,
            title: item.event_name || item.title || 'Untitled Competition',
            position: item.position || item.category || 'Winner',
            year: item.year || item.date_label || '2026',
            teamName: teamName || 'Team Grandeur',
            members: members || '',
            description: description,
            photos: photos
        };
    }

    function renderDynamicAchievements(achievementsList, container) {
        if (!container) return;
        if (!achievementsList || achievementsList.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No achievements published yet. Check back soon!</div>`;
            return;
        }

        const sorted = [...achievementsList].sort((a, b) => {
            const metaA = parseAchievementMeta(a);
            const metaB = parseAchievementMeta(b);
            return parseInt(metaB.year, 10) - parseInt(metaA.year, 10);
        });

        container.innerHTML = sorted.map((item, cardIdx) => {
            const meta = parseAchievementMeta(item);
            
            const posLower = meta.position.toLowerCase();
            let rankClass = 'rank-general';
            let rankIcon = '🏆';
            if (posLower.includes('1st') || posLower.includes('winner')) {
                rankClass = 'rank-gold';
                rankIcon = '🥇';
            } else if (posLower.includes('2nd') || posLower.includes('runner')) {
                rankClass = 'rank-silver';
                rankIcon = '🥈';
            } else if (posLower.includes('3rd') || posLower.includes('podium')) {
                rankClass = 'rank-bronze';
                rankIcon = '🥉';
            } else if (posLower.includes('finalist') || posLower.includes('qualifier')) {
                rankClass = 'rank-general';
                rankIcon = '🌟';
            }

            let mediaHtml = '';
            if (meta.photos.length > 0) {
                const slides = meta.photos.map((src, i) => `
                    <img src="${escapeHtml(src)}" class="achievement-media-slide ${i === 0 ? 'active' : ''}" alt="${escapeHtml(meta.title)}" data-slide-idx="${i}">
                `).join('');

                const dots = meta.photos.length > 1 ? `
                    <div class="achievement-slider-dots">
                        ${meta.photos.map((_, i) => `<span class="achievement-slider-dot ${i === 0 ? 'active' : ''}" data-dot-idx="${i}"></span>`).join('')}
                    </div>
                ` : '';

                mediaHtml = `
                    <div class="achievement-card-media" id="achieve-card-media-${cardIdx}">
                        ${slides}
                        ${dots}
                        <span class="achievement-year-badge">${escapeHtml(meta.year)}</span>
                        <span class="achievement-rank-pill ${rankClass}">${rankIcon} ${escapeHtml(meta.position)}</span>
                    </div>
                `;
            } else {
                mediaHtml = `
                    <div class="achievement-card-media" style="display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, var(--primary) 0%, #1e293b 100%);">
                        <span style="font-size: 4rem; opacity: 0.85;">🏆</span>
                        <span class="achievement-year-badge">${escapeHtml(meta.year)}</span>
                        <span class="achievement-rank-pill ${rankClass}">${rankIcon} ${escapeHtml(meta.position)}</span>
                    </div>
                `;
            }

            return `
                <div class="achievement-live-card" data-card-index="${cardIdx}">
                    ${mediaHtml}
                    <div class="achievement-card-content">
                        <h3 class="achievement-card-title">${escapeHtml(meta.title)}</h3>
                        <div class="achievement-card-team-name">
                            <span>🏆</span> <strong>Team:</strong> ${escapeHtml(meta.teamName)}
                        </div>
                        ${meta.members ? `
                        <div class="achievement-card-team-members">
                            <span>👥</span> <strong>Members:</strong> ${escapeHtml(meta.members)}
                        </div>` : ''}
                        <p class="achievement-card-desc">${escapeHtml(meta.description || 'Secured top podium finish demonstrating structured problem solving.')}</p>
                    </div>
                </div>
            `;
        }).join('');

        sorted.forEach((item, cardIdx) => {
            const meta = parseAchievementMeta(item);
            if (meta.photos.length > 1) {
                const mediaBox = document.getElementById(`achieve-card-media-${cardIdx}`);
                if (!mediaBox) return;

                const slides = mediaBox.querySelectorAll('.achievement-media-slide');
                const dots = mediaBox.querySelectorAll('.achievement-slider-dot');
                let currentIdx = 0;

                function goToSlide(idx) {
                    currentIdx = idx;
                    slides.forEach((s, i) => s.classList.toggle('active', i === currentIdx));
                    dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
                }

                const autoTimer = setInterval(() => {
                    goToSlide((currentIdx + 1) % slides.length);
                }, 3000);

                dots.forEach((dot, i) => {
                    dot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clearInterval(autoTimer);
                        goToSlide(i);
                    });
                });
            }
        });
    }

    window.renderDynamicAchievements = renderDynamicAchievements;

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Execute sync
    syncGrandeurCMS();
    window.addEventListener('grandeur_store_updated', syncGrandeurCMS);
});





