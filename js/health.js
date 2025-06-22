document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const updateStatusIndicator = (elementId, status) => {
        const statusIndicator = document.getElementById(elementId);
        if (statusIndicator) {
            const dot = statusIndicator.querySelector('.status-dot');
            const text = statusIndicator.querySelector('.status-text');
            
            text.textContent = status;
            dot.classList.remove('operational', 'unavailable');

            if (status === 'Operational') {
                dot.classList.add('operational');
            } else {
                dot.classList.add('unavailable');
            }
        }
    };

    const fetchAndDisplayStatus = async () => {
        try {
            const res = await fetch('/api/health');
            const data = await res.json();
            
            updateStatusIndicator('api-status', data.api);
            updateStatusIndicator('db-status', data.database);
            updateStatusIndicator('github-status', data.external.github);

        } catch (error) {
            updateStatusIndicator('api-status', 'Unavailable');
            updateStatusIndicator('db-status', 'Unavailable');
            updateStatusIndicator('github-status', 'Unavailable');
        }
    };

    fetchAndDisplayStatus();
    // Refresh status every 30 seconds
    setInterval(fetchAndDisplayStatus, 30000);
}); 