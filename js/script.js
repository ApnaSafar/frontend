document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear()

        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
       
  
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit',   handleSignup);

        //custom-cursor
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

    // navbar toggle
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
  
    // headers sticky and gototop functionality
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
});


async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
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
            //multi
            console.log(localStorage.getItem('token'));
            window.location.href = './dashboard.html';
            
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
        const response = await fetch('http://localhost:3000/api/auth/signup', {
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
            //multi
            console.log(localStorage.getItem('token'));
            window.location.href = './dashboard.html';
        } else {
            alert(`Signup failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
    }
}

function scrollToAuth() {
const token = localStorage.getItem('token');
if (token) {
  window.location.href = '/dashboard';
} else {
  const authSection = document.getElementById('login');
  authSection.scrollIntoView({ behavior: 'smooth' });
}
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('reviews-container');

    try {
      const response = await fetch('http://localhost:3000/api/review/reviews/');
      const reviews = await response.json();

      reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-item';
        card.innerHTML = `
          <div class="name">${review.Name} : </div>  <!-- Added colon after Name -->
          <div class="review">${review.Text}</div>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
});
