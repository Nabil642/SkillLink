"use strict";

/**
 * @fileoverview One-file frontend for:
 * - Registration + Login (index.html)
 * - Profile load/update + Skill assign/remove (profile.html)
 *
 * Backends expected:
 *  - users_api.php        (?action=register|login|retrieve_profile|update_profile)
 *  - skills_api.php       (?action=retrieve)
 *  - users_skills_api.php (?action=retrieve|assign|remove)
 *
 * Storage:
 *  - Saves user_id in localStorage on successful login.
 */

/* =========================
   Config
========================= */
const API_USERS        = "http://localhost/skill_sharing/users_api.php";
const API_SKILLS       = "http://localhost/skill_sharing/skills_api.php";
const API_USERS_SKILLS = "http://localhost/skill_sharing/users_skills_api.php";

/* =========================
   Small helpers
========================= */
const byId = (id) => /** @type {HTMLElement|null} */ (document.getElementById(id));
const getUserId = () => localStorage.getItem("user_id");

/* =========================
   Registration
========================= */
/**
 * Bind registration form if present.
 * POST -> users_api.php?action=register
 * Body: { first_name, last_name, email, password, location }
 */
function bindRegistration() {
  const form = byId("regForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const payload = {
      first_name: /** @type {HTMLInputElement} */(byId("regFirstName")).value,
      last_name:  /** @type {HTMLInputElement} */(byId("regLastName")).value,
      email:      /** @type {HTMLInputElement} */(byId("regEmail")).value,
      password:   /** @type {HTMLInputElement} */(byId("regPassword")).value,
      location:   /** @type {HTMLInputElement} */(byId("regLocation")).value
    };

    fetch(`${API_USERS}?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((res) => {
        const msg = byId("regMessage");
        if (!msg) return;
        msg.innerHTML = `<div class="alert alert-${res.success ? "success" : "danger"}">${res.message}</div>`;
      })
      .catch((err) => {
        const msg = byId("regMessage");
        if (msg) msg.innerHTML = `<div class="alert alert-danger">Registration failed: ${err.message}</div>`;
      });
  });
}

/* =========================
   Login
========================= */
/**
 * Bind login form if present.
 * POST -> users_api.php?action=login
 * On success: save user_id and redirect to home.html
 */
function bindLogin() {
  const form = byId("loginFormSubmit");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const payload = {
      email:    /** @type {HTMLInputElement} */(byId("loginEmail")).value,
      password: /** @type {HTMLInputElement} */(byId("loginPassword")).value,
    };

    fetch(`${API_USERS}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((res) => {
        const msg = byId("loginMessage");
        if (res.success) {
          if (typeof res.user_id === "number") {
            localStorage.setItem("user_id", String(res.user_id));
          }
          if (msg) msg.innerHTML = `<div class="alert alert-success">${res.message}</div>`;
          window.location.href = "home.html";
        } else {
          if (msg) msg.innerHTML = `<div class="alert alert-danger">${res.message}</div>`;
        }
      })
      .catch((err) => {
        const msg = byId("loginMessage");
        if (msg) msg.innerHTML = `<div class="alert alert-danger">Login failed: ${err.message}</div>`;
      });
  });
}

/* =========================
   Profile: load/update
========================= */
/**
 * Load user profile (if profile form exists).
 * GET -> users_api.php?action=retrieve_profile&user_id=...
 */
function loadUserProfile() {
  const form = byId("updateProfileForm");
  if (!form) return; // not on profile page

  const uid = getUserId();
  if (!uid) {
    alert("Please login first.");
    window.location.href = "index.html";
    return;
  }

  fetch(`${API_USERS}?action=retrieve_profile&user_id=${uid}`)
    .then((r) => r.json())
    .then((res) => {
      if (!res.success || !res.user) {
        alert("Error loading profile.");
        return;
      }
      /** @type {HTMLInputElement} */(byId("firstName")).value = res.user.first_name || "";
      /** @type {HTMLInputElement} */(byId("lastName")).value  = res.user.last_name  || "";
      /** @type {HTMLInputElement} */(byId("email")).value     = res.user.email      || "";
      /** @type {HTMLInputElement} */(byId("location")).value  = res.user.location   || "";
    })
    .catch((err) => alert(`Failed to load profile: ${err.message}`));
}

