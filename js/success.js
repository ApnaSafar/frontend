document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token')
    console.log(token);
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const sessionId = urlParams.get('session_id');
    const producId = urlParams.get('product_id');

    switch (type) {
        case 'Flight':
            confirmFlight(sessionId,producId);
            break;
    }
})

async function confirmFlight(sessionId, productId) {
    const token = localStorage.getItem('token');
    console.log(token);
    try {
        const response = await fetch('http://localhost:3000/api/flights/success', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ sessionId, productId })
        });
        //console.log(response.json());

        const success = await response.json();
        if (success) {
            alert("Flight booked");
        }
        else {
            alert("Payment not successful, Try booking again");
        }

        setTimeout(() => {
            window.location.href = 'http://localhost:3000/dashboard.html'
        }, 1000)
    }
    catch (err) {
        alert("Error booking flight", err);
        console.log(err);

        // setTimeout(() => {
        //     window.location.href = 'http://localhost:3000/dashboard.html'
        // }, 1000)
    }
}