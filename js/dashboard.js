document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (!token) {
        window.location.href = '/index.html';
    }
    const searchForm = document.getElementById('search-form');

    //fetchUserTickets();
    fetchCities();

    searchForm.addEventListener('submit', handleSearch);

    document.getElementById('logout-btn').addEventListener('click', logout);

    fetchUserPackageBookings();
    setupPackageBookingButtons();

    // Navbar toggle functionality
    const overlay = document.querySelector("[data-overlay]");
    const navOpenBtn = document.querySelector("[data-nav-open-btn]");
    const navbar = document.querySelector("[data-navbar]");
    const navCloseBtn = document.querySelector("[data-nav-close-btn]");
    const navLinks = document.querySelectorAll("[data-nav-link]");
    const heroTitle = document.querySelector(".hero-title");
    const header = document.querySelector("[data-header]");
    const headerTop = document.querySelector(".header-top");
    const headerBottom = document.querySelector(".header-bottom");
    const heroOverlay = document.querySelector(".hero::before");

    const navElemArr = [navOpenBtn, navCloseBtn, overlay];

    const navToggleEvent = function (elem) {
        for (let i = 0; i < elem.length; i++) {
            elem[i].addEventListener("click", function () {
                overlay.classList.toggle("active");
                if (overlay.classList.contains("active")) {
                    headerTop.style.display = "none";
                    headerBottom.style.display = "none";
                    heroTitle.style.display = "none";
                    heroOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Darker when overlay is active
                } else {
                    headerTop.style.display = "";
                    headerBottom.style.display = "";
                    heroTitle.style.display = "";
                    heroOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Back to original translucency
                }
            });
        }
    }

    navToggleEvent(navElemArr);
    navToggleEvent(navLinks);

    // Header sticky and go-to-top functionality
    const goTopBtn = document.querySelector("[data-go-top]");

    window.addEventListener("scroll", function () {
        if (window.scrollY >= 200) {
            header.classList.add("active");
            goTopBtn.classList.add("active");
            heroTitle.style.opacity = "0";
            if (!overlay.classList.contains("active")) {
                headerTop.style.display = "none";
            }
        } else {
            header.classList.remove("active");
            goTopBtn.classList.remove("active");
            heroTitle.style.opacity = "1";
            if (!overlay.classList.contains("active")) {
                headerTop.style.display = "";
            }
        }
    });

    // Scroll down functionality
    const scrollDownBtn = document.querySelector('.scroll-down');
    const contentWrapper = document.querySelector('.content-wrapper');

    scrollDownBtn.addEventListener('click', () => {
        contentWrapper.scrollIntoView({ behavior: 'smooth' });
    });

    // Hide scroll down button when scrolling down
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            scrollDownBtn.style.opacity = '0';
        } else {
            scrollDownBtn.style.opacity = '1';
        }
    });
});

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
        const response = await fetch('http://localhost:3000/api/flights/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ flightId })
        });

        const sessionId = await response.json();
        console.log(sessionId);

        // if (response.ok) {
        //     alert('Ticket booked successfully');
        //     // Refresh the flight search or redirect to user tickets
        //     fetchUserTickets();
        // } else {
        //     alert(`Booking failed: ${data.message}`);
        // }

        const stripe = Stripe('pk_test_51PoUi8RtnWqAOK03Mc3XfgAuHYi1lFM7zPtXhTjNpO8fqo52Uy5oZBUGCNEAPBBBBEN6PAhkXJAFzw9CAcySZfRw00lcHLjpRd');
        stripe.redirectToCheckout({ sessionId });
    } catch (error) {
        console.error('Booking error:', error);
        alert('An error occurred during booking' + error.message);
    }
}


async function fetchUserTickets() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to view your tickets');
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/tickets/user', {
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
        console.error('Error fetching tickets:', error);
        alert('An error occurred while fetching your tickets' + error.message);
    }
}

