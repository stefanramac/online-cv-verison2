document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const statusDiv = document.getElementById('register-status');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = e.target.name.value;
        const lastname = e.target.lastname.value;
        const nickname = e.target.nickname.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        statusDiv.textContent = '';
        statusDiv.style.color = 'inherit';

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, lastname, nickname, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                statusDiv.textContent = 'Registration successful! You can now log in.';
                statusDiv.style.color = '#2ecc71';
                registerForm.reset();
                 setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            statusDiv.textContent = error.message;
            statusDiv.style.color = '#e74c3c';
        }
    });
}); 