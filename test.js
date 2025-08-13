import { getByText, getAllByText, queryByText, screen, fireEvent } from "@testing-library/dom";


// HTML fixture for the DOM

const htmlFixture = `
  <header><h1>SkillLink</h1></header>
  <main>
    <section id="manage-skills">
      <h2>Add / Manage Skills</h2>
      <form id="skillForm">
        <input type="text" id="title" />
        <textarea id="description"></textarea>
        <input type="text" id="category" />
        <input type="number" id="price" />
        <input type="url" id="photo" />
        <button type="submit">Add Skill</button>
      </form>
      <div id="skillList"></div>
    </section>
    <section id="browse-skills">
      <h2>Search & Browse Skills</h2>
      <input type="text" id="searchInput" />
      <select id="filterCategory">
        <option value="">All Categories</option>
      </select>
      <select id="sortOptions">
        <option value="">Sort By</option>
        <option value="priceLow">Price: Low to High</option>
        <option value="priceHigh">Price: High to Low</option>
        <option value="ratingHigh">Rating: High to Low</option>
      </select>
      <div id="browseList"></div>
    </section>
  </main>
`;

describe("SkillLink frontend (script.js)", () => {
  // Store originals so we can restore them after tests
  const originalNow = Date.now;
  const originalRandom = Math.random;

  beforeEach(async () => {
    // Fix Date.now and Math.random for predictable results
    global.Date.now = () => 1234567890; // stable ID
    Math.random = () => 0.5; // results in rating = 4.0

    // Reset DOM for each test
    document.body.innerHTML = htmlFixture;

    // Import script after DOM is ready so it can bind events correctly
    await import("../script.js");
  });

  afterEach(() => {
    // Restore original functions
    global.Date.now = originalNow;
    Math.random = originalRandom;

    // Reset imported modules
    jest.resetModules();
  });

  test("adds a skill on submit and renders in Manage and Browse", () => {
    // Fill form fields
    document.getElementById("title").value = "Guitar Lessons";
    document.getElementById("description").value = "Learn acoustic guitar";
    document.getElementById("category").value = "Music";
    document.getElementById("price").value = "25";
    document.getElementById("photo").value = "https://example.com/guitar.jpg";

    // Trigger form submit
    fireEvent.submit(document.getElementById("skillForm"));

    // In Manage section → should have full card with Edit/Delete
    const manage = document.getElementById("skillList");
    expect(getByText(manage, "Guitar Lessons")).toBeInTheDocument();
    expect(getByText(manage, "Category: Music")).toBeInTheDocument();
    expect(getByText(manage, "Price: $25")).toBeInTheDocument();
    expect(getByText(manage, "Edit")).toBeInTheDocument();
    expect(getByText(manage, "Delete")).toBeInTheDocument();

    // In Browse section → similar card but without management buttons
    const browse = document.getElementById("browseList");
    expect(getByText(browse, "Guitar Lessons")).toBeInTheDocument();
    expect(queryByText(browse, "Edit")).not.toBeInTheDocument();
    expect(queryByText(browse, "Delete")).not.toBeInTheDocument();
  });

  test("updates category filter options when new categories appear", () => {
    // Helper to add a skill quickly
    const add = (title, cat) => {
      document.getElementById("title").value = title;
      document.getElementById("description").value = "desc desc desc";
      document.getElementById("category").value = cat;
      document.getElementById("price").value = "10";
      document.getElementById("photo").value = "https://x.jpg";
      fireEvent.submit(document.getElementById("skillForm"));
    };

    // Add skills with different categories
    add("Item A", "Music");
    add("Item B", "Design");

    // The category dropdown should now contain these new categories
    const categories = Array.from(document.getElementById("filterCategory").querySelectorAll("option"))
      .map(o => o.value);

    expect(categories).toEqual(expect.arrayContaining(["", "Music", "Design"]));
  });

  test("search and category filter narrow results in Browse", () => {
    // Add two skills with distinct keywords
    const add = (title, desc, cat) => {
      document.getElementById("title").value = title;
      document.getElementById("description").value = desc;
      document.getElementById("category").value = cat;
      document.getElementById("price").value = "30";
      document.getElementById("photo").value = "https://x.jpg";
      fireEvent.submit(document.getElementById("skillForm"));
    };
    add("Photoshop", "Image editing", "Design");
    add("Piano", "Classical music", "Music");

    // Search for "image" → only Photoshop should appear
    const searchInput = document.getElementById("searchInput");
    fireEvent.input(searchInput, { target: { value: "image" } });

    const browse = document.getElementById("browseList");
    expect(getByText(browse, "Photoshop")).toBeInTheDocument();
    expect(queryByText(browse, "Piano")).not.toBeInTheDocument();

    // Now filter by "Music" → should hide Photoshop and show Piano
    const filterCategory = document.getElementById("filterCategory");
    fireEvent.input(filterCategory, { target: { value: "Music" } });

    expect(getByText(browse, "Piano")).toBeInTheDocument();
    expect(queryByText(browse, "Photoshop")).not.toBeInTheDocument();
  });

  test("sort by price high to low updates order", () => {
    // Add three skills with different prices
    const add = (title, price) => {
      document.getElementById("title").value = title;
      document.getElementById("description").value = "desc desc desc";
      document.getElementById("category").value = "General";
      document.getElementById("price").value = String(price);
      document.getElementById("photo").value = "https://x.jpg";
      fireEvent.submit(document.getElementById("skillForm"));
    };

    add("Cheap", 5);
    add("Mid", 20);
    add("Expensive", 100);

    // Apply sort by price (high → low)
    const sortOptions = document.getElementById("sortOptions");
    fireEvent.input(sortOptions, { target: { value: "priceHigh" } });

    // Verify browse list order
    const browse = document.getElementById("browseList");
    const titles = Array.from(browse.querySelectorAll("h3")).map((el) => el.textContent);

    expect(titles).toEqual(["Expensive", "Mid", "Cheap"]);
  });

  test("editSkill loads form and removes old card; deleteSkill removes card", () => {
    // Add a skill
    document.getElementById("title").value = "Drawing";
    document.getElementById("description").value = "Sketching basics";
    document.getElementById("category").value = "Art";
    document.getElementById("price").value = "15";
    document.getElementById("photo").value = "https://x.jpg";
    fireEvent.submit(document.getElementById("skillForm"));

    const manage = document.getElementById("skillList");

    // Call global editSkill (set up by script.js)
    window.editSkill(1234567890);

    // After entering edit mode, old item should be removed from lists
    expect(queryByText(manage, "Drawing")).not.toBeInTheDocument();

    // Re-submit edited item to add it back
    document.getElementById("title").value = "Drawing (Edited)";
    fireEvent.submit(document.getElementById("skillForm"));
    expect(getByText(manage, "Drawing (Edited)")).toBeInTheDocument();

    // Call global deleteSkill to remove it
    window.deleteSkill(1234567890);
    expect(queryByText(manage, "Drawing (Edited)")).not.toBeInTheDocument();
  });
});