function displayUserTickets(tickets) {
    const ticketsContainer = document.getElementById('ticket-list');
    ticketsContainer.innerHTML = '';

    if (tickets.length === 0) {
        ticketsContainer.innerHTML = '<p>No bookings found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    tickets.forEach(ticket => {
        const li = document.createElement('li');
        li.classList.add("ticket-item");
        li.innerHTML = `
                  <div class="ticket-info">
                      <h3 class="flight-number">Flight: ${ticket.flight.flightNumber}</h3>
                      <p class="route">From: ${ticket.flight.from} To: ${ticket.flight.to}</p>
                      <p class="departure">Departure: ${new Date(ticket.flight.departureTime).toLocaleString()}</p>
                      <p class="seat">Seat: ${ticket.seatNumber}</p>
                      <p class="status">Status: ${ticket.status}</p>
                  </div>
                  <div class="ticket-actions">
                      <button class="btn btn-cancel btn-ticket-cancel" data-ticket-id=${ticket._id}>Cancel Ticket</button>
                      <button class="btn btn-download btn-ticket-download" data-ticket-id=${ticket._id}>Download PDF</button>
                  </div>`;
        ul.appendChild(li);
    });

    ticketsContainer.appendChild(ul);
    document.querySelectorAll('.btn-ticket-cancel').forEach(button => {
        button.addEventListener('click', function (event) {
            const ticketId = this.getAttribute('data-ticket-id');
            cancelTicket(ticketId);
        });
    });

    document.querySelectorAll('.btn-ticket-download').forEach(button => {
        button.addEventListener('click', function (event) {
            const ticketId = this.getAttribute('data-ticket-id');
            downloadTicket(ticketId);
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

async function downloadTicket(ticketId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to cancel a ticket');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/tickets/downloadTicket/${ticketId}`, {
            headers: {
                'x-auth-token': token
            }
        })

        const html = await response.text();

        const element = document.createElement('div');
        element.innerHTML = html;
        document.body.appendChild(element);

        html2pdf().from(element).save('document.pdf').then(() => {
            document.body.removeChild(element);
        });
    } catch (error) {
        console.error('Download error:', error);
        alert('An error occurred during cancellation');
    }
}

async function fetchUserReservation() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to view your tickets');
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/hotels/reserv/user', {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reservs = await response.json();
        displayUserReservation(reservs);
    } catch (error) {
        console.error('Error fetching Reservation:', error);
        alert('An error occurred while fetching your reservation' + error.message);
    }
}

function displayUserReservation(reservs) {
    console.log(reservs)
    const reservsContainer = document.getElementById('reserv-list');
    reservsContainer.innerHTML = '';

    if (reservs.length === 0) {
        reservsContainer.innerHTML = '<p>No reservations found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    reservs.forEach(reserv => {
        console.log(reserv._id)
        const li = document.createElement('li');
        li.classList.add("ticket-item");
        li.innerHTML = `
                  <div class="ticket-info">
                      <h3 class="flight-number">Hotel: ${reserv.hotelName}</h3>
                      <p class="route">Room Type: ${reserv.roomType}</p>
                      <p class="departure">Check In: ${new Date(reserv.checkIn).toLocaleString()}</p>
                      <p class="departure">Check In: ${new Date(reserv.checkOut).toLocaleString()}</p>
                      <p class="status">Status: ${reserv.status}</p>
                  </div>
                  <div class="ticket-actions">
                      <button class="btn btn-cancel btn-reserv-cancel" data-reserv-id=${reserv._id}>Cancel Ticket</button>
                      <button class="btn btn-download btn-reserv-download" data-reserv-id=${reserv._id}>Download PDF</button>
                  </div>`;
        ul.appendChild(li);
    });

    reservsContainer.appendChild(ul);
    document.querySelectorAll('.btn-reserv-cancel').forEach(button => {
        button.addEventListener('click', function (event) {
            const reservId = this.getAttribute('data-reserv-id');
            cancelReservation(reservId);
        });
    });

    document.querySelectorAll('.btn-reserv-download').forEach(button => {
        button.addEventListener('click', function (event) {
            const reservId = this.getAttribute('data-reserv-id');
            downloadReservation(reservId);
        });
    });
}

