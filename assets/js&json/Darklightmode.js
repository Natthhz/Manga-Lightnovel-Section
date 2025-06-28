 // Dark/Light mode toggle
 const modeToggle = document.getElementById('mode-toggle');
 if (modeToggle) {
     modeToggle.addEventListener('click', function() {
         document.body.classList.toggle('dark-mode');
         
         // Toggle icon between sun and moon
         const icon = this.querySelector('i');
         if (icon.classList.contains('fa-sun')) {
             icon.classList.remove('fa-sun');
             icon.classList.add('fa-moon');
         } else {
             icon.classList.remove('fa-moon');
             icon.classList.add('fa-sun');
         }
         
         // Save preference to localStorage
         const isDarkMode = document.body.classList.contains('dark-mode');
         localStorage.setItem('darkMode', isDarkMode);
     });
     
     // Check for saved preference
     if (localStorage.getItem('darkMode') === 'true') {
         document.body.classList.add('dark-mode');
         const icon = modeToggle.querySelector('i');
         icon.classList.remove('fa-sun');
         icon.classList.add('fa-moon');
     }
 }
 