/**
 * Bind profile update submit.
 * POST -> users_api.php?action=update_profile
 */
function bindProfileUpdate() {
  const form = byId("updateProfileForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const uid = getUserId();
    if (!uid) {
      alert("Please login first.");
      window.location.href = "index.html";
      return;
    }

    const payload = {
      action: "update_profile",
      user_id: uid,
      first_name: /** @type {HTMLInputElement} */(byId("firstName")).value,
      last_name:  /** @type {HTMLInputElement} */(byId("lastName")).value,
      email:      /** @type {HTMLInputElement} */(byId("email")).value,
      location:   /** @type {HTMLInputElement} */(byId("location")).value,
      // skills selection is handled live via checkboxes (assign/remove)
      skills: Array.from(document.querySelectorAll("#skills input:checked")).map((i) => i.value),
    };

    fetch(`${API_USERS}?action=update_profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((res) => {
        alert(res.message);
        if (res.success) loadUserProfile();
      })
      .catch((err) => alert(`Update failed: ${err.message}`));
  });
}

/* =========================
   Skills: list + assign/remove
========================= */
/**
 * Load all skills, render as checkboxes, then pre-check current user's skills.
 */
function loadSkillsAndUserSkills() {
  const skillsWrap = byId("skills");
  if (!skillsWrap) return; // not on profile page

  skillsWrap.innerHTML = "";

  fetch(`${API_SKILLS}?action=retrieve`)
    .then((r) => r.json())
    .then((res) => {
      if (!res.skills) {
        alert("Error loading skills.");
        return;
      }

      res.skills.forEach((skill) => {
        const div = document.createElement("div");
        div.classList.add("form-check");

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.classList.add("form-check-input");
        cb.id = `skill-${skill.id}`;
        cb.value = String(skill.id);

        const label = document.createElement("label");
        label.classList.add("form-check-label");
        label.htmlFor = cb.id;
        label.textContent = skill.name;

        div.appendChild(cb);
        div.appendChild(label);
        skillsWrap.appendChild(div);
      });

      // after rendering all, pre-check the user's skills
      loadUserSkills();
    })
    .catch((err) => console.error("Error fetching skills:", err));
}

/**
 * Pre-check user's skills.
 */
function loadUserSkills() {
  const uid = getUserId();
  const skillsWrap = byId("skills");
  if (!uid || !skillsWrap) return;

  fetch(`${API_USERS_SKILLS}?action=retrieve&user_id=${uid}`)
    .then((r) => r.json())
    .then((res) => {
      if (!res.skills) return; // none is fine
      const own = new Set(res.skills.map((s) => Number(s.id)));
      skillsWrap.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        const box = /** @type {HTMLInputElement} */(cb);
        if (own.has(Number(box.value))) box.checked = true;
      });
    })
    .catch((err) => console.error("Error fetching user skills:", err));
}

/**
 * Handle check/uncheck actions: assign or remove skill immediately.
 */
function bindSkillToggles() {
  const skillsWrap = byId("skills");
  if (!skillsWrap) return;

  skillsWrap.addEventListener("change", (event) => {
    const target = /** @type {HTMLInputElement} */(event.target);
    if (!target || target.type !== "checkbox") return;

    const uid = getUserId();
    const skillId = target.value;
    if (!uid) return;

    if (target.checked) {
      // assign
      fetch(`${API_USERS_SKILLS}?action=assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid, skill_id: skillId }),
      })
        .then((r) => r.json())
        .then((res) => alert(res.message))
        .catch((err) => console.error("Error assigning skill:", err));
    } else {
      // remove
      fetch(`${API_USERS_SKILLS}?action=remove&user_id=${uid}&skill_id=${skillId}`, {
        method: "DELETE",
      })
        .then((r) => r.json())
        .then((res) => alert(res.message))
        .catch((err) => console.error("Error removing skill:", err));
    }
  });
}

/* =========================
   Init (runs on every page)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // If we're on index.html
  bindRegistration();
  bindLogin();

  // If we're on profile.html
  loadUserProfile();
  bindProfileUpdate();
  loadSkillsAndUserSkills();
  bindSkillToggles();
});
