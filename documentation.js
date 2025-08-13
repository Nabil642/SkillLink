"use strict";

/**
* @fileoverview Frontend logic for SkillLink:
* - Adds, renders, edits, deletes skills (in-memory).
* - Provides search, filter, and sort in the Browse section.
* - Keeps the Category filter options in sync with data.
*
* Add JSDoc comments throughout so tools like `jsdoc` can generate HTML docs.
*/

/**
* A skill listing shown in Manage and Browse sections.
* @typedef {Object} Skill
* @property {number} id - Unique identifier (timestamp-based).
* @property {string} title - Skill title (e.g., "Guitar Lessons").
* @property {string} description - Detailed description of the skill.
* @property {string} category - Category label (e.g., "Music", "Design").
* @property {number} price - Price in your chosen currency.
* @property {string} photo - Public image URL for the skill card.
* @property {number} rating - Display rating from 0 to 5 (1 decimal).
*/

/* ============================================================================
* DOM ELEMENT REFERENCES
* ==========================================================================*/

/**
* The form used to create or update a skill.
* @type {HTMLFormElement}
*/
const skillForm = /** @type {HTMLFormElement} */ (document.getElementById("skillForm"));

/**
* Container for the "Manage Skills" list of cards (with Edit/Delete).
* @type {HTMLElement}
*/
const skillList = /** @type {HTMLElement} */ (document.getElementById("skillList"));

/**
* Container for the "Browse Skills" list of cards (no Edit/Delete).
* @type {HTMLElement}
*/
const browseList = /** @type {HTMLElement} */ (document.getElementById("browseList"));

/**
* Keyword search input used in Browse section.
* @type {HTMLInputElement}
*/
const searchInput = /** @type {HTMLInputElement} */ (document.getElementById("searchInput"));

/**
* Category filter select used in Browse section.
* @type {HTMLSelectElement}
*/
const filterCategory = /** @type {HTMLSelectElement} */ (document.getElementById("filterCategory"));

/**
* Sort options select used in Browse section.
* @type {HTMLSelectElement}
*/
const sortOptions = /** @type {HTMLSelectElement} */ (document.getElementById("sortOptions"));

/* ============================================================================
* STATE
* ==========================================================================*/

/**
* Array to store all skills in memory.
* @type {Skill[]}
*/
let skills = [];

/* ============================================================================
* EVENT: ADD NEW SKILL
* ==========================================================================*/

/**
* Handles form submission to add a new {@link Skill}.
* - Prevents default page refresh.
* - Builds a Skill object from form inputs.
* - Pushes into the in-memory array.
* - Updates category dropdown and re-renders lists.
*
* @param {SubmitEvent} event - The form submit event.
* @returns {void}
*
* @example
* // Triggered automatically when the "Add Skill" button is pressed
* // with valid form fields filled.
*/
skillForm.addEventListener("submit", (event) => {
  event.preventDefault();

  /** @type {Skill} */
  const skill = {
    id: Date.now(),
    title: (/** @type {HTMLInputElement} */ (document.getElementById("title"))).value.trim(),
    description: (/** @type {HTMLTextAreaElement} */ (document.getElementById("description"))).value.trim(),
    category: (/** @type {HTMLInputElement} */ (document.getElementById("category"))).value.trim(),
    price: parseFloat((/** @type {HTMLInputElement} */ (document.getElementById("price"))).value),
    photo: (/** @type {HTMLInputElement} */ (document.getElementById("photo"))).value.trim(),
    // Random rating between 3.0 and 5.0, one decimal place
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1))
  };

  skills.push(skill);
  updateCategoryFilter();
  renderSkills();
  skillForm.reset();
});

/* ============================================================================
* RENDERING
* ==========================================================================*/

/**
* Renders all skills into:
*  - Manage section (with Edit/Delete buttons)
*  - Browse section (without management buttons)
*
* Clears both containers before drawing the current state of {@link skills}.
*
* @returns {void}
*/
function renderSkills() {
  skillList.innerHTML = "";
  browseList.innerHTML = "";

  skills.forEach((skill) => {
    // --- Management view (with Edit/Delete) ---
    const skillCard = document.createElement("div");
    skillCard.className = "skill-card";
    skillCard.innerHTML = `
      <img src="${skill.photo}" alt="${escapeHtml(skill.title)}" />
      <h3>${escapeHtml(skill.title)}</h3>
      <p>${escapeHtml(skill.description)}</p>
      <p>Category: ${escapeHtml(skill.category)}</p>
      <p>Price: $${Number(skill.price)}</p>
      <p>Rating: ${Number(skill.rating).toFixed(1)} ★</p>
      <button onclick="editSkill(${skill.id})">Edit</button>
      <button onclick="deleteSkill(${skill.id})">Delete</button>
    `;
    skillList.appendChild(skillCard);

    // --- Browse view (no Edit/Delete buttons) ---
    const browseCard = skillCard.cloneNode(true);
    browseCard.querySelectorAll("button").forEach((btn) => btn.remove());
    browseList.appendChild(browseCard);
  });
}

