// URL de tu proxy en Vercel o directo al Apps Script si estás en localhost
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'https://script.google.com/macros/s/AKfycbzRIIZ4QcNIWONWs9E2Urtb75SWQskGgzXnNCl7DaXc-0Xaxlwh0tv9s6ZW0oj1iBvD/exec' 
    : 'https://tu-proyecto.vercel.app/api/proxy';

// Convierte "HH:mm" en formato AM/PM
const formatHora = (horaStr) => {
    if (!horaStr) return 'N/A';
    const [hh, mm] = horaStr.split(':').map(Number);
    if (isNaN(hh) || isNaN(mm)) return horaStr;
    const ampm = hh >= 12 ? 'p. m.' : 'a. m.';
    const h12 = hh % 12 || 12;
    return `${h12}:${String(mm).padStart(2,'0')} ${ampm}`;
};

document.addEventListener('DOMContentLoaded', () => {
    // ===== LOGIN =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageEl = document.getElementById('message');

            const params = new URLSearchParams({ action: 'login', username, password });

            try {
                const response = await fetch(`${API_URL}?${params.toString()}`);
                const result = await response.json();

                if (result.success) {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    window.location.href = 'turnos.html';
                } else {
                    messageEl.textContent = '❌ ' + result.message;
                }
            } catch (error) {
                console.error('Error de autenticación:', error);
                messageEl.textContent = '❌ Error de conexión. Inténtalo de nuevo.';
            }
        });
    }

    // ===== TURNOS =====
    const turnosContainer = document.querySelector('.turnos-page');
    if (turnosContainer) {
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'index.html';
            return;
        }

        const filterBtn = document.getElementById('filterBtn');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const turnosTableBody = document.querySelector('#turnosTable tbody');
        const tableMessage = document.getElementById('tableMessage');

        // Mensaje inicial
        turnosTableBody.innerHTML = '';
        tableMessage.textContent = 'Selecciona un rango de fechas y haz clic en Buscar.';

        const fetchTurnos = async (startDate, endDate) => {
            tableMessage.textContent = 'Cargando...';
            turnosTableBody.innerHTML = '';

            const params = new URLSearchParams({ action: 'getTurnos', startDate, endDate });

            try {
                const response = await fetch(`${API_URL}?${params.toString()}`);
                const result = await response.json();

                if (result.success) {
                    if (result.data.length) {
                        tableMessage.textContent = '';
                        result.data.forEach(turno => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td data-label="Teléfono"><span class="value">${turno.telefono || 'N/A'}</span></td>
                                <td data-label="Patente"><span class="value">${turno.patente || 'N/A'}</span></td>
                                <td data-label="Fecha"><span class="value">${turno.fecha || 'N/A'}</span></td>
                                <td data-label="Hora"><span class="value">${formatHora(turno.hora)}</span></td>
                                <td data-label="Problema"><span class="value">${turno.descripcion || 'N/A'}</span></td>
                                <td data-label="Estado"><span class="value">${turno.estado || 'N/A'}</span></td>
                            `;
                            turnosTableBody.appendChild(row);
                        });
                    } else {
                        tableMessage.textContent = 'No se encontraron turnos en este rango de fechas.';
                    }
                } else {
                    tableMessage.textContent = '❌ Error al cargar los turnos.';
                    console.error('Error del servidor:', result.message);
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                tableMessage.textContent = '❌ Error de conexión. Intenta de nuevo.';
            }
        };

        filterBtn.addEventListener('click', () => {
            const start = startDateInput.value;
            const end = endDateInput.value;
            if (start && end) fetchTurnos(start, end);
            else tableMessage.textContent = 'Por favor, selecciona ambas fechas.';
        });
    }
});
