"use strict"; // for safer JavaScript

const bookingForm = document.getElementById("bookingForm"); // booking form and list container
const bookingList = document.getElementById("bookingList");

const reviewForm = document.getElementById("reviewForm");  // review form and list container
const reviewsList = document.getElementById("reviewsList");

let bookings = [];  // Arrays to store booking and review data
let reviews = [];

bookingForm.addEventListener("submit", (event) => {   // to Handle booking form submission
    event.preventDefault(); // Stop page from refreshing

    const learnerName = document.getElementById("learnerName").value.trim(); // form values
    const skillName = document.getElementById("skillName").value.trim();

    if (!learnerName || !skillName) return; // stop if inputs are empty

    
    const newBooking = {   // Create new booking object
        id: Date.now(), 
        learnerName,
        skillName,
        status: "pending" 
    };

    bookings.push(newBooking);  // Add booking to array 
    renderBookings();
    bookingForm.reset(); // Clear the form
});

// Display all bookings on the page
function renderBookings() {
    bookingList.innerHTML = ""; // Clear existing list

    bookings.forEach((booking) => {
        const bookingCard = document.createElement("div");
        bookingCard.classList.add("request-card");

        // Add booking details and buttons if pending
        bookingCard.innerHTML = `
            <p><strong>${booking.learnerName}</strong> requested <strong>${booking.skillName}</strong></p>
            <p>Status: ${booking.status}</p>
            ${booking.status === "pending" ? `
                <button onclick="updateBooking(${booking.id}, 'accepted')">Accept</button>
                <button onclick="updateBooking(${booking.id}, 'declined')">Decline</button>
            ` : ""}
        `;

        bookingList.appendChild(bookingCard);
    });
}

window.updateBooking = (id, status) => {  // Update booking status (accept/decline
    bookings = bookings.map(b => b.id === id ? { ...b, status } : b);
    renderBookings();
};

// Handle review form submission
reviewForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Stop page from refreshing

    // form values
    const reviewerName = document.getElementById("reviewerName").value.trim();
    const rating = document.getElementById("rating").value;
    const reviewText = document.getElementById("reviewText").value.trim();

    if (!reviewerName || !rating || !reviewText) return;  // Stop if any field is empty

   const newReview = {   // Create new review object
        id: Date.now(), 
        reviewerName,
        rating,
        reviewText
    };

    // Add review to array and update UI
    reviews.push(newReview);
    renderReviews();
    reviewForm.reset(); // Clear form
});

// Display all reviews on the page
function renderReviews() {
    reviewsList.innerHTML = ""; // Clear existing list

    reviews.forEach((review) => {
        const reviewCard = document.createElement("div");
        reviewCard.classList.add("review-card");

        // Add reviewer's name, star rating, and text
        reviewCard.innerHTML = `
            <p><strong>${review.reviewerName}</strong> - ${"★".repeat(review.rating)}</p>
            <p>${review.reviewText}</p>
        `;

        reviewsList.appendChild(reviewCard);
    });
}

