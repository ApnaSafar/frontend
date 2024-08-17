document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (!token) {
        window.location.href = '/index.html';
    }
    const searchForm = document.getElementById('search-form');

    fetchUserTickets();
    fetchCities();

    searchForm.addEventListener('submit', handleSearch);

    document.getElementById('logout-btn').addEventListener('click', logout);

    //custom cursor
    const cursor = document.getElementById('cursor');
let cursorX = 0, cursorY = 0;

const moveCursor = (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  requestAnimationFrame(() => {
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
  });
};

document.addEventListener('mousemove', moveCursor);

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

        const stripe=Stripe('pk_test_51PoUi8RtnWqAOK03Mc3XfgAuHYi1lFM7zPtXhTjNpO8fqo52Uy5oZBUGCNEAPBBBBEN6PAhkXJAFzw9CAcySZfRw00lcHLjpRd');
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
        li.innerHTML = `
    <p>Flight: ${ticket.flight.flightNumber}</p>
    <p>From: ${ticket.flight.from} To: ${ticket.flight.to}</p>
    <p>Departure: ${new Date(ticket.flight.departureTime).toLocaleString()}</p>
    <p>Seat: ${ticket.seatNumber}</p>
    <p>Status: ${ticket.status}</p>
    <button class="btn btn-secondary btn-cancel-ticket" data-ticket-id="${ticket._id}">Cancel Ticket</button>
`;
        ul.appendChild(li);
    });

    ticketsContainer.appendChild(ul);
    // Add event listeners to the new "Cancel Ticket" buttons
    document.querySelectorAll('.btn-cancel-ticket').forEach(button => {
        button.addEventListener('click', function (event) {
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
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(hotel._id);
        card.innerHTML = `
            <h2>${hotel.name}</h2>
            <p>${hotel.location}</p>
            <p>${hotel.description}</p>
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
    const hotelName = document.getElementById('modalHotelName').textContent;
    const roomType = document.getElementById('roomType').value;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guests = document.getElementById('guests').value;
    const price = document.getElementById('roomPrice').textContent;

    try {
        const response = await fetch('your-api-endpoint/bookings', {
            body: JSON.stringify({
                hotelName,
                roomType,
                checkIn,
                checkOut,
                guests,
                price
            }),
        });

        if (response.ok) {
            alert('Booking submitted successfully!');
            closeModal();
        } else {
            alert('Failed to submit booking. Please try again.');
        }
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
