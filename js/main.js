document.addEventListener('DOMContentLoaded', () => {

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const hamburgerHint = document.querySelector('.hamburger-hint');
    const sectionNavPrev = document.querySelector('.section-nav .prev');
    const sectionNavNext = document.querySelector('.section-nav .next');

    let currentSectionIndex = 0;

    // Open/close sidebar on mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
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

    // Click on navigation links
    navLinks.forEach(link => {
        // Exclude external links from this logic
        if (link.target !== '_blank') {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetIndex = Array.from(sections).findIndex(s => s.id === targetId);
                
                if(targetIndex !== -1) {
                    showSection(targetIndex);
                }
            });
        }
    });

    // Section navigation buttons
    if(sectionNavPrev && sectionNavNext) {
        sectionNavPrev.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(currentSectionIndex - 1);
        });
    
        sectionNavNext.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(currentSectionIndex + 1);
        });
    }

    // Initial setup - Show the first section (Home)
    const initialSectionId = window.location.hash ? window.location.hash.substring(1) : 'home';
    const initialIndex = Array.from(sections).findIndex(s => s.id === initialSectionId);
    showSection(initialIndex >= 0 ? initialIndex : 0);

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
        document.querySelector('.section-nav').classList.add('visible');

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
                status.innerHTML = "Thank you for your message. I will get back to you as soon as possible.";
                form.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        status.innerHTML = data["errors"].map(error => error["message"]).join(", ")
                    } else {
                        status.innerHTML = "Oops! There was a problem submitting your form.";
                    }
                })
            }
        }).catch(error => {
            status.innerHTML = "Oops! There was a problem submitting your form.";
        });
    }
    form.addEventListener("submit", handleSubmit);

}); 