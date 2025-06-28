// Improved client-side authentication system with registration requirement
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');
    const userActionsContainer = document.querySelector('.user-actions');

    // Current logged in user
    let currentUser = null;
    
    // Users database (JSON storage)
    let usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || {};

    // Check if user is already logged in from localStorage
    function checkLoggedInUser() {
        const savedUserId = localStorage.getItem('currentUserId');
        const savedUsername = localStorage.getItem('username');
        const savedEmail = localStorage.getItem('email');
        const savedProfilePic = localStorage.getItem('profilePic');
        
        if (savedUserId && savedUsername && usersDB[savedUserId]) {
            currentUser = {
                id: savedUserId,
                username: savedUsername,
                email: savedEmail || '',
                profile_pic: savedProfilePic || null
            };
            updateUIAfterLogin();
        }
    }

    // Event Listeners
    // Check if user is already logged in
    checkLoggedInUser();
    
    // Login button click
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
    }

    // Signup button click
    if (signupButton) {
        signupButton.addEventListener('click', () => {
            signupModal.style.display = 'flex';
        });
    }

    // Close modal buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
        });
    });

    // Show signup link
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            signupModal.style.display = 'flex';
        });
    }

    // Show login link
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Click outside to close modals
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
        }
    });

    // Handle login form submission
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Validate inputs
        if (!username || !password) {
            showNotification('Please enter both username and password!', 'error');
            return;
        }
        
        // Simulate API call delay
        showNotification('Logging in...', 'info');
        
        setTimeout(() => {
            // Find user by username
            let userId = null;
            let foundUser = null;
            
            // Search for user in the database
            Object.keys(usersDB).forEach(id => {
                if (usersDB[id].username === username) {
                    userId = id;
                    foundUser = usersDB[id];
                }
            });
            
            if (foundUser && foundUser.password === password) {
                // Login successful
                currentUser = {
                    id: userId,
                    username: foundUser.username,
                    email: foundUser.email,
                    profile_pic: foundUser.profile_pic || null
                };
                
                // Save user info in localStorage for persistence
                localStorage.setItem('currentUserId', currentUser.id);
                localStorage.setItem('username', currentUser.username);
                localStorage.setItem('email', currentUser.email);
                if (currentUser.profile_pic) {
                    localStorage.setItem('profilePic', currentUser.profile_pic);
                }
                
                // Update UI
                updateUIAfterLogin();
                
                // Close modal
                loginModal.style.display = 'none';
                
                // Reset form
                loginForm.reset();
                
                showNotification('Login successful!', 'success');
            } else {
                showNotification('Invalid username or password!', 'error');
            }
        }, 1000);
    }

    // Handle signup form submission
    function handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('newUsername').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }
        
        // Validate inputs
        if (!username || !email || !password) {
            showNotification('Please fill out all fields!', 'error');
            return;
        }
        
        // Check if username already exists
        const usernameExists = Object.values(usersDB).some(user => user.username === username);
        if (usernameExists) {
            showNotification('Username already exists!', 'error');
            return;
        }
        
        // Check if email already exists
        const emailExists = Object.values(usersDB).some(user => user.email === email);
        if (emailExists) {
            showNotification('Email already exists!', 'error');
            return;
        }
        
        // Simulate API call delay
        showNotification('Creating account...', 'info');
        
        setTimeout(() => {
            // Generate a unique ID
            const userId = Date.now().toString();
            
            // Create new user
            const newUser = {
                username: username,
                email: email,
                password: password,
                profile_pic: null,
                created_at: new Date().toISOString()
            };
            
            // Add user to database
            usersDB[userId] = newUser;
            
            // Save updated database to localStorage
            localStorage.setItem('usersDatabase', JSON.stringify(usersDB));
            
            // Log in the new user
            currentUser = {
                id: userId,
                username: username,
                email: email,
                profile_pic: null
            };
            
            // Save user info in localStorage for persistence
            localStorage.setItem('currentUserId', currentUser.id);
            localStorage.setItem('username', currentUser.username);
            localStorage.setItem('email', currentUser.email);
            
            // Export users database to JSON file (in real app this would be server-side)
            exportUsersToJson();
            
            // Update UI
            updateUIAfterLogin();
            
            // Close modal
            signupModal.style.display = 'none';
            
            // Reset form
            signupForm.reset();
            
            showNotification('Account created successfully!', 'success');
        }, 1000);
    }

    // Export users database to JSON file
    function exportUsersToJson() {
        // In a real application, this would be done server-side
        // For demonstration purposes, we'll create a downloadable JSON file
        
        const dataStr = JSON.stringify(usersDB, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        // Create export link (hidden)
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', 'users_backup.json');
        exportLink.style.display = 'none';
        document.body.appendChild(exportLink);
        
        // Automatically download in a real application
        // For demo purposes, we'll just add it to the dropdown menu
        const backupLink = document.getElementById('backupUsersLink');
        if (backupLink) {
            backupLink.setAttribute('href', dataUri);
            backupLink.setAttribute('download', 'users_backup.json');
        }
    }

    // Update UI after login
    function updateUIAfterLogin() {
        // Remove login and signup buttons
        userActionsContainer.innerHTML = '';
        
        // Create profile picture element
        const profileElement = document.createElement('div');
        profileElement.className = 'user-profile';
        
        let profilePicHTML = '';
        if (currentUser.profile_pic) {
            // If user has a profile picture
            profilePicHTML = `<img src="${currentUser.profile_pic}" alt="${currentUser.username}" class="profile-pic">`;
        } else {
            // If no profile picture, show circle with first letter of username
            profilePicHTML = `
                <div class="profile-circle">
                    ${currentUser.username.charAt(0).toUpperCase()}
                </div>
            `;
        }
        
        profileElement.innerHTML = profilePicHTML;
        
        // Add dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'profile-dropdown';
        dropdownMenu.innerHTML = `
            <div class="dropdown-header">
                ${profilePicHTML}
                <div class="user-info">
                    <h4>${currentUser.username}</h4>
                    <p>${currentUser.email}</p>
                </div>
            </div>
            <ul>
                <li><a href="#profile"><i class="fas fa-user"></i> Profile</a></li>
                <li><a href="#" id="changeProfilePic"><i class="fas fa-camera"></i> Change Picture</a></li>
                <li><a href="#settings"><i class="fas fa-cog"></i> Settings</a></li>
                <li><a href="#mylist"><i class="fas fa-list"></i> My List</a></li>
                <li><a href="#logout" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
            <input type="file" id="profilePicInput" accept="image/*" style="display: none;">
        `;
        
        // Append elements
        profileElement.appendChild(dropdownMenu);
        userActionsContainer.appendChild(profileElement);
        
        // Add event listener for profile click to show/hide dropdown
        profileElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Add event listener for logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
        
        // Add event listener for changing profile picture
        const changeProfilePicBtn = document.getElementById('changeProfilePic');
        if (changeProfilePicBtn) {
            changeProfilePicBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById('profilePicInput').click();
            });
        }
        
        // Handle profile picture change
        const profilePicInput = document.getElementById('profilePicInput');
        if (profilePicInput) {
            profilePicInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Create a file reader to read the selected image
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const imageDataUrl = event.target.result;
                        
                        // In a real application, you would upload this to your server
                        // For demo purposes, we'll just store the data URL in localStorage
                        localStorage.setItem('profilePic', imageDataUrl);
                        
                        // Update current user object
                        currentUser.profile_pic = imageDataUrl;
                        
                        // Update user in database
                        if (usersDB[currentUser.id]) {
                            usersDB[currentUser.id].profile_pic = imageDataUrl;
                            localStorage.setItem('usersDatabase', JSON.stringify(usersDB));
                        }
                        
                        // Update display
                        const allProfilePics = document.querySelectorAll('.profile-pic, .profile-circle');
                        allProfilePics.forEach(pic => {
                            if (pic.className === 'profile-pic') {
                                pic.src = imageDataUrl;
                            } else {
                                // Replace profile circle with profile pic
                                const parent = pic.parentElement;
                                parent.innerHTML = `<img src="${imageDataUrl}" alt="${currentUser.username}" class="profile-pic">`;
                            }
                        });
                        
                        showNotification('Profile picture updated successfully!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Setup backup users link
        exportUsersToJson();
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileElement.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Add keybinding for ESC to close dropdown
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Logout function
    function logout() {
        // Clear current user
        currentUser = null;
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('profilePic');
        
        // Restore original buttons
        userActionsContainer.innerHTML = `
            <button class="btn login-btn" id="loginButton">Login</button>
            <button class="btn signup-btn" id="signupButton">Sign Up</button>
        `;
        
        // Re-add event listeners
        document.getElementById('loginButton').addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
        
        document.getElementById('signupButton').addEventListener('click', () => {
            signupModal.style.display = 'flex';
        });
        
        showNotification('Logged out successfully!', 'success');
    }

    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Append to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});

