// Registration functionality
document.getElementById('regForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const location = document.getElementById('regLocation').value;
  
    const data = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      location: location
    };
  
    fetch('http://localhost/skill_sharing/users_api.php?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log("data: ", data);
      const messageDiv = document.getElementById('regMessage');
      if (data.success) {
        messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      }
    })
    .catch(error => {
      const messageDiv = document.getElementById('regMessage');
      messageDiv.innerHTML = `<div class="alert alert-danger">Registration failed: ${error.message}</div>`;
    });
  });
  
  // Login functionality
  document.getElementById('loginFormSubmit').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
  
    const data = {
      email: email,
      password: password
    };
  
    fetch('http://localhost/skill_sharing/users_api.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      const messageDiv = document.getElementById('loginMessage');
      if (data.success) {
        messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        // Optionally, redirect to another page or show the user's dashboard.
        localStorage.setItem("user_id",data.user_id);
        console.log("data.user_id: ", data);
        window.location.href = 'home.html';
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
      }
    })
    .catch(error => {
      const messageDiv = document.getElementById('loginMessage');
      messageDiv.innerHTML = `<div class="alert alert-danger">Login failed: ${error.message}</div>`;
    });
  });
  