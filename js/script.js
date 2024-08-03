document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const searchForm = document.getElementById('search-form');
  
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    searchForm.addEventListener('submit', handleSearch);
  
    // Fetch and display featured deals
    fetchFeaturedDeals();
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
            // TODO: Store the token and redirect to user dashboard
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
            // TODO: Store the token and redirect to user dashboard
        } else {
            alert(`Signup failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
    }
  }
  
  function handleSearch(e) {
    e.preventDefault();
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const minPrice = document.getElementById('price-min').value;
    const maxPrice = document.getElementById('price-max').value;
  
    // TODO: Implement search functionality
    console.log('Search params:', { destination, date, minPrice, maxPrice });
    alert('Search functionality not implemented yet');
  }
  
  async function fetchFeaturedDeals() {
    // TODO: Fetch featured deals from the server
    const mockDeals = [
        { id: 1, destination: 'Paris', price: 500 },
        { id: 2, destination: 'Tokyo', price: 800 },
        { id: 3, destination: 'New York', price: 600 },
    ];
  
    const dealsContainer = document.getElementById('deals-container');
    mockDeals.forEach(deal => {
        const dealElement = document.createElement('div');
        dealElement.innerHTML = `
            <h3>${deal.destination}</h3>
            <p>Price: $${deal.price}</p>
        `;
        dealsContainer.appendChild(dealElement);
    });
  }