// Add CSS for profile picture, dropdown, and notifications
document.addEventListener('DOMContentLoaded', function() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .user-profile {
            position: relative;
            cursor: pointer;
        }
        
        .profile-pic {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary-color, #ff92a6);
        }
        
        .profile-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--primary-color, #ff92a6);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
        }
        
        .profile-dropdown {
            position: absolute;
            top: 50px;
            right: 0;
            background-color: var(--card-background, #1a1a1a);
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            width: 250px;
            display: none;
            z-index: 1000;
            border: 1px solid var(--border-color, #333);
            overflow: hidden;
        }
        
        .profile-dropdown.show {
            display: block;
        }
        
        .dropdown-header {
            padding: 15px;
            border-bottom: 1px solid var(--border-color, #333);
            display: flex;
            align-items: center;
            background-color: rgba(255, 182, 193, 0.1);
        }
        
        .dropdown-header .profile-pic,
        .dropdown-header .profile-circle {
            width: 50px;
            height: 50px;
            margin-right: 15px;
        }
        
        .user-info {
            overflow: hidden;
        }
        
        .user-info h4 {
            margin: 0 0 5px 0;
            color: var(--text-primary, #fff);
        }
        
        .user-info p {
            margin: 0;
            font-size: 0.8rem;
            color: var(--text-secondary, #aaa);
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
        
        .profile-dropdown ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .profile-dropdown ul li {
            padding: 0;
            margin: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .profile-dropdown ul li:last-child {
            border-bottom: none;
        }
        
        .profile-dropdown ul li a {
            display: block;
            padding: 12px 15px;
            color: var(--text-primary, #fff);
            transition: all 0.2s ease;
            text-decoration: none;
        }
        
        .profile-dropdown ul li a:hover {
            background-color: rgba(255, 182, 193, 0.1);
            color: var(--primary-color, #ff92a6);
        }
        
        .profile-dropdown ul li a i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
            color: var(--primary-color, #ff92a6);
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s, transform 0.3s;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }
        
        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification.success {
            background-color: #4CAF50;
        }
        
        .notification.error {
            background-color: #F44336;
        }
        
        .notification.warning {
            background-color: #FFC107;
            color: #333;
        }
        
        .notification.info {
            background-color: #2196F3;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .profile-dropdown {
                width: 100%;
                left: 0;
                right: 0;
                top: 60px;
                border-radius: 0;
            }
        }
    `;

    // Append style to head
    document.head.appendChild(styleElement);
});