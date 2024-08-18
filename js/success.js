document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    console.log(token);
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const sessionId = urlParams.get('session_id');
    const productId = urlParams.get('product_id');

    switch (type) {
        case 'Flight':
            confirmFlight(sessionId, productId);
            break;

        case 'Reservation':
            confirmReservation(sessionId, productId);
            break;
    }

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', downloadReceipt);

    const goBackBtn = document.getElementById('goBackBtn');
    goBackBtn.addEventListener('click', () => {
        window.location.href = 'http://localhost:3000/dashboard.html';
    });

    // Simulate fetching transaction ID
    setTimeout(() => {
        document.getElementById('transactionId').textContent = Math.random().toString(36).substr(2, 9);
    }, 1000);

    // Timer functionality
    const minutes = document.getElementById('min');
    const seconds = document.getElementById('sec');
    let sec = 120;

    const allTime = function() {
        let min, second;
        min = Math.floor(sec / 60);
        second = sec % 60;
        minutes.innerHTML = min < 10 ? '0' + min : min;
        seconds.innerHTML = second < 10 ? '0' + second : second;
        if (sec > 0) {
            sec--;
        } else {
            clearInterval(timerInterval);
            // Redirect or perform action when timer ends
            alert("Session expired. Redirecting to dashboard.");
            window.location.href = 'http://localhost:3000/dashboard.html';
        }
    };

    const timerInterval = setInterval(allTime, 1000);
});

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

        const success = await response.json();
        if (success) {
            alert("Flight booked");
        } else {
            alert("Payment not successful, Try booking again");
        }
    } catch (err) {
        alert("Error booking flight", err);
        console.log(err);
    }
}


async function confirmReservation(sessionId, productId) {
    const token = localStorage.getItem('token');
    console.log(token);
    try {
        const response = await fetch('http://localhost:3000/api/hotels/reserv/success', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ sessionId, productId })
        });

        const success = await response.json();
        if (success) {
            alert("Flight booked");
        } else {
            alert("Payment not successful, Try booking again");
        }
    } catch (err) {
        alert("Error booking flight", err);
        console.log(err);
    }
}

function downloadReceipt() {
    const paperContainer = document.querySelector('.paper-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to match the paper container
    canvas.width = paperContainer.offsetWidth * 2;  // Double for better resolution
    canvas.height = paperContainer.offsetHeight * 2;
    ctx.scale(2, 2);

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw success icon
    const successIcon = paperContainer.querySelector('.success-icon');
    if (successIcon) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(paperContainer.offsetWidth / 2, 50, 30, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓', paperContainer.offsetWidth / 2, 65);
    }

    // Draw text content
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Payment Complete', paperContainer.offsetWidth / 2, 120);

    // Description
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    wrapText(ctx, 'Thank you for completing the payment! You will shortly receive an email confirmation of your payment.', 20, 160, paperContainer.offsetWidth - 40, 20);

    // Transaction ID
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Transaction ID', 20, 240);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(document.getElementById('transactionId').textContent, 20, 270);

    // Thank You
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Thank You!', 20, 310);

    // Draw bottom edge (zigzag)
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    for (let x = 0; x < paperContainer.offsetWidth; x += 20) {
        ctx.lineTo(x, paperContainer.offsetHeight - 5);
        ctx.lineTo(x + 10, paperContainer.offsetHeight);
    }
    ctx.lineTo(paperContainer.offsetWidth, paperContainer.offsetHeight);
    ctx.lineTo(0, paperContainer.offsetHeight);
    ctx.closePath();
    ctx.fill();

    // Convert canvas to image and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'payment_receipt.png';
    link.href = dataUrl;
    link.click();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}