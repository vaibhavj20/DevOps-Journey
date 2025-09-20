// Set minimum date to today
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }
});

// Form validation and submission
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", function (e) {
    const submitBtn = this.querySelector('button[type="submit"]');
    const loader = submitBtn.querySelector(".btn-loader");
    const btnText = submitBtn.querySelector("span");

    // Show loading state
    if (loader && btnText) {
      loader.style.display = "block";
      btnText.textContent = "Booking...";
      submitBtn.disabled = true;
    }

    // Basic validation
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!name || !email || !mobile || !date || !time) {
      e.preventDefault();
      alert("Please fill in all fields");

      // Reset button state
      if (loader && btnText) {
        loader.style.display = "none";
        btnText.textContent = "Book Appointment";
        submitBtn.disabled = false;
      }
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      e.preventDefault();
      alert("Please enter a valid email address");

      // Reset button state
      if (loader && btnText) {
        loader.style.display = "none";
        btnText.textContent = "Book Appointment";
        submitBtn.disabled = false;
      }
      return;
    }

    // Validate mobile number (basic check)
    const mobileRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ""))) {
      e.preventDefault();
      alert("Please enter a valid mobile number");

      // Reset button state
      if (loader && btnText) {
        loader.style.display = "none";
        btnText.textContent = "Book Appointment";
        submitBtn.disabled = false;
      }
      return;
    }

    // Check if selected date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      e.preventDefault();
      alert("Please select a future date");

      // Reset button state
      if (loader && btnText) {
        loader.style.display = "none";
        btnText.textContent = "Book Appointment";
        submitBtn.disabled = false;
      }
      return;
    }
  });
}

// Auto-format mobile number
const mobileInput = document.getElementById("mobile");
if (mobileInput) {
  mobileInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    e.target.value = value;
  });
}

// Add smooth focus animations
document.querySelectorAll(".form-group input").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.classList.add("focused");
  });

  input.addEventListener("blur", function () {
    if (!this.value) {
      this.parentElement.classList.remove("focused");
    }
  });
});
