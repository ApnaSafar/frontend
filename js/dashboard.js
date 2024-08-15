document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
    }
    const searchForm = document.getElementById('search-form');

    fetchUserTickets();
    fetchCities();

    searchForm.addEventListener('submit', handleSearch);

    document.getElementById('logout-btn').addEventListener('click', logout);

});

async function handleSearch(e) {
    e.preventDefault();
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    
    try {
         //converting date to YYYY-MM-DD format
        const [day, month, year] = date.split('-');
        const searchDate = `${year}-${month}-${day}`;

        const response = await fetch(`http://localhost:3000/api/flights/search?from=${from}&to=${to}&date=${searchDate}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // parsing the response as JSON
        const flights = await response.json();
        //handling the flight data i.e. displaying on webpage
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
            <p>Available Seats: ${flight.seats}</p>
            <button class="btn btn-primary btn-book-now" data-flight-id="${flight._id}">Book Now</button>
            `;
        ul.appendChild(li);
    });

    resultsContainer.appendChild(ul);

    // Adding event listeners to Book Now buttons
    document.querySelectorAll('.btn-book-now').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const flightId = this.getAttribute('data-flight-id');
            openSeatSelection(flightId);
        });
    });
}

function openSeatSelection(flightId) {
    // Open seat selection in a new window or as a popup
    const seatSelectionWindow = window.open('seat-selection.html', 'SeatSelection', 'width=600,height=400');
    
    // Wait for the new window to load, then send the flightId
    seatSelectionWindow.onload = function() {
        seatSelectionWindow.postMessage({ type: 'FLIGHT_ID', flightId: flightId }, '*');
    };
}
 //see messages from the seat selection window
 window.addEventListener('message', async function(event) {
    if (event.data.type === 'SEAT_SELECTED') {
        const { flightId, seatNumber } = event.data;
        try {
            const response = await fetch('http://localhost:3000/api/tickets/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ flightId, seatNumber })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Ticket booked successfully');
                // Refresh the flight search or update UI as needed
                fetchUserTickets();
            } else {
                alert(`Booking failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('An error occurred during booking: ' + error.message);
        }
    }
});

async function fetchUserTickets() {
    // const token = localStorage.getItem('token');
    //     if (!token) {
    //         alert('Please log in to view your tickets');
    //         return;
    //     }
    try {
        const response = await fetch('http://localhost:3000/api/user/tickets', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
        li.innerHTML = `
    <p>Flight: ${ticket.flight.flightNumber}</p>
    <p>From: ${ticket.flight.from} To: ${ticket.flight.to}</p>
    <p>Departure: ${new Date(ticket.flight.departureTime).toLocaleString()}</p>
    <p>Status: ${ticket.status}</p>
    <button class="btn btn-secondary btn-cancel-ticket" data-ticket-id="${ticket._id}">Cancel Ticket</button>
`;      
        ul.appendChild(li);
    });

    ticketsContainer.appendChild(ul);
    // Add event listeners to the new "Cancel Ticket" buttons
    document.querySelectorAll('.btn-cancel-ticket').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const ticketId = this.getAttribute('data-ticket-id');
            cancelTicket(ticketId);
        });
    });
}

async function cancelTicket(ticketId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to cancel a ticket');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/tickets/cancel/${ticketId}`, {
            method: 'PUT',
            headers: {
                'x-auth-token': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Ticket cancelled successfully');
            fetchUserTickets(); // Refresh the ticket list
        } else {
            alert(`Cancellation failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Cancellation error:', error);
        alert('An error occurred during cancellation');
    }
}

async function fetchCities() {

    try {
        const response = await fetch('http://localhost:3000/api/cities');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
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

async function bookFlight(flightId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to book a flight');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/flights/book', {
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