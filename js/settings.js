document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const form = document.getElementById('settings-form');
    const nameInput = document.getElementById('name');
    const lastnameInput = document.getElementById('lastname');
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageContainer = document.getElementById('message-container');

    // Fetch user data and populate the form
    fetch('/api/user', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(user => {
        if (user) {
            nameInput.value = user.name || '';
            lastnameInput.value = user.lastname || '';
            nicknameInput.value = user.nickname || '';
            emailInput.value = user.email || '';
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        messageContainer.textContent = 'Error loading your profile data.';
        messageContainer.className = 'message-error';
    });

    // Handle form submission
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Clear previous messages
        messageContainer.textContent = '';

        // Password validation
        if (passwordInput.value !== confirmPasswordInput.value) {
            messageContainer.textContent = "Passwords do not match. Please try again.";
            messageContainer.className = 'message-error';
            return;
        }

        const updatedData = {
            name: nameInput.value,
            lastname: lastnameInput.value,
            nickname: nicknameInput.value,
        };

        if (passwordInput.value) {
            updatedData.password = passwordInput.value;
        }

        fetch('/api/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message) });
            }
            return response.json();
        })
        .then(data => {
            messageContainer.textContent = data.message;
            messageContainer.className = 'message-success';
            
            // Update nickname in local storage if it was changed
            if(localStorage.getItem('nickname') !== updatedData.nickname) {
                localStorage.setItem('nickname', updatedData.nickname);
            }

            // Clear password fields
            passwordInput.value = '';
            confirmPasswordInput.value = '';

            setTimeout(() => {
                messageContainer.textContent = '';
            }, 3000);
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            messageContainer.textContent = error.message || 'Failed to update profile. Please try again.';
            messageContainer.className = 'message-error';
        });
    });
}); 