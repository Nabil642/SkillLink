const apiBaseUrl = "http://localhost/skill_sharing/users_api.php";
const skillsAPI = "http://localhost/skill_sharing/skills_api.php";
const assignSkillsAPI = "http://localhost/skill_sharing/users_skills_api.php";
const userId = localStorage.getItem("user_id"); // Assume user ID is stored in localStorage after login

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    loadSkillsAndUserSkills();

   // Handle form submission
    document.getElementById("updateProfileForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const data = {
            action: "update_profile",
            user_id: userId,
            first_name: document.getElementById("firstName").value,
            last_name: document.getElementById("lastName").value,
            email: document.getElementById("email").value,
            location: document.getElementById("location").value,
            skills: Array.from(document.querySelectorAll("#skills input:checked")).map(input => input.value),
        };

        fetch(`${apiBaseUrl}?action=update_profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => {
                alert(result.message);
                if (result.success) loadUserProfile();
            });
    });

    // Handle checkbox changes
    document.getElementById("skills").addEventListener("change", handleSkillChange);
});

function loadUserProfile() {
    fetch(`${apiBaseUrl}?action=retrieve_profile&user_id=${userId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const user = data.user;
                document.getElementById("firstName").value = user.first_name;
                document.getElementById("lastName").value = user.last_name;
                document.getElementById("email").value = user.email;
                document.getElementById("location").value = user.location;
            } else {
                alert("Error loading profile.");
            }
        });
}

function loadSkillsAndUserSkills() {
    const skillsContainer = document.getElementById("skills");
    skillsContainer.innerHTML = ""; // Clear existing skills

    // Fetch all skills
    fetch(`${skillsAPI}?action=retrieve`)
        .then((response) => response.json())
        .then((data) => {
            if (data.skills) {
                data.skills.forEach(skill => {
                    const skillDiv = document.createElement("div");
                    skillDiv.classList.add("form-check");

                    const skillCheckbox = document.createElement("input");
                    skillCheckbox.type = "checkbox";
                    skillCheckbox.classList.add("form-check-input");
                    skillCheckbox.id = `skill-${skill.id}`;
                    skillCheckbox.value = skill.id;

                    const skillLabel = document.createElement("label");
                    skillLabel.classList.add("form-check-label");
                    skillLabel.setAttribute("for", `skill-${skill.id}`);
                    skillLabel.textContent = skill.name;

                    skillDiv.appendChild(skillCheckbox);
                    skillDiv.appendChild(skillLabel);
                    skillsContainer.appendChild(skillDiv);
                });

                // Once all skills are loaded, load the user's skills
                loadUserSkills();
            } else {
                alert("Error loading skills.");
            }
        })
        .catch((error) => console.error("Error fetching skills:", error));
}

function loadUserSkills() {
    fetch(`${assignSkillsAPI}?action=retrieve&user_id=${userId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.skills) {
                const userSkillIds = new Set(data.skills.map(skill => parseInt(skill.id))); // Collect user skills

                // Automatically check the checkboxes that match user's skills
                const skillCheckboxes = document.querySelectorAll("#skills input[type='checkbox']");
                skillCheckboxes.forEach((checkbox) => {
                    if (userSkillIds.has(parseInt(checkbox.value))) {
                        checkbox.checked = true;
                    }
                });
            } else {
                console.log("No user skills to pre-check.");
            }
        })
        .catch((error) => console.error("Error fetching user skills:", error));
}

function handleSkillChange(event) {
    const skillId = event.target.value;
    if (event.target.checked) {
        // Assign skill
        fetch(`${assignSkillsAPI}?action=assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                skill_id: skillId,
            }),
        })
            .then((response) => response.json())
            .then((result) => alert(result.message))
            .catch((error) => console.error("Error assigning skill:", error));
    } else {
        // Remove skill
        fetch(`${assignSkillsAPI}?action=remove&user_id=${userId}&skill_id=${skillId}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((result) => alert(result.message))
            .catch((error) => console.error("Error removing skill:", error));
    }
}
