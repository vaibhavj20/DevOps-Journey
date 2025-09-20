// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "none";
  }
});

// Mobile menu toggle
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    navToggle.classList.toggle("active");
  });
}

// Animate stats on scroll
const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll(".stat-number");
      statNumbers.forEach((stat) => {
        const finalValue = stat.textContent;
        const numericValue = Number.parseInt(finalValue.replace(/\D/g, ""));
        const suffix = finalValue.replace(/[\d,]/g, "");

        let currentValue = 0;
        const increment = numericValue / 50;

        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= numericValue) {
            stat.textContent = finalValue;
            clearInterval(timer);
          } else {
            stat.textContent =
              Math.floor(currentValue).toLocaleString() + suffix;
          }
        }, 30);
      });
    }
  });
}, observerOptions);

const statsSection = document.querySelector(".stats");
if (statsSection) {
  observer.observe(statsSection);
}

// Add loading animation to buttons
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    if (this.type === "submit") {
      const loader = this.querySelector(".btn-loader");
      if (loader) {
        loader.style.display = "block";
        this.style.pointerEvents = "none";
      }
    }
  });
});
