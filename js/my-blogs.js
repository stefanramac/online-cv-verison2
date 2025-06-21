document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const postsContainer = document.getElementById('my-blogs-container');
    const statusDiv = document.getElementById('my-blogs-status');
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nickname');
        window.location.href = '/login';
    };

    if (logoutBtnSidebar) {
        logoutBtnSidebar.addEventListener('click', handleLogout);
    }

    const fetchMyPosts = async () => {
        try {
            statusDiv.textContent = 'Loading your posts...';
            const res = await fetch('/api/myposts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch your posts.');
            }

            const posts = await res.json();
            statusDiv.textContent = '';
            
            if (posts.length === 0) {
                statusDiv.textContent = "You haven't created any posts yet.";
                return;
            }

            postsContainer.innerHTML = '';
            posts.forEach(post => {
                const postCard = document.createElement('div');
                postCard.className = 'blog-post-card';
                postCard.innerHTML = `
                    <img src="${post.imageUrl}" alt="${post.title}" class="card-img">
                    <div class="card-content">
                        <h3 class="card-title">${post.title}</h3>
                        <p class="card-summary">${post.summary}</p>
                        <div class="card-actions">
                            <a href="/edit-post?id=${post._id}" class="btn-update">Update</a>
                            <button class="btn-delete" data-post-id="${post._id}">Delete</button>
                        </div>
                    </div>
                `;
                postsContainer.appendChild(postCard);
            });

        } catch (error) {
            statusDiv.textContent = error.message;
            statusDiv.style.color = '#e74c3c';
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchMyPosts(); // Refresh list after deletion
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete post.');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    postsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.btn-delete')) {
            const postId = e.target.getAttribute('data-post-id');
            handleDeletePost(postId);
        }
    });

    fetchMyPosts();
}); 