async function cancelReservation(reservId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to cancel a ticket');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/hotels/reserv/cancel/${reservId}`, {
            method: 'PUT',
            headers: {
                'x-auth-token': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Reservation cancelled successfully');
            fetchUserReservation(); // Refresh the ticket list
        } else {
            alert(`Cancellation failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Cancellation error:', error);
        alert('An error occurred during cancellation');
    }
}

async function downloadReservation(reservId) {
    console.log(reservId)
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to cancel a ticket');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/hotels/reserv/download/${reservId}`, {
            headers: {
                'x-auth-token': token
            }
        })

        const html = await response.text();

        const element = document.createElement('div');
        element.innerHTML = html;
        document.body.appendChild(element);

        html2pdf().from(element).save('document.pdf').then(() => {
            document.body.removeChild(element);
        });
    } catch (error) {
        console.error('Download error:', error);
        alert('An error occurred during cancellation');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = './index.html';
}

document.getElementById('logout-btn').addEventListener('click', logout);

async function sendReview(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const review = document.getElementById('review').value;

    try {
        const response = await fetch('http://localhost:3000/api/review/add-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Name: name, Text: review }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Review submitted successfully!');
            document.getElementById('review-form').reset(); // Clear the form
        } else {
            alert(`Failed to submit review: ${data.message}`);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('An error occurred while submitting the review');
    }
}


document.getElementById('logout-btn').addEventListener('click', logout);


async function sendReview(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const review = document.getElementById('review').value;

    try {
        const response = await fetch('http://localhost:3000/api/review/add-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Name: name, Text: review }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Review submitted successfully!');
            document.getElementById('review-form').reset(); // Clear the form
        } else {
            alert(`Failed to submit review: ${data.message}`);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('An error occurred while submitting the review');
    }
}

// Add this event listener to attach the sendReview function to the form
document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', sendReview);
    }
});