/* 
 * EDIT / DELETE
 * */

/**
* Loads an existing {@link Skill} into the form for editing, and removes
* the original from the array. When the user re-submits, it will
* be added back with updated values.
*
* @param {number} id - Unique skill ID to edit.
* @returns {void}
*
* @example
* editSkill(1723456789123);
*/
window.editSkill = (id) => {
  const skill = skills.find((s) => s.id === id);
  if (!skill) return;

  (/** @type {HTMLInputElement} */ (document.getElementById("title"))).value = skill.title;
  (/** @type {HTMLTextAreaElement} */ (document.getElementById("description"))).value = skill.description;
  (/** @type {HTMLInputElement} */ (document.getElementById("category"))).value = skill.category;
  (/** @type {HTMLInputElement} */ (document.getElementById("price"))).value = String(skill.price);
  (/** @type {HTMLInputElement} */ (document.getElementById("photo"))).value = skill.photo;

  // Remove old item; re-submit will add a fresh one
  skills = skills.filter((s) => s.id !== id);
  renderSkills();
};

/**
* Deletes a {@link Skill} by ID, then re-renders the UI.
*
* @param {number} id - Unique skill ID to delete.
* @returns {void}
*
* @example
* deleteSkill(1723456789123);
*/
window.deleteSkill = (id) => {
  skills = skills.filter((s) => s.id !== id);
  renderSkills();
};

/* 
 * CATEGORY FILTER OPTIONS
 * =*/

/**
 * Rebuilds the Category filter dropdown from the current {@link skills}.
 * Ensures unique category options and preserves a default "All Categories".
 *
 * @returns {void}
 */
function updateCategoryFilter() {
  const categories = /** @type {string[]} */ ([...new Set(skills.map((s) => s.category))]);
  filterCategory.innerHTML = `<option value="">All Categories</option>`;

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

/* 
 * SEARCH / FILTER / SORT (BROWSE SECTION)
 * =*/

/**
 * Re-applies search, category filter, and sort on the in-memory {@link skills}
 * and renders the results into the Browse section.
 *
 * Search is case-insensitive and matches title or description.
 * Sort supports price ascending/descending and rating descending.
 *
 * @returns {void}
 *
 * @example
 * // Triggered by input listeners automatically:
 * applyFilters();
 */
function applyFilters() {
  /** @type {Skill[]} */
  let filtered = [...skills];

  const keyword = searchInput.value.toLowerCase().trim();
  if (keyword) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(keyword) ||
        s.description.toLowerCase().includes(keyword)
    );
  }

  if (filterCategory.value) {
    filtered = filtered.filter((s) => s.category === filterCategory.value);
  }

  if (sortOptions.value === "priceLow") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOptions.value === "priceHigh") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortOptions.value === "ratingHigh") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Render filtered results in Browse section
  browseList.innerHTML = "";
  filtered.forEach((skill) => {
    const browseCard = document.createElement("div");
    browseCard.className = "skill-card";
    browseCard.innerHTML = `
      <img src="${skill.photo}" alt="${escapeHtml(skill.title)}" />
      <h3>${escapeHtml(skill.title)}</h3>
      <p>${escapeHtml(skill.description)}</p>
      <p>Category: ${escapeHtml(skill.category)}</p>
      <p>Price: $${Number(skill.price)}</p>
      <p>Rating: ${Number(skill.rating).toFixed(1)} ★</p>
    `;
    browseList.appendChild(browseCard);
  });
}

/**
 * Attach real-time listeners so filtering happens as the user types/selects.
 * @type {Array<HTMLInputElement|HTMLSelectElement>}
 */
[searchInput, filterCategory, sortOptions].forEach((el) => {
  el.addEventListener("input", applyFilters);
});

/* 
 * UTILITIES
 * */

/**
 * Escapes HTML entities in a string to prevent accidental HTML injection
 * in text content rendered via template strings.
 *
 * @param {string} str - Raw string to escape.
 * @returns {string} Safe, escaped string.
 *
 * @example
 * escapeHtml("<b>bold</b>") // "&lt;b&gt;bold&lt;/b&gt;"
 */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
