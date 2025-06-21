document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const editForm = document.getElementById('edit-post-form');
    const statusDiv = document.getElementById('edit-post-status');
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        window.location.href = '/my-blogs';
        return;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nickname');
        window.location.href = '/login';
    };

    if (logoutBtnSidebar) {
        logoutBtnSidebar.addEventListener('click', handleLogout);
    }
    
    // Form inputs
    const titleInput = document.getElementById('title');
    const summaryInput = document.getElementById('summary');
    const imageUrlInput = document.getElementById('imageUrl');
    const mainCategoryInput = document.getElementById('mainCategory');
    const categoriesInput = document.getElementById('categories');
    const readingTimeInput = document.getElementById('readingTime');
    const linkInput = document.getElementById('link');

    const fetchPostData = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch post data.');
            }
            const post = await res.json();
            
            // Populate the form
            titleInput.value = post.title;
            summaryInput.value = post.summary;
            imageUrlInput.value = post.imageUrl;
            mainCategoryInput.value = post.mainCategory;
            categoriesInput.value = post.categories.join(', ');
            readingTimeInput.value = post.readingTime;
            linkInput.value = post.link;

        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.style.color = '#e74c3c';
        }
    };

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusDiv.textContent = 'Updating...';
        statusDiv.style.color = 'inherit';

        const updatedData = {
            title: titleInput.value,
            summary: summaryInput.value,
            imageUrl: imageUrlInput.value,
            mainCategory: mainCategoryInput.value,
            categories: categoriesInput.value,
            readingTime: readingTimeInput.value,
            link: linkInput.value,
        };

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                statusDiv.textContent = 'Post updated successfully!';
                statusDiv.style.color = '#2ecc71';
                setTimeout(() => {
                    window.location.href = '/my-blogs';
                }, 1500);
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update post.');
            }

        } catch (error) {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.style.color = '#e74c3c';
        }
    });

    fetchPostData();
}); 