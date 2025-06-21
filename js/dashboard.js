document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // --- DOM Elements ---
    const addPostForm = document.getElementById('add-post-form');
    const addPostStatusDiv = document.getElementById('add-post-status');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');

    // --- Functions ---

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nickname');
        window.location.href = '/login';
    };
    
    // --- Event Listeners ---

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnSidebar) logoutBtnSidebar.addEventListener('click', handleLogout);
    
    addPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        addPostStatusDiv.textContent = '';
        addPostStatusDiv.style.color = 'inherit';

        const postData = {
            title: document.getElementById('title').value,
            summary: document.getElementById('summary').value,
            imageUrl: document.getElementById('imageUrl').value,
            mainCategory: document.getElementById('mainCategory').value,
            categories: document.getElementById('categories').value,
            readingTime: document.getElementById('readingTime').value,
            link: document.getElementById('link').value,
        };

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            const data = await res.json();

            if (res.ok) {
                addPostStatusDiv.textContent = 'Post added successfully!';
                addPostStatusDiv.style.color = '#2ecc71';
                addPostForm.reset();
            } else {
                throw new Error(data.message || 'Failed to add post');
            }

        } catch (error) {
            addPostStatusDiv.textContent = error.message;
            addPostStatusDiv.style.color = '#e74c3c';
        }
    });
}); 