async function fetchHotels() {
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/`);
        const hotels = await response.json();
        return hotels;
    } catch (error) {
        console.error('Error fetching hotels:', error);
        return [];
    }
}

// Function to create hotel cards
function createHotelCards(hotels) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = ''; // Clear existing cards

    hotels.forEach(hotel => {
        console.log(hotel);
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(hotel._id);
        card.innerHTML = `
            <img src=${hotel.url} alt="${hotel.name}" class="card-image">
            <div class="card-content">
                <h2>${hotel.name}</h2>
                <p>${hotel.location}</p>
                <p>${hotel.description}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Function to scroll cards
function scroll(direction) {
    const container = document.getElementById('cardContainer');
    container.scrollLeft += direction * 320; // Adjust scroll amount as needed
}

// Function to fetch hotel details and open modal
async function openModal(hotelId) {
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}`);
        currentHotel = await response.json();
        console.log(currentHotel);

        const modal = document.getElementById('bookingModal');
        document.getElementById('modalHotelName').textContent = currentHotel.name;
        document.getElementById('modalLocation').textContent = currentHotel.location;
        document.getElementById('modalDescription').textContent = currentHotel.description;

        const roomTypeSelect = document.getElementById('roomType');
        roomTypeSelect.innerHTML = '';
        currentHotel.roomTypes.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.type;
            roomTypeSelect.appendChild(option);
        });

        updatePrice(); // Set initial price
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching hotel details:', error);
    }
}

function updatePrice() {
    const roomTypeSelect = document.getElementById('roomType');
    const selectedRoomType = currentHotel.roomTypes[roomTypeSelect.selectedIndex];
    const priceElement = document.getElementById('roomPrice');

    if (selectedRoomType) {
        priceElement.textContent = `$${selectedRoomType.price} per night`;
    } else {
        priceElement.textContent = 'Price not available';
    }
}

function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

async function bookNow() {
    const token = localStorage.getItem('token')
    const hotelName = document.getElementById('modalHotelName').textContent;
    const roomTypeSelect = document.getElementById('roomType');
    const roomType = currentHotel.roomTypes[roomTypeSelect.selectedIndex].type;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guests = document.getElementById('guests').value;
    const price = document.getElementById('roomPrice').textContent;

    console.log(JSON.stringify({
        hotelName,
        roomType,
        checkIn,
        checkOut,
        guests,
        price
    }),)

    try {
        const response = await fetch('http://localhost:3000/api/hotels/reserv/create', {
            method: 'POST',
            headers: {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hotelName,
                roomType,
                checkIn,
                checkOut,
                guests,
                price
            }),
        });

        const { sessionId } = await response.json();
        console.log(sessionId)
        const stripe = Stripe('pk_test_51PoUi8RtnWqAOK03Mc3XfgAuHYi1lFM7zPtXhTjNpO8fqo52Uy5oZBUGCNEAPBBBBEN6PAhkXJAFzw9CAcySZfRw00lcHLjpRd');
        stripe.redirectToCheckout({ sessionId });
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('An error occurred. Please try again later.');
    }
}

function hotel_card_scrollLeft() {
    document.getElementById('cardContainer').scrollBy({ left: -200, behavior: 'smooth' });
}

function hotel_card_scrollRight() {
    document.getElementById('cardContainer').scrollBy({ left: 200, behavior: 'smooth' });
}

// Initialize the page
async function getHotels() {
    const hotels = await fetchHotels();
    createHotelCards(hotels);
}

// Call initPage when the script loads
getHotels();
document.getElementById('logout-btn').addEventListener('click', logout);

// packages booking


function setupPackageBookingButtons() {
    document.querySelectorAll('.btn-secondary').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const packageCard = event.target.closest('.package-card');
            const packageId = packageCard.dataset.packageId;
            bookPackage(packageId);
        });
    });
}

async function bookPackage(packageId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to book a package');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/packages/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ packageId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { sessionId } = await response.json();
        console.log('Stripe Session ID:', sessionId);

        const stripe = Stripe('pk_test_51PoUi8RtnWqAOK03Mc3XfgAuHYi1lFM7zPtXhTjNpO8fqo52Uy5oZBUGCNEAPBBBBEN6PAhkXJAFzw9CAcySZfRw00lcHLjpRd');
        const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId
        });
        if (error) {
            console.error('Stripe redirect error:', error);
            alert('An error occurred during checkout: ' + error.message);
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert('An error occurred during booking: ' + error.message);
    }
}

async function fetchUserPackageBookings() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('User not logged in, skipping package bookings fetch');
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/packages/user-bookings', {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const bookings = await response.json();
        displayUserPackageBookings(bookings);
    } catch (error) {
        console.error('Error fetching package bookings:', error);
        alert('An error occurred while fetching your package bookings: ' + error.message);
    }
}

function displayUserPackageBookings(bookings) {
    const bookingsContainer = document.getElementById('package-bookings-list');
    if (!bookingsContainer) {
        console.error('package-bookings-list element not found');
        return;
    }
    bookingsContainer.innerHTML = '';

    if (bookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No package bookings found.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'package-bookings-list';

    bookings.forEach(booking => {
        const li = document.createElement('li');
        li.className = 'package-booking-item';
        li.innerHTML = `
            <h3>${booking.package.name}</h3>
            <p><strong>Location:</strong> ${booking.package.location}</p>
            <p><strong>Duration:</strong> ${booking.package.duration}</p>
            <p><strong>Price:</strong> ₹${booking.package.price}</p>
            <p><strong>Status:</strong> <span class="status status-${booking.status.toLowerCase()}">${booking.status}</span></p>
            <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleString()}</p>
            ${booking.status === 'confirmed' ? `<button class="cancel-booking-btn" data-booking-id="${booking._id}">Cancel Booking</button>` : ''}
        `;
        ul.appendChild(li);
    });

    bookingsContainer.appendChild(ul);

    // Add event listeners for cancel buttons
    document.querySelectorAll('.cancel-booking-btn').forEach(button => {
        button.addEventListener('click', function () {
            cancelPackageBooking(this.dataset.bookingId);
        });
    });
}

async function cancelPackageBooking(bookingId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to cancel a booking');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/packages/cancel/${bookingId}`, {
            method: 'PUT',
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
            alert('Booking cancelled successfully');
            fetchUserPackageBookings(); // Refresh the bookings list
        } else {
            alert('Failed to cancel booking: ' + result.message);
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('An error occurred while cancelling the booking: ' + error.message);
    }
}