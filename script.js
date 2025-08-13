"use strict"; // Enforces stricter JavaScript rules (prevents some common mistakes)

// Quick console message to confirm the script has loaded successfully
console.log("script.js loaded ✅");

// 
// DOM ELEMENT REFERENCES
// 
const skillForm = document.getElementById("skillForm"); // The "Add Skill" form
const skillList = document.getElementById("skillList"); // Skills management area
const browseList = document.getElementById("browseList"); // Skills browsing area

const searchInput = document.getElementById("searchInput"); // Search bar
const filterCategory = document.getElementById("filterCategory"); // Category filter dropdown
const sortOptions = document.getElementById("sortOptions"); // Sorting dropdown

// Array to store all skills in memory
let skills = [];

// 
// SEED DEMO DATA (so Edit/Delete buttons appear on load)
// 
document.addEventListener("DOMContentLoaded", () => {
  // Only add sample data if the skills list is empty
  if (skills.length === 0) {
    skills = [
      {
        id: Date.now(), // Unique ID based on timestamp
        title: "Web Design Basics",
        description: "Learn HTML/CSS fundamentals.",
        category: "Design",
        price: 50,
        photo: "https://picsum.photos/seed/design/600/300", // Sample image
        rating: "4.7" // Hardcoded rating
      },
      {
        id: Date.now() + 1,
        title: "JavaScript Coaching",
        description: "1:1 JS sessions for beginners.",
        category: "Programming",
        price: 70,
        photo: "https://picsum.photos/seed/js/600/300",
        rating: "4.9"
      }
    ];
    updateCategoryFilter(); // Populate category dropdown
    renderSkills(); // Display the seeded skills
  }
});

// 
// ADD NEW SKILL (Form Submit Event)
// 
skillForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevents page reload when form is submitted

  // Create a new skill object from form inputs
  const skill = {
    id: Date.now(),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value.trim(),
    price: parseFloat(document.getElementById("price").value),
    photo: document.getElementById("photo").value.trim(),
    rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3.0–5.0
  };

  // Add skill to the skills array
  skills.push(skill);

  updateCategoryFilter(); // Refresh category filter options
  renderSkills(); // Display updated skills list
  skillForm.reset(); // Clear form fields after adding
});

// 
// RENDER SKILLS (Display both Manage & Browse sections)
// 
function renderSkills() {
  // Clear existing displayed skills
  skillList.innerHTML = "";
  browseList.innerHTML = "";

  // Loop through skills and create HTML cards
  skills.forEach((skill) => {
    // Create skill card for Manage section (with Edit/Delete buttons)
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <img src="${skill.photo}" alt="${skill.title}" />
      <h3>${skill.title}</h3>
      <p>${skill.description}</p>
      <p>Category: ${skill.category}</p>
      <p>Price: $${skill.price}</p>
      <p>Rating: ${skill.rating} ★</p>
      <div class="action-buttons">
        <button class="edit-btn" data-id="${skill.id}">Edit</button>
        <button class="delete-btn" data-id="${skill.id}">Delete</button>
      </div>
    `;
    skillList.appendChild(card);

    // Create a copy for Browse section (no Edit/Delete buttons)
    const browseCard = card.cloneNode(true);
    const actions = browseCard.querySelector(".action-buttons");
    if (actions) actions.remove(); // Remove action buttons for browsing
    browseList.appendChild(browseCard);
  });
}

// 
// EDIT & DELETE HANDLERS (Event Delegation on skillList)
// 
skillList.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-btn"); // Checks if Edit button clicked
  const deleteBtn = e.target.closest(".delete-btn"); // Checks if Delete button clicked

  if (editBtn) {
    const id = Number(editBtn.dataset.id); // Get skill ID
    editSkill(id); // Call edit function
  } else if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);
    deleteSkill(id); // Call delete function
  }
});

// 
// EDIT SKILL (Prefill form with existing data)
// 
function editSkill(id) {
  const skill = skills.find((s) => s.id === id); // Find skill by ID
  if (!skill) return;

  // Fill form fields with the skill's data
  document.getElementById("title").value = skill.title;
  document.getElementById("description").value = skill.description;
  document.getElementById("category").value = skill.category;
  document.getElementById("price").value = skill.price;
  document.getElementById("photo").value = skill.photo;

  // Remove the original skill so it can be replaced on resubmit
  skills = skills.filter((s) => s.id !== id);
  renderSkills();
}

//
// DELETE SKILL (Remove skill by ID)
// 
function deleteSkill(id) {
  skills = skills.filter((s) => s.id !== id); // Keep all except the one to delete
  renderSkills(); // Refresh the UI
}

// 
// UPDATE CATEGORY FILTER OPTIONS
// 
function updateCategoryFilter() {
  const categories = [...new Set(skills.map((s) => s.category))]; // Unique category list
  filterCategory.innerHTML = `<option value="">All Categories</option>`; // Default option

  // Add each unique category to the dropdown
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

// 
// SEARCH / FILTER / SORT FUNCTIONALITY
// 
[searchInput, filterCategory, sortOptions].forEach((el) => {
  el.addEventListener("input", applyFilters); // Run filters whenever input changes
});

function applyFilters() {
  let filtered = [...skills]; // Start with all skills

  // Filter by keyword search
  const keyword = searchInput.value.toLowerCase();
  if (keyword) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword)
    );
  }

  // Filter by category
  if (filterCategory.value) {
    filtered = filtered.filter((s) => s.category === filterCategory.value);
  }

  // Sort by selected option
  if (sortOptions.value === "priceLow") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOptions.value === "priceHigh") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortOptions.value === "ratingHigh") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Display filtered results in Browse section
  browseList.innerHTML = "";
  filtered.forEach((skill) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <img src="${skill.photo}" alt="${skill.title}" />
      <h3>${skill.title}</h3>
      <p>${skill.description}</p>
      <p>Category: ${skill.category}</p>
      <p>Price: $${skill.price}</p>
      <p>Rating: ${skill.rating} ★</p>
    `;
    browseList.appendChild(card);
  });
}
