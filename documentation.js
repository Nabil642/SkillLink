/**
 * @fileoverview Booking & Review Management Script
 * @module BookingReviewManager
 * @description
 * Handles booking requests and user reviews for a skill-sharing platform.
 * Allows users to submit bookings, accept/decline them, and leave star-rated reviews.
 * This module interacts with the DOM to dynamically update booking and review lists.
 */

"use strict";

// ============================================================================
// DOM Elements
// ============================================================================

/** @type {HTMLFormElement} Booking form element used to collect new booking requests. */
const bookingForm = document.getElementById("bookingForm");

/** @type {HTMLElement} Container where booking request cards are rendered. */
const bookingList = document.getElementById("bookingList");

/** @type {HTMLFormElement} Review form element used to collect new user reviews. */
const reviewForm = document.getElementById("reviewForm");

/** @type {HTMLElement} Container where review cards are rendered. */
const reviewsList = document.getElementById("reviewsList");

// ============================================================================
// Data Models
// ============================================================================

/**
 * @typedef {Object} Booking
 * @property {number} id Unique booking ID (timestamp-based)
 * @property {string} learnerName Name of the learner making the request
 * @property {string} skillName Name of the skill the learner wants to book
 * @property {"pending"|"accepted"|"declined"} status Current booking status
 */

/**
 * @typedef {Object} Review
 * @property {number} id Unique review ID (timestamp-based)
 * @property {string} reviewerName Name of the reviewer
 * @property {string} rating Rating given as a string (e.g., "5")
 * @property {string} reviewText Written feedback from the reviewer
 */

// ============================================================================
// State Variables
// ============================================================================

/** @type {Booking[]} In-memory list of booking requests. */
let bookings = [];

/** @type {Review[]} In-memory list of submitted reviews. */
let reviews = [];

// ============================================================================
// Event Listeners
// ============================================================================

/**
 * Handle booking form submission.
 * @function handleBookingSubmit
 * @param {Event} event Submit event from the booking form
 * @returns {void}
 */
function handleBookingSubmit(event) {
    event.preventDefault();

    const learnerName = document.getElementById("learnerName").value.trim();
    const skillName = document.getElementById("skillName").value.trim();

    if (!learnerName || !skillName) return;

    /** @type {Booking} */
    const newBooking = {
        id: Date.now(),
        learnerName,
        skillName,
        status: "pending"
    };

    bookings.push(newBooking);
    renderBookings();
    bookingForm.reset();
}
bookingForm.addEventListener("submit", handleBookingSubmit);

/**
 * Handle review form submission.
 * @function handleReviewSubmit
 * @param {Event} event Submit event from the review form
 * @returns {void}
 */
function handleReviewSubmit(event) {
    event.preventDefault();

    const reviewerName = document.getElementById("reviewerName").value.trim();
    const rating = document.getElementById("rating").value;
    const reviewText = document.getElementById("reviewText").value.trim();

    if (!reviewerName || !rating || !reviewText) return;

    /** @type {Review} */
    const newReview = {
        id: Date.now(),
        reviewerName,
        rating,
        reviewText
    };

    reviews.push(newReview);
    renderReviews();
    reviewForm.reset();
}
reviewForm.addEventListener("submit", handleReviewSubmit);

// ============================================================================
// Render Functions
// ============================================================================

/**
 * Render all booking requests into the booking list container.
 * @function renderBookings
 * @returns {void}
 */
function renderBookings() {
    bookingList.innerHTML = "";

    bookings.forEach((booking) => {
        const bookingCard = document.createElement("div");
        bookingCard.classList.add("request-card");

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

/**
 * Render all reviews into the reviews list container.
 * @function renderReviews
 * @returns {void}
 */
function renderReviews() {
    reviewsList.innerHTML = "";

    reviews.forEach((review) => {
        const reviewCard = document.createElement("div");
        reviewCard.classList.add("review-card");

        reviewCard.innerHTML = `
            <p><strong>${review.reviewerName}</strong> - ${"★".repeat(review.rating)}</p>
            <p>${review.reviewText}</p>
        `;

        reviewsList.appendChild(reviewCard);
    });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Update the status of a booking.
 * @function updateBooking
 * @param {number} id The ID of the booking to update
 * @param {"accepted"|"declined"} status The new status to apply
 * @returns {void}
 */
window.updateBooking = (id, status) => {
    bookings = bookings.map(b => b.id === id ? { ...b, status } : b);
    renderBookings();
};
