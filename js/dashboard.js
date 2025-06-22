document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const nickname = localStorage.getItem('nickname');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    // --- DOM Elements ---
    const userNicknameEl = document.getElementById('user-nickname');
    const welcomeMessageEl = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');

    // --- Functions ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nickname');
        window.location.href = '/login';
    };

    // --- Initial Setup ---
    if (nickname) {
        userNicknameEl.textContent = nickname;
        welcomeMessageEl.textContent = `Welcome, ${nickname}!`;
    } else {
        welcomeMessageEl.textContent = 'Welcome to your Dashboard!';
    }
    
    // --- Event Listeners ---
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnSidebar) logoutBtnSidebar.addEventListener('click', handleLogout);
}); 