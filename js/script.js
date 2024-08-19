document.addEventListener('DOMContentLoaded', () => {
    localStorage.clear()

        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
       
  
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit',   handleSignup);


   // Navbar toggle
const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");
const navLinks = document.querySelectorAll("[data-nav-link]");

const navElemArr = [navOpenBtn, navCloseBtn, overlay];

const navToggleEvent = (elems) => {
  elems.forEach((elem) => {
    elem.addEventListener("click", () => {
      navbar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  });
};

navToggleEvent(navElemArr);
navToggleEvent(navLinks);

// Header sticky and go-to-top functionality
const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", () => {
  if (window.scrollY >= 200) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }
});


    // search button and highlight text in the page
    const searchBtn = document.querySelector('.search-btn');
  let searchInput = null;

  searchBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent this click from immediately closing the search input
    if (!searchInput) {
      searchInput = document.createElement('input');
      searchInput.id = 'search-input';
      searchInput.type = 'text';
      searchInput.placeholder = 'Search...';
      document.querySelector('.header-btn-group').appendChild(searchInput);
    }

    searchInput.style.display = searchInput.style.display === 'none' ? 'block' : 'none';
    if (searchInput.style.display === 'block') {
      searchInput.focus();
    }
  });

  document.addEventListener('click', function(e) {
    if (searchInput && searchInput.style.display === 'block' && 
        e.target !== searchInput && e.target !== searchBtn) {
      searchInput.style.display = 'none';
    }
  });

  document.addEventListener('keyup', function(e) {
    if (e.target.id === 'search-input') {
      const searchTerm = e.target.value.toLowerCase();
      removeHighlights();
      if (searchTerm.length > 0) {
        searchInPage(searchTerm);
      }
    }
  });

  function removeHighlights() {
    const highlights = document.querySelectorAll('.highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }

  function searchInPage(searchTerm) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      const nodeValue = node.nodeValue.toLowerCase();
      if (nodeValue.includes(searchTerm)) {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const replacedContent = node.nodeValue.replace(regex, '<span class="highlight">$1</span>');
        const wrapper = document.createElement('span');
        wrapper.innerHTML = replacedContent;
        node.parentNode.replaceChild(wrapper, node);
      }
    }
  }
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

// reviews
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('reviews-container');
  
    try {
      const response = await fetch('http://localhost:3000/api/review/reviews/');
      const reviews = await response.json();
  
      // Create double the amount of reviews for seamless looping
      const doubledReviews = [...reviews, ...reviews];
  
      doubledReviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-item';
        card.innerHTML = `
          <div class="name">${review.Name}:</div>
          <div class="review">${review.Text}</div>
        `;
        container.appendChild(card);
      });
  
      // Adjust animation duration based on the number of reviews
      const marquee = document.querySelector('.marquee');
      const reviewCount = reviews.length;
      marquee.style.animationDuration = `${reviewCount * 5}s`; // 5 seconds per review
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  });


  