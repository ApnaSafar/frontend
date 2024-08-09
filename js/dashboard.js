document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
    }

    fetchUserTickets();
    fetchCities();

    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', handleSearch);

    document.getElementById('logout-btn').addEventListener('click', logout);
});

async function fetchUserTickets() {
    try {
        const response = await fetch('/api/user/tickets', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        if (response.status === 401) {
            alert('Please log in to view your tickets');
            window.location.href = '/index.html';
            return;
        }

        const tickets = await response.json();
        displayUserTickets(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        alert('An error occurred while fetching your tickets');
    }
}

function displayUserTickets(tickets) {
    const ticketsContainer = document.getElementById('user-tickets');
    ticketsContainer.innerHTML = '';

    if (tickets.length === 0) {
        ticketsContainer.innerHTML = '<p>No bookings found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    tickets.forEach(ticket => {
        const li = document.createElement('li');
        li.textContent = `Flight ${ticket.flightNumber}: ${ticket.from} to ${ticket.to} on ${new Date(ticket.date).toLocaleDateString()}`;
        ul.appendChild(li);
    });

    ticketsContainer.appendChild(ul);
}

async function fetchCities() {
    try {
        const response = await fetch('/api/cities');
        const cities = await response.json();
        populateCityDropdowns(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
    }
}

function populateCityDropdowns(cities) {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');

    cities.forEach(city => {
        const optionFrom = document.createElement('option');
        optionFrom.value = city;
        optionFrom.textContent = city;
        fromSelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = city;
        optionTo.textContent = city;
        toSelect.appendChild(optionTo);
    });
}

async function handleSearch(e) {
    e.preventDefault();
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    
    try {
        const response = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${date}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const flights = await response.json();
        displaySearchResults(flights);
    } catch (error) {
        console.error('Search error:', error);
        alert('An error occurred during the search: ' + error.message);
    }
}


function displaySearchResults(flights) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (flights.length === 0) {
        resultsContainer.innerHTML = '<p>No flights found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    flights.forEach(flight => {
        const li = document.createElement('li');
        li.innerHTML = `
            <p>Flight ${flight.flightNumber}: ${flight.from} to ${flight.to}</p>
            <p>Departure: ${new Date(flight.departureTime).toLocaleString()}</p>
            <p>Arrival: ${new Date(flight.arrivalTime).toLocaleString()}</p>
            <p>Price: $${flight.price}</p>
            <button onclick="bookFlight('${flight._id}')">Book Now</button>
        `;
        ul.appendChild(li);
    });

    resultsContainer.appendChild(ul);
}

async function bookFlight(flightId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to book a flight');
        return;
    }

    try {
        const response = await fetch('/api/flights/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ flightId })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Flight booked successfully');
            fetchUserTickets(); 
        } else {
            alert(`Booking failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert('An error occurred during booking');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}

document.getElementById('logout-btn').addEventListener('click', logout);