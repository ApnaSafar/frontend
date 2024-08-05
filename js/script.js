document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear()
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');

    // Fetch cities from the backend
    fetch('/api/cities')
        .then(response => response.json())
        .then(cities => {
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
        })
        .catch(error => console.error('Error fetching cities:', error));


    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const searchForm = document.getElementById('search-form');
  
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    searchForm.addEventListener('submit', handleSearch);

    // Navbar toggle functionality
    const overlay = document.querySelector("[data-overlay]");
    const navOpenBtn = document.querySelector("[data-nav-open-btn]");
    const navbar = document.querySelector("[data-navbar]");
    const navCloseBtn = document.querySelector("[data-nav-close-btn]");
    const navLinks = document.querySelectorAll("[data-nav-link]");
  
    const navElemArr = [navOpenBtn, navCloseBtn, overlay];
  
    const navToggleEvent = function (elem) {
        for (let i = 0; i < elem.length; i++) {
            elem[i].addEventListener("click", function () {
                navbar.classList.toggle("active");
                overlay.classList.toggle("active");
            });
        }
    }
  
    navToggleEvent(navElemArr);
    navToggleEvent(navLinks);
  
    // Header sticky and go-to-top functionality
    const header = document.querySelector("[data-header]");
    const goTopBtn = document.querySelector("[data-go-top]");
  
    window.addEventListener("scroll", function () {
        if (window.scrollY >= 200) {
            header.classList.add("active");
            goTopBtn.classList.add("active");
        } else {
            header.classList.remove("active");
            goTopBtn.classList.remove("active");
        }
    });

     // Toggle between login and signup
    //  const container = document.getElementById('container');
    //  const registerBtn = document.getElementById('register');
    //  const loginBtn = document.getElementById('login');
 
    //  registerBtn.addEventListener('click', () => {
    //      container.classList.add("active");
    //  });
 
    //  loginBtn.addEventListener('click', () => {
    //      container.classList.remove("active");
    //  });

});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful');
            localStorage.setItem('token', data.token);
            // TODO: Redirect to user dashboard
        } else {
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Signup successful');
            localStorage.setItem('token', data.token);
            // TODO: Redirect to user dashboard
        } else {
            alert(`Signup failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
    }
}

async function handleSearch(e) {
    e.preventDefault();
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    
    try {
        // Convert date to YYYY-MM-DD format
        const [day, month, year] = date.split('-');
        const searchDate = `${year}-${month}-${day}`;

        const response = await fetch(`/api/flights/search?from=${from}&to=${to}&date=${searchDate}`);
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
            <p>Available Seats: ${flight.seats}</p>
      <button onclick="bookFlight('${flight._id}')">Book Now</button>
    `;
        ul.appendChild(li);
    });

    resultsContainer.appendChild(ul);
}

// In your script.js file

async function bookFlight(flightId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to book a ticket');
        return;
    }

    try {
        const response = await fetch('/api/tickets/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ flightId })
        });

        const data = await response.json();

             if (response.ok) {
                alert('Ticket booked successfully');
                // Refresh the flight search or redirect to user tickets
                getUserTickets();
            } else {
                alert(`Booking failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('An error occurred during booking: ' + error.message);
        }
    }
    
async function getUserTickets() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to view your tickets');
        return;
    }

    try {
        const response = await fetch('/api/tickets/user', {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tickets = await response.json();
        displayUserTickets(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        alert('An error occurred while fetching your tickets');
    }
}

async function cancelTicket(ticketId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to cancel a ticket');
        return;
    }

    try {
        const response = await fetch(`/api/tickets/cancel/${ticketId}`, {
            method: 'PUT',
            headers: {
                'x-auth-token': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Ticket cancelled successfully');
            getUserTickets(); // Refresh the ticket list
        } else {
            alert(`Cancellation failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Cancellation error:', error);
        alert('An error occurred during cancellation');
    }
}

function displayUserTickets(tickets) {
    const ticketList = document.getElementById('ticket-list');
    ticketList.innerHTML = '';
    if (tickets.length === 0) {
        ticketList.innerHTML = '<p>No tickets found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    tickets.forEach(ticket => {
        const li = document.createElement('li');
        li.innerHTML = `
            <p>Flight: ${ticket.flight.flightNumber}</p>
            <p>From: ${ticket.flight.from} To: ${ticket.flight.to}</p>
            <p>Departure: ${new Date(ticket.flight.departureTime).toLocaleString()}</p>
            <p>Seat: ${ticket.seatNumber}</p>
        `;
        ul.appendChild(li);
    });

    ticketList.appendChild(ul);
}