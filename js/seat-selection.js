
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.plane');
    const seats = document.querySelectorAll('.row .seat:not(.occupied)');
    const count = document.getElementById('count');
    const total = document.getElementById('total');
    const movieSelect = document.getElementById('movie');
    

    let ticketPrice = +movieSelect.value;

    // Update total and count
    function updateSelectedCount() {
        const selectedSeats = document.querySelectorAll('.row .seat.selected');
        const selectedSeatsCount = selectedSeats.length;
        count.innerText = selectedSeatsCount;
        total.innerText = selectedSeatsCount * ticketPrice;
    }

    // Movie select event
    movieSelect.addEventListener('change', e => {
        ticketPrice = +e.target.value;
        updateSelectedCount();
    });

    // Seat click event
    container.addEventListener('click', e => {
        if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
            e.target.classList.toggle('selected');
            updateSelectedCount();
        }
    });

    // Confirm seat button event
    document.getElementById('confirm-seat').addEventListener('click', function() {
        const selectedSeats = document.querySelectorAll('.row .seat.selected');
        if (selectedSeats) {
            fetch('/api/tickets/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include authentication token if required
                },
                body: JSON.stringify({ flightId: /*flightId*/, seatNumber: selectedSeats })
            }).then(response => response.json())
              .then(data => console.log(data))
              .catch(error => console.error('Error:', error));
        } else {
            alert('Please select a seat.');
        }
    });
});