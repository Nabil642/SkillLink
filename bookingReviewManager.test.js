const {
  createBooking,
  updateBookingStatus,
  generateBookingHTML,
  createReview,
  generateReviewHTML,
} = require("./bookingReviewManager");

describe("BookingReviewManager Pure Functions", () => {
  describe("createBooking", () => {
    test("returns valid booking object for valid input", () => {
      const booking = createBooking("Alice", "Piano");
      expect(booking).toMatchObject({
        learnerName: "Alice",
        skillName: "Piano",
        status: "pending",
      });
      expect(typeof booking.id).toBe("number");
    });

    test("returns null for empty learnerName", () => {
      expect(createBooking("", "Piano")).toBeNull();
    });

    test("returns null for empty skillName", () => {
      expect(createBooking("Alice", "")).toBeNull();
    });
  });

  describe("updateBookingStatus", () => {
    test("updates status of matching booking", () => {
      const bookings = [
        { id: 1, learnerName: "A", skillName: "S", status: "pending" },
        { id: 2, learnerName: "B", skillName: "T", status: "pending" },
      ];
      const updated = updateBookingStatus(bookings, 1, "accepted");
      expect(updated.find(b => b.id === 1).status).toBe("accepted");
      expect(updated.find(b => b.id === 2).status).toBe("pending");
    });

    test("does not change status if id not found", () => {
      const bookings = [{ id: 1, learnerName: "A", skillName: "S", status: "pending" }];
      const updated = updateBookingStatus(bookings, 99, "declined");
      expect(updated).toEqual(bookings);
    });
  });

  describe("generateBookingHTML", () => {
    test("includes learnerName, skillName and status", () => {
      const booking = {
        id: 1,
        learnerName: "Alice",
        skillName: "Piano",
        status: "pending",
      };
      const html = generateBookingHTML(booking);
      expect(html).toContain("Alice");
      expect(html).toContain("Piano");
      expect(html).toContain("pending");
      expect(html).toContain('button');
    });

    test("does not include buttons if status is accepted", () => {
      const booking = {
        id: 1,
        learnerName: "Alice",
        skillName: "Piano",
        status: "accepted",
      };
      const html = generateBookingHTML(booking);
      expect(html).not.toContain('button');
    });
  });

  describe("createReview", () => {
    test("returns valid review object for valid input", () => {
      const review = createReview("Bob", "5", "Great teacher!");
      expect(review).toMatchObject({
        reviewerName: "Bob",
        rating: "5",
        reviewText: "Great teacher!",
      });
      expect(typeof review.id).toBe("number");
    });

    test("returns null if reviewerName is empty", () => {
      expect(createReview("", "5", "Nice")).toBeNull();
    });

    test("returns null if rating is empty", () => {
      expect(createReview("Bob", "", "Nice")).toBeNull();
    });

    test("returns null if reviewText is empty", () => {
      expect(createReview("Bob", "5", "")).toBeNull();
    });
  });

  describe("generateReviewHTML", () => {
    test("includes reviewerName, star rating and reviewText", () => {
      const review = {
        id: 1,
        reviewerName: "Bob",
        rating: "4",
        reviewText: "Excellent!",
      };
      const html = generateReviewHTML(review);
      expect(html).toContain("Bob");
      expect(html).toContain("★★★★");
      expect(html).toContain("Excellent!");
    });
  });
});
const {
  createBooking,
  updateBookingStatus,
  generateBookingHTML,
  createReview,
  generateReviewHTML,
} = require("./bookingReviewManager");

