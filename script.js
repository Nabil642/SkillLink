"use strict";

// Quick check to confirm script loaded
console.log("script.js loaded ✅");

// DOM references
const skillForm = document.getElementById("skillForm");
const skillList = document.getElementById("skillList");
const browseList = document.getElementById("browseList");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortOptions = document.getElementById("sortOptions");

// In-memory skills
let skills = [];

/* ========= Seed demo data so buttons appear immediately ========= */
document.addEventListener("DOMContentLoaded", () => {
  // Only seed if empty
  if (skills.length === 0) {
    skills = [
      {
        id: Date.now(),
        title: "Web Design Basics",
        description: "Learn HTML/CSS fundamentals.",
        category: "Design",
        price: 50,
        photo: "https://picsum.photos/seed/design/600/300",
        rating: "4.7"
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
    updateCategoryFilter();
    renderSkills();
  }
});

/* ================== Add Skill ================== */
skillForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const skill = {
    id: Date.now(),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value.trim(),
    price: parseFloat(document.getElementById("price").value),
    photo: document.getElementById("photo").value.trim(),
    rating: (Math.random() * 2 + 3).toFixed(1) // 3.0–5.0
  };

  skills.push(skill);
  updateCategoryFilter();
  renderSkills();
  skillForm.reset();
});

/* ================== Render Skills ================== */
function renderSkills() {
  // Clear containers
  skillList.innerHTML = "";
  browseList.innerHTML = "";

  // Render manage list (with Edit/Delete)
  skills.forEach((skill) => {
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

    // Clone for browse (no action buttons)
    const browseCard = card.cloneNode(true);
    const actions = browseCard.querySelector(".action-buttons");
    if (actions) actions.remove();
    browseList.appendChild(browseCard);
  });
}

/* ===== Edit/Delete Handlers (Event Delegation) ===== */
skillList.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const deleteBtn = e.target.closest(".delete-btn");

  if (editBtn) {
    const id = Number(editBtn.dataset.id);
    editSkill(id);
  } else if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);
    deleteSkill(id);
  }
});

function editSkill(id) {
  const skill = skills.find((s) => s.id === id);
  if (!skill) return;

  // Prefill form
  document.getElementById("title").value = skill.title;
  document.getElementById("description").value = skill.description;
  document.getElementById("category").value = skill.category;
  document.getElementById("price").value = skill.price;
  document.getElementById("photo").value = skill.photo;

  // Remove original; on submit it will be re-added as updated
  skills = skills.filter((s) => s.id !== id);
  renderSkills();
}

function deleteSkill(id) {
  skills = skills.filter((s) => s.id !== id);
  renderSkills();
}

/* ============ Category Filter Options ============ */
function updateCategoryFilter() {
  const categories = [...new Set(skills.map((s) => s.category))];
  filterCategory.innerHTML = `<option value="">All Categories</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

/* ============ Search / Filter / Sort ============ */
[searchInput, filterCategory, sortOptions].forEach((el) => {
  el.addEventListener("input", applyFilters);
});

function applyFilters() {
  let filtered = [...skills];

  // Search
  const keyword = searchInput.value.toLowerCase();
  if (keyword) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword)
    );
  }

  // Category
  if (filterCategory.value) {
    filtered = filtered.filter((s) => s.category === filterCategory.value);
  }

  // Sort
  if (sortOptions.value === "priceLow") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOptions.value === "priceHigh") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortOptions.value === "ratingHigh") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Render filtered in Browse section
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
