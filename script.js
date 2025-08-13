"use strict"; // Enforces strict mode for safer JavaScript


// DOM ELEMENT REFERENCES

const skillForm = document.getElementById("skillForm");
const skillList = document.getElementById("skillList");
const browseList = document.getElementById("browseList");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortOptions = document.getElementById("sortOptions");

// Array to store all skills
let skills = [];


// ADD NEW SKILL

skillForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevents form from refreshing the page

    // Create a skill object from form inputs
    const skill = {
        id: Date.now(), // Unique ID based on timestamp
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        category: document.getElementById("category").value.trim(),
        price: parseFloat(document.getElementById("price").value),
        photo: document.getElementById("photo").value.trim(),
        rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3 and 5
    };

    // Add skill to array
    skills.push(skill);

    // Update category filter dropdown
    updateCategoryFilter();

    // Re-render skills in both Manage and Browse sections
    renderSkills();

    // Clear form after submission
    skillForm.reset();
});


// RENDER SKILLS

function renderSkills() {
    // Clear previous content
    skillList.innerHTML = "";
    browseList.innerHTML = "";

    // Loop through each skill in the array
    skills.forEach(skill => {
        // --- Management view (with Edit/Delete) ---
        const skillCard = document.createElement("div");
        skillCard.className = "skill-card";
        skillCard.innerHTML = `
            <img src="${skill.photo}" alt="${skill.title}" />
            <h3>${skill.title}</h3>
            <p>${skill.description}</p>
            <p>Category: ${skill.category}</p>
            <p>Price: $${skill.price}</p>
            <p>Rating: ${skill.rating} ★</p>
            <button onclick="editSkill(${skill.id})">Edit</button>
            <button onclick="deleteSkill(${skill.id})">Delete</button>
        `;
        skillList.appendChild(skillCard);

        // --- Browse view (no Edit/Delete buttons) ---
        const browseCard = skillCard.cloneNode(true); // Duplicate the card
        browseCard.querySelectorAll("button").forEach(btn => btn.remove()); // Remove management buttons
        browseList.appendChild(browseCard);
    });
}


// EDIT SKILL

window.editSkill = (id) => {
    const skill = skills.find(s => s.id === id); // Find skill by ID
    if (!skill) return;

    // Fill form with the skill's data
    document.getElementById("title").value = skill.title;
    document.getElementById("description").value = skill.description;
    document.getElementById("category").value = skill.category;
    document.getElementById("price").value = skill.price;
    document.getElementById("photo").value = skill.photo;

    // Remove the old skill so it can be replaced on resubmit
    skills = skills.filter(s => s.id !== id);
    renderSkills();
};


// DELETE SKILL

window.deleteSkill = (id) => {
    // Remove skill from the array
    skills = skills.filter(s => s.id !== id);
    renderSkills(); // Re-render the updated list
};


// UPDATE CATEGORY FILTER OPTIONS

function updateCategoryFilter() {
    const categories = [...new Set(skills.map(s => s.category))]; // Unique categories only
    filterCategory.innerHTML = `<option value="">All Categories</option>`; // Default option

    // Add categories to dropdown
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}


// SEARCH, FILTER & SORT

// Re-apply filters whenever input changes
[searchInput, filterCategory, sortOptions].forEach(el => {
    el.addEventListener("input", applyFilters);
});

function applyFilters() {
    let filtered = [...skills]; // Start with all skills

    // --- Search by keyword ---
    const keyword = searchInput.value.toLowerCase();
    if (keyword) {
        filtered = filtered.filter(s => 
            s.title.toLowerCase().includes(keyword) || 
            s.description.toLowerCase().includes(keyword)
        );
    }

    // --- Filter by category ---
    if (filterCategory.value) {
        filtered = filtered.filter(s => s.category === filterCategory.value);
    }

    // --- Sort results ---
    if (sortOptions.value === "priceLow") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOptions.value === "priceHigh") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortOptions.value === "ratingHigh") {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    // --- Render filtered results in Browse section ---
    browseList.innerHTML = "";
    filtered.forEach(skill => {
        const browseCard = document.createElement("div");
        browseCard.className = "skill-card";
        browseCard.innerHTML = `
            <img src="${skill.photo}" alt="${skill.title}" />
            <h3>${skill.title}</h3>
            <p>${skill.description}</p>
            <p>Category: ${skill.category}</p>
            <p>Price: $${skill.price}</p>
            <p>Rating: ${skill.rating} ★</p>
        `;
        browseList.appendChild(browseCard);
    });
}
