document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear()

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
  
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);

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
        const response = await fetch('http:localhost:3000/api/auth/login', {
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
            console.log(localStorage.getItem('token'));
            window.location.href = '/dashboard';
            
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
        const response = await fetch('http:localhost:3000/api/auth/signup', {
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
            //window.location.href = '/dashboard';
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