document.addEventListener('DOMContentLoaded', () => {

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const hamburgerHint = document.querySelector('.hamburger-hint');
    const sectionNavPrev = document.querySelector('.section-nav .prev');
    const sectionNavNext = document.querySelector('.section-nav .next');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeHint = document.querySelector('.theme-hint');
    const progressBar = document.querySelector('.progress-fill');
    const backToTop = document.querySelector('.back-to-top');
    const glitchLogo = document.querySelector('.main-logo-glitch');

    // NEW - Handle login/logout display
    const loginLogoutLink = document.getElementById('login-logout-link');
    const userInfoNav = document.querySelector('.user-info-nav');
    const nicknameDisplay = document.querySelector('.nickname-display');
    const addBlogNav = document.getElementById('add-blog-nav');

    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        const nickname = localStorage.getItem('nickname');

        if (token && nickname && loginLogoutLink && userInfoNav && nicknameDisplay && addBlogNav) {
            // User is logged in
            nicknameDisplay.textContent = `Welcome, ${nickname}`;
            userInfoNav.style.display = 'block';
            
            addBlogNav.style.display = 'block';
            const addBlogLink = addBlogNav.querySelector('a');
            if (addBlogLink) {
                addBlogLink.innerHTML = '<i class="fas fa-th-large"></i> My Dashboard';
            }

            loginLogoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginLogoutLink.href = '#'; // Prevent navigation
            loginLogoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('nickname');
                window.location.reload(); // Refresh to update UI
            });
        } else {
            // User is logged out - ensure default state
            if(userInfoNav) userInfoNav.style.display = 'none';
            if(addBlogNav) addBlogNav.style.display = 'none';
            if(loginLogoutLink) {
                 loginLogoutLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                 loginLogoutLink.href = '/login';
            }
        }
    };
    // END NEW

    let currentSectionIndex = 0;

    // Progress bar functionality
    const updateProgressBar = () => {
        if (progressBar) {
            const totalSections = sections.length;
            const progress = ((currentSectionIndex + 1) / totalSections) * 100;
            progressBar.style.width = `${progress}%`;
        }
    };

    // Back to top functionality
    const showBackToTop = () => {
        if (backToTop) {
            if (currentSectionIndex > 0) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    };

    // Back to top click handler
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            showSection(0); // Go to home section
        });
    }

    // Theme toggle functionality
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        if (themeIcon) {
            if (newTheme === 'light') {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    };

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set initial icon
    if (themeIcon) {
        if (savedTheme === 'light') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleTheme();
            // Hide hint on first click
            if (themeHint) {
                themeHint.style.display = 'none';
            }
        });
    }

    // Open/close sidebar on mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            updateGlitchLogoVisibility();
            // Hide hint on first click
            if (hamburgerHint) {
                hamburgerHint.style.display = 'none';
            }
        });
    }

    // Function to show a specific section
    const showSection = (index) => {
        if (index < 0 || index >= sections.length) {
            return; // Out of bounds
        }

        // Hide current section
        const currentActiveSection = document.querySelector('.section.active');
        if (currentActiveSection) {
            currentActiveSection.classList.remove('active');
        }

        // Show new section
        sections[index].classList.add('active');
        currentSectionIndex = index;
        updateActiveNavLink();
        updateProgressBar();
        showBackToTop();
        updateNavigationArrows();

        // Close sidebar after navigation on mobile
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    };

    // Update active navigation link
    const updateActiveNavLink = () => {
        navLinks.forEach(link => link.classList.remove('active'));
        
        const activeSectionId = sections[currentSectionIndex].id;
        // The GitHub link in the nav doesn't correspond to a section, so we check for it
        const activeLink = document.querySelector(`.nav-link[href="#${activeSectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    };

    // Update navigation arrows visibility
    const updateNavigationArrows = () => {
        if (sectionNavPrev) {
            if (currentSectionIndex === 0) {
                sectionNavPrev.style.opacity = '0.3';
                sectionNavPrev.style.pointerEvents = 'none';
            } else {
                sectionNavPrev.style.opacity = '1';
                sectionNavPrev.style.pointerEvents = 'auto';
            }
        }
        
        if (sectionNavNext) {
            if (currentSectionIndex === sections.length - 1) {
                sectionNavNext.style.opacity = '0.3';
                sectionNavNext.style.pointerEvents = 'none';
            } else {
                sectionNavNext.style.opacity = '1';
                sectionNavNext.style.pointerEvents = 'auto';
            }
        }
    };

    // ===== Section Management =====
    function setActiveSection(sectionId, shouldPushState = true) {
        let targetId = sectionId;
        if (!document.querySelector(targetId)) {
            targetId = '#home';
        }

        currentSectionIndex = Array.from(sections).findIndex(s => s.id === targetId.substring(1));
        if (currentSectionIndex === -1) currentSectionIndex = 0;

        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        const targetLink = document.querySelector(`.nav-link[href="${targetId}"]`);
        const targetSection = document.querySelector(targetId);

        if (targetLink && targetSection) {
            targetLink.classList.add('active');
            targetSection.classList.add('active');
            localStorage.setItem('activeSection', targetId);
            if (shouldPushState) {
                history.pushState(null, null, targetId);
            }
        }
        updateProgressBar();
        showBackToTop();
        updateNavigationArrows();
    }

    // ===== Event Listeners =====

    // **Consolidated Navigation Link Click Handler**
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                setActiveSection(targetId);
                 if (sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    updateGlitchLogoVisibility();
                }
            }
            // For external links like '/login', do nothing and let the browser navigate.
        });
    });

    // **Section Navigation Arrows Event Listeners**
    if (sectionNavPrev) {
        sectionNavPrev.addEventListener('click', (e) => {
            e.preventDefault();
            const prevIndex = currentSectionIndex - 1;
            if (prevIndex >= 0) {
                showSection(prevIndex);
            }
        });
    }
    
    if (sectionNavNext) {
        sectionNavNext.addEventListener('click', (e) => {
            e.preventDefault();
            const nextIndex = currentSectionIndex + 1;
            if (nextIndex < sections.length) {
                showSection(nextIndex);
            }
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash || '#home';
        setActiveSection(hash, false);
    });

    // ===== Initial Page Load =====
    const urlHash = window.location.hash;
    const savedSection = localStorage.getItem('activeSection');
    let initialSection = (urlHash && document.querySelector(urlHash)) ? urlHash : (savedSection && document.querySelector(savedSection)) ? savedSection : '#home';
    setActiveSection(initialSection, true); 
    
    // NEW Call to check login status on page load
    checkLoginStatus();

    updateGlitchLogoVisibility();
    window.addEventListener('resize', updateGlitchLogoVisibility);

    // ===== Theme Toggle =====

    // Typing Animation Logic
    const type = async (targetElement, text, speed = 80) => {
        for (let i = 0; i < text.length; i++) {
            targetElement.innerHTML += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    };

    const typeInsideSpan = async (targetElement, text, className, speed = 80) => {
        const span = document.createElement('span');
        span.className = className;
        targetElement.appendChild(span);
        for (let i = 0; i < text.length; i++) {
            span.innerHTML += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    };

    const startTypingAnimation = async () => {
        const typingLine1 = document.getElementById('typing-line-1');
        const typingLine2 = document.getElementById('typing-line-2');
        const typingLine3 = document.getElementById('typing-line-3');

        // Check if all elements exist
        if (!typingLine1 || !typingLine2 || !typingLine3) {
            console.warn('Typing animation elements not found');
            return;
        }

        const line1_part1 = "My name is ";
        const line1_part2_highlight = "Stefan Ramač";
        const line2_part1 = "and I'm an ";
        const line2_part2_highlight = "Integration Specialist.";
        const line3 = "With a passion for architecting and developing seamless software solutions, I thrive on optimizing data exchange and enhancing system connectivity to solve complex challenges and drive business success.";

        // Line 1
        typingLine1.classList.add('typing-cursor');
        await type(typingLine1, line1_part1);
        await typeInsideSpan(typingLine1, line1_part2_highlight, 'highlight');
        typingLine1.classList.remove('typing-cursor');
        
        await new Promise(resolve => setTimeout(resolve, 300));

        // Line 2
        typingLine2.classList.add('typing-cursor');
        await type(typingLine2, line2_part1);
        await typeInsideSpan(typingLine2, line2_part2_highlight, 'highlight');
        typingLine2.classList.remove('typing-cursor');
        
        // Show navigation arrows now
        const sectionNav = document.querySelector('.section-nav');
        if (sectionNav) {
            sectionNav.classList.add('visible');
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Line 3 - Description
        typingLine3.classList.add('typing-cursor');
        await type(typingLine3, line3, 30);
        typingLine3.classList.add('typing-cursor');
    };

    startTypingAnimation();

    // Formspree AJAX submission
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");

    if (form) {
    async function handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        fetch(event.target.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                    if (status) {
                status.innerHTML = "Thank you for your message. I will get back to you as soon as possible.";
                    }
                form.reset();
            } else {
                response.json().then(data => {
                        if (status) {
                    if (Object.hasOwn(data, 'errors')) {
                        status.innerHTML = data["errors"].map(error => error["message"]).join(", ")
                    } else {
                        status.innerHTML = "Oops! There was a problem submitting your form.";
                            }
                    }
                })
            }
        }).catch(error => {
                if (status) {
            status.innerHTML = "Oops! There was a problem submitting your form.";
                }
            });
        }
        form.addEventListener("submit", handleSubmit);
    }

    // Timeline animation functionality
    const animateTimeline = () => {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, index * 200); // 200ms delay between each item
        });
    };

    // Skills and certificates animation
    const animateSkills = () => {
        const skillsContainer = document.querySelector('.skills-container');
        const certificatesContainer = document.querySelector('.certificates-container');
        const skillSpans = document.querySelectorAll('.skills-list span');
        const certificateItems = document.querySelectorAll('.certificates-list p');
        
        if (skillsContainer) {
            skillsContainer.classList.add('animate');
            
            skillSpans.forEach((span, index) => {
                setTimeout(() => {
                    span.classList.add('animate');
                }, index * 100); // 100ms delay between each skill
            });
        }
        
        if (certificatesContainer) {
            setTimeout(() => {
                certificatesContainer.classList.add('animate');
                
                certificateItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate');
                    }, index * 150); // 150ms delay between each certificate
                });
            }, 500); // Start after skills animation
        }
    };

    // Intersection Observer for timeline animation
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateTimeline();
                    animateSkills();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(experienceSection);
    }

    // Game functionality
    const gameSection = document.querySelector('#game');
    if (gameSection) {
        let gameScore = 0;
        let gameTimer = 60;
        let gameLevel = 1;
        let gameInterval;
        let isGameActive = false;
        let connectedPairs = 0;
        const totalPairs = 4;

        const scoreElement = document.getElementById('game-score');
        const timerElement = document.getElementById('game-timer');
        const levelElement = document.getElementById('game-level');
        const messageElement = document.getElementById('game-message');
        const startButton = document.getElementById('start-game');
        const resetButton = document.getElementById('reset-game');

        // Drag and drop functionality with touch support
        let draggedElement = null;
        let touchStartX = 0;
        let touchStartY = 0;

        const systems = document.querySelectorAll('.system');
        const targets = document.querySelectorAll('.system-target');
        const connectionLines = document.querySelectorAll('.connection-line');

        systems.forEach(system => {
            // Mouse events
            system.addEventListener('dragstart', (e) => {
                draggedElement = system;
                system.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            system.addEventListener('dragend', () => {
                system.classList.remove('dragging');
                draggedElement = null;
            });

            // Touch events for mobile
            system.addEventListener('touchstart', (e) => {
                e.preventDefault();
                draggedElement = system;
                system.classList.add('dragging');
                
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            });

            system.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (draggedElement) {
                    const touch = e.touches[0];
                    const deltaX = touch.clientX - touchStartX;
                    const deltaY = touch.clientY - touchStartY;
                    
                    // Move the dragged element
                    draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                }
            });

            system.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (draggedElement) {
                    draggedElement.classList.remove('dragging');
                    draggedElement.style.transform = '';
                    draggedElement = null;
                }
            });
        });

        targets.forEach((target, index) => {
            // Mouse events
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (draggedElement && !target.classList.contains('connected')) {
                    target.classList.add('valid-drop');
                }
            });

            target.addEventListener('dragleave', () => {
                target.classList.remove('valid-drop');
            });

            target.addEventListener('drop', (e) => {
                e.preventDefault();
                handleConnection(target, index);
            });

            // Touch events for mobile
            target.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (draggedElement && !target.classList.contains('connected')) {
                    target.classList.add('valid-drop');
                }
            });

            target.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (draggedElement) {
                    handleConnection(target, index);
                }
            });

            target.addEventListener('touchmove', (e) => {
                e.preventDefault();
                // Remove valid-drop class when touch moves away
                if (draggedElement) {
                    const touch = e.touches[0];
                    const rect = target.getBoundingClientRect();
                    
                    if (touch.clientX < rect.left || touch.clientX > rect.right ||
                        touch.clientY < rect.top || touch.clientY > rect.bottom) {
                        target.classList.remove('valid-drop');
                    }
                }
            });
        });

        function handleConnection(target, index) {
            target.classList.remove('valid-drop');
            
            if (draggedElement && !target.classList.contains('connected')) {
                const systemType = draggedElement.getAttribute('data-system');
                const targetType = target.getAttribute('data-target');
                
                if (systemType === targetType) {
                    // Correct connection
                    target.classList.add('connected');
                    draggedElement.style.opacity = '0.3';
                    draggedElement.style.pointerEvents = 'none';
                    connectionLines[index].classList.add('connected');
                    
                    connectedPairs++;
                    gameScore += 100 * gameLevel;
                    scoreElement.textContent = gameScore;
                    
                    showMessage('Perfect connection! +' + (100 * gameLevel) + ' points', 'success');
                    
                    if (connectedPairs === totalPairs) {
                        endGame(true);
                    }
                } else {
                    // Wrong connection
                    gameScore = Math.max(0, gameScore - 50);
                    scoreElement.textContent = gameScore;
                    showMessage('Wrong connection! -50 points', 'error');
                }
            }
        }

        function startGame() {
            if (isGameActive) return;
            
            isGameActive = true;
            connectedPairs = 0;
            gameScore = 0;
            gameTimer = 60 - (gameLevel - 1) * 10; // Less time for higher levels
            const currentLevel = gameLevel;
            
            scoreElement.textContent = gameScore;
            timerElement.textContent = gameTimer;
            levelElement.textContent = currentLevel;
            
            // Reset all connections
            systems.forEach(system => {
                system.style.opacity = '1';
                system.style.pointerEvents = 'auto';
            });
            
            targets.forEach(target => {
                target.classList.remove('connected');
            });
            
            connectionLines.forEach(line => {
                line.classList.remove('connected');
            });
            
            // Add level-specific challenges
            if (currentLevel >= 2) {
                // Shuffle systems for higher levels
                shuffleSystems();
            }
            
            if (currentLevel >= 3) {
                // Add visual distraction (blinking effect)
                addVisualDistraction();
            }
            
            startButton.disabled = true;
            showMessage(`Level ${currentLevel} started! Connect the systems!`, 'success');
            
            gameInterval = setInterval(() => {
                gameTimer--;
                timerElement.textContent = gameTimer;
                
                if (gameTimer <= 0) {
                    endGame(false);
                }
            }, 1000);
        }

        function shuffleSystems() {
            const systemsArray = Array.from(systems);
            const shuffledSystems = systemsArray.sort(() => Math.random() - 0.5);
            
            const systemsLeft = document.querySelector('.systems-left');
            systemsLeft.innerHTML = '';
            
            shuffledSystems.forEach(system => {
                systemsLeft.appendChild(system);
            });
            
            // Reattach event listeners for both mouse and touch
            systems.forEach(system => {
                // Mouse events
                system.addEventListener('dragstart', (e) => {
                    draggedElement = system;
                    system.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });

                system.addEventListener('dragend', () => {
                    system.classList.remove('dragging');
                    draggedElement = null;
                });

                // Touch events for mobile
                system.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    draggedElement = system;
                    system.classList.add('dragging');
                    
                    const touch = e.touches[0];
                    touchStartX = touch.clientX;
                    touchStartY = touch.clientY;
                });

                system.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    if (draggedElement) {
                        const touch = e.touches[0];
                        const deltaX = touch.clientX - touchStartX;
                        const deltaY = touch.clientY - touchStartY;
                        
                        // Move the dragged element
                        draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                    }
                });

                system.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    if (draggedElement) {
                        draggedElement.classList.remove('dragging');
                        draggedElement.style.transform = '';
                        draggedElement = null;
                    }
                });
            });
        }

        function addVisualDistraction() {
            // Add subtle blinking effect to some systems
            const randomSystems = Array.from(systems).sort(() => Math.random() - 0.5).slice(0, 2);
            
            randomSystems.forEach(system => {
                system.style.animation = 'blink-subtle 2s infinite';
            });
        }

        function endGame(won) {
            isGameActive = false;
            clearInterval(gameInterval);
            startButton.disabled = false;
            
            // Remove any visual distractions
            systems.forEach(system => {
                system.style.animation = '';
            });
            
            if (won) {
                showMessage(`Level ${gameLevel} completed! Final score: ${gameScore}`, 'success');
                gameLevel++;
                levelElement.textContent = gameLevel;
                
                // Update button text for next level
                startButton.textContent = `Start Level ${gameLevel}`;
                
                // Show level completion message
                setTimeout(() => {
                    showMessage(`Get ready for Level ${gameLevel}! Time limit: ${60 - (gameLevel - 1) * 10}s`, 'success');
                }, 2000);
            } else {
                showMessage(`Time's up! Final score: ${gameScore}`, 'error');
                // Reset to level 1 if failed
                gameLevel = 1;
                levelElement.textContent = gameLevel;
                startButton.textContent = 'Start Game';
            }
        }

        function resetGame() {
            if (isGameActive) {
                clearInterval(gameInterval);
            }
            
            isGameActive = false;
            connectedPairs = 0;
            gameScore = 0;
            gameTimer = 60;
            gameLevel = 1;
            
            scoreElement.textContent = gameScore;
            timerElement.textContent = gameTimer;
            levelElement.textContent = gameLevel;
            startButton.textContent = 'Start Game';
            
            // Reset all connections and remove any touch transforms
            systems.forEach(system => {
                system.style.opacity = '1';
                system.style.pointerEvents = 'auto';
                system.style.animation = ''; // Remove any animations
                system.style.transform = ''; // Remove any touch transforms
                system.classList.remove('dragging');
            });
            
            targets.forEach(target => {
                target.classList.remove('connected');
                target.classList.remove('valid-drop');
            });
            
            connectionLines.forEach(line => {
                line.classList.remove('connected');
            });
            
            // Reset systems order to original
            const systemsLeft = document.querySelector('.systems-left');
            const originalOrder = ['java', 'webmethods', 'azure', 'mongodb'];
            
            originalOrder.forEach(systemType => {
                const system = document.querySelector(`[data-system="${systemType}"]`);
                if (system) {
                    systemsLeft.appendChild(system);
                }
            });
            
            // Clear any dragged element state
            draggedElement = null;
            
            startButton.disabled = false;
            showMessage('Game reset to Level 1!', 'success');
        }

        function showMessage(text, type) {
            messageElement.textContent = text;
            messageElement.className = `game-message ${type}`;
            
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'game-message';
            }, 3000);
        }

        // Event listeners
        if (startButton) {
            startButton.addEventListener('click', startGame);
        }
        
        if (resetButton) {
            resetButton.addEventListener('click', resetGame);
        }
    }

    // FAQ functionality
    const faqSection = document.querySelector('#faq');
    if (faqSection) {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    // Blog filter functionality
    const blogSection = document.querySelector('#blog');
    if (blogSection) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const blogCards = document.querySelectorAll('.blog-card');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter blog cards
                blogCards.forEach(card => {
                    const categories = card.getAttribute('data-category');
                    
                    if (filter === 'all' || categories.includes(filter)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Add fadeIn animation for blog cards
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // ===== Caching Strategies =====
    
    // Cache DOM queries for better performance
    const cachedElements = {
        sidebar: document.querySelector('.sidebar'),
        mainContent: document.querySelector('.main-content'),
        sections: document.querySelectorAll('.section'),
        navLinks: document.querySelectorAll('.nav-link'),
        themeToggle: document.querySelector('.theme-toggle'),
        menuToggle: document.querySelector('.menu-toggle'),
        backToTop: document.querySelector('.back-to-top'),
        progressBar: document.querySelector('.progress-fill')
    };

    // Preload critical resources
    function preloadCriticalResources() {
        const criticalResources = [
            'img/profile-pic.jpeg',
            'css/style.css',
            'js/main.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.includes('.css') ? 'style' : 
                     resource.includes('.js') ? 'script' : 'image';
            document.head.appendChild(link);
        });
    }

    // Lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Debounce function for performance
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

    // Optimize scroll events
    const optimizedScrollHandler = debounce(() => {
        updateProgressBar();
        showBackToTop();
    }, 16); // ~60fps

    window.addEventListener('scroll', optimizedScrollHandler);

    // Cache theme preference
    function cacheThemePreference(theme) {
        localStorage.setItem('theme', theme);
        // Also cache in session storage for faster access
        sessionStorage.setItem('theme', theme);
    }

    // Initialize performance optimizations
    preloadCriticalResources();
    lazyLoadImages();

    // Service Worker update notification
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker activated');
        });
    }

    // Function to fetch and display categories
    async function loadCategories() {
        const filtersContainer = document.querySelector('.blog-filters');
        if (!filtersContainer) return;

        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const categories = await response.json();

            // Clear any existing buttons and add the "All" button first
            filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All</button>';
            
            categories.forEach(category => {
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.setAttribute('data-filter', category);
                button.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
                filtersContainer.appendChild(button);
            });

        } catch (error) {
            console.error("Failed to load categories:", error);
            // Even if categories fail to load, ensure "All" button is there
            if (!filtersContainer.querySelector('[data-filter="all"]')) {
                 filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">All</button>';
            }
        }
    }

    // Function to fetch and display blog posts
    async function loadBlogPosts() {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return;

        try {
            // Fetch posts from our server
            const response = await fetch('/api/posts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const posts = await response.json();

            blogGrid.innerHTML = ''; // Clear existing content

            if (posts.length === 0) {
                blogGrid.innerHTML = '<p>No blog posts found.</p>';
                return;
            }

            posts.forEach(post => {
                const postElement = document.createElement('article');
                postElement.className = 'blog-card';
                postElement.setAttribute('data-category', post.categories.join(' '));

                const postDate = new Date(post.publishDate).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                postElement.innerHTML = `
                    <div class="blog-image">
                        <img src="${post.imageUrl}" alt="${post.title}">
                        <div class="blog-category">${post.mainCategory}</div>
                    </div>
                    <div class="blog-content">
                        <h3>${post.title}</h3>
                        <p>${post.summary}</p>
                        <div class="blog-meta">
                            <span class="reading-time"><i class="far fa-clock"></i> ${post.readingTime} min read</span>
                            <span class="publish-date"><i class="far fa-calendar"></i> ${postDate}</span>
                        </div>
                        <a href="${post.link}" target="_blank" class="blog-link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                blogGrid.appendChild(postElement);
            });
            
            // Load categories and then initialize filters
            await loadCategories();
            initializeBlogFilters();

        } catch (error) {
            console.error("Failed to load blog posts:", error);
            blogGrid.innerHTML = '<p>Failed to load blog posts. Please try again later.</p>';
        }
    }

    // Updated Blog filter functionality to be re-usable
    function initializeBlogFilters() {
        const blogSection = document.querySelector('#blog');
        if (blogSection) {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const blogCards = document.querySelectorAll('.blog-card');
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.getAttribute('data-filter');
                    
                    // Update active button
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Filter blog cards
                    blogCards.forEach(card => {
                        const categories = card.getAttribute('data-category');
                        
                        if (filter === 'all' || (categories && categories.includes(filter))) {
                            card.style.display = 'block';
                            card.style.animation = 'fadeIn 0.5s ease';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });
        }
    }
    
    // Initial call to load posts, which will then load categories and set up filters
    loadBlogPosts();

    // Function to control glitch logo visibility
    function updateGlitchLogoVisibility() {
        if (!glitchLogo || !sidebar) return;
        if (window.innerWidth <= 768) {
            glitchLogo.classList.toggle('visible', !sidebar.classList.contains('open'));
        } else {
            glitchLogo.classList.remove('visible');
        }
    }

}); 