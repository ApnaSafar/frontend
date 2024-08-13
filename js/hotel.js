// This object will store cached hotel data
let hotelDataCache = {};

async function openModal(hotelId) {
    console.log(hotelId)
    const modal = document.getElementById('hotelModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalDescription = document.getElementById('modalDescription');
    const modalRoomTypes = document.getElementById('modalRoomTypes');
    const modalRating = document.getElementById('modalRating');
    const modalReviews = document.getElementById('modalReviews');

    // Show loading state
    modalTitle.textContent = 'Loading...';
    modal.style.display = 'block';

    try {
        // Fetch hotel data from API
        const hotel = await fetchHotelData(hotelId);

        modalTitle.textContent = hotel.name;
        modalLocation.textContent = `Location: ${hotel.location}`;
        modalDescription.textContent = hotel.description;

        modalRoomTypes.innerHTML = hotel.roomTypes.map(room => `
            <div class="room-type">
                <p>${room.type} - $${room.price} per night</p>
                <button class="book-btn" onclick="bookRoom('${hotel.id}', '${room.type}')">Book Now</button>
            </div>
        `).join('');

        modalRating.textContent = `Rating: ${hotel.rating}/5`;
        // modalReviews.innerHTML = hotel.reviews.map(review => `
        //     <p><strong>${review.user}:</strong> ${review.comment}</p>
        // `).join('');
    } catch (error) {
        console.error('Error fetching hotel data:', error);
        modalTitle.textContent = 'Error loading hotel data';
    }
}

async function fetchHotelData(hotelId) {
    // Check if data is already in cache
    if (hotelDataCache[hotelId]) {
        return hotelDataCache[hotelId];
    }

    // If not in cache, fetch from API
    const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch hotel data');
    }
    const data = await response.json();

    // Cache the fetched data
    hotelDataCache[hotelId] = data;

    return data;
}

function closeModal() {
    const modal = document.getElementById('hotelModal');
    modal.style.display = 'none';
}

async function bookRoom(hotelId, roomType) {
    try {
        const response = await fetch('https://api.example.com/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hotelId: hotelId,
                roomType: roomType,
                // Add any other necessary booking details
            }),
        });

        if (!response.ok) {
            throw new Error('Booking failed');
        }

        const bookingResult = await response.json();
        alert(`Booking successful! Booking ID: ${bookingResult.bookingId}`);
    } catch (error) {
        console.error('Error during booking:', error);
        alert('Sorry, there was an error while processing your booking. Please try again.');
    }
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('hotelModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Function to initialize the page
function initPage() {
    // Fetch and render initial hotel cards
    fetchHotelsAndRender();
}

async function fetchHotelsAndRender() {
    try {
        const response = await fetch('http://localhost:3000/api/hotels/');
        if (!response.ok) {
            throw new Error('Failed to fetch hotels');
        }
        const hotels = await response.json();

        const hotelGrid = document.querySelector('.hotel-grid');
        hotelGrid.innerHTML = ''; // Clear existing cards

        hotels.forEach(hotel => {
            const hotelCard = document.createElement('div');
            hotelCard.className = 'hotel-card';
            hotelCard.onclick = () => openModal(hotel._id);
            hotelCard.innerHTML = `
                <img src="${hotel.image}" alt="${hotel.name}">
                <div class="hotel-card-content">
                    <h3>${hotel.name}</h3>
                    <p>Location: ${hotel.location}</p>
                    <p>Description: ${hotel.description}/5</p>
                </div>
            `;
            hotelGrid.appendChild(hotelCard);
        });
    } catch (error) {
        console.error('Error fetching hotels:', error);
        const hotelGrid = document.querySelector('.hotel-grid');
        hotelGrid.innerHTML = '<p>Error loading hotels. Please try again later.</p>';
    }
}

// Call initPage when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initPage);