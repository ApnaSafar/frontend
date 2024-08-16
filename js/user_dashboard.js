// ... (previous code remains the same)

// Function to show loading indicator
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Update fetchFlightTickets function
async function fetchFlightTickets() {
    showLoading('flight-tickets');
    try {
        const response = await fetch('http://localhost:3000/api/user/tickets');
        const tickets = await response.json();
        const container = document.querySelector('#flight-tickets .ticket-container');
        container.innerHTML = ''; // Clear loading content

        tickets.forEach(ticket => {
            const ticketElement = createTicketElement(ticket);
            container.appendChild(ticketElement);
        });
    } catch (error) {
        console.error('Error fetching flight tickets:', error);
        document.querySelector('#flight-tickets .ticket-container').innerHTML = '<p>Error loading tickets. Please try again later.</p>';
    }
}

// Update fetchHotelReservations function
async function fetchHotelReservations() {
    showLoading('hotel-reservations');
    try {
        const response = await fetch('/api/hotel-reservations');
        const reservations = await response.json();
        const container = document.querySelector('#hotel-reservations .reservation-container');
        container.innerHTML = ''; // Clear loading content

        reservations.forEach(reservation => {
            const reservationElement = createReservationElement(reservation);
            container.appendChild(reservationElement);
        });
    } catch (error) {
        console.error('Error fetching hotel reservations:', error);
        document.querySelector('#hotel-reservations .reservation-container').innerHTML = '<p>Error loading reservations. Please try again later.</p>';
    }
}

// ... (rest of the code remains the same)