document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const glitchLogo = document.querySelector('.main-logo-glitch');

    // Theme toggle functionality
    const toggleTheme = () => {
        if (!document.documentElement) return;
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    };

    const updateThemeIcon = (theme) => {
        if (!themeIcon) return;
        themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (document.documentElement) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    updateThemeIcon(savedTheme);

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const updateGlitchLogoVisibility = () => {
        if (!glitchLogo || !sidebar) return;
        // Show glitch logo only when sidebar is closed and on smaller screens
        const isMobile = window.innerWidth <= 1024;
        if (sidebar.classList.contains('open') || !isMobile) {
            glitchLogo.style.display = 'none';
        } else {
            glitchLogo.style.display = 'block';
        }
    };
    
    // Open/close sidebar on mobile
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            updateGlitchLogoVisibility();
        });
    }

    // Close sidebar when a link is clicked
    if (sidebar) {
        const navLinks = sidebar.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    updateGlitchLogoVisibility();
                }
            });
        });
    }
    
    // Initial state and resize handling
    updateGlitchLogoVisibility();
    window.addEventListener('resize', updateGlitchLogoVisibility);
}); 