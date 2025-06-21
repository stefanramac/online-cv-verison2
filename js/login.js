document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusDiv = document.getElementById('login-status');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted');

        const email = e.target.email.value;
        const password = e.target.password.value;
        statusDiv.textContent = '';
        statusDiv.style.color = 'inherit';
        console.log(`Attempting to login with email: ${email}`);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            console.log('Fetch response received:', res);

            const data = await res.json();
            console.log('Response data:', data);

            if (res.ok) {
                console.log('Login successful, redirecting to dashboard...');
                localStorage.setItem('token', data.token);
                localStorage.setItem('nickname', data.nickname);
                window.location.href = '/dashboard';
            } else {
                console.error('Login failed:', data.message);
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('An error occurred during login:', error);
            statusDiv.textContent = error.message;
            statusDiv.style.color = '#e74c3c';
        }
    });
}); 