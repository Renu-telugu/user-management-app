// Main JS file for the user management system

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Form validation logic
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      // Check each required field
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          // Field is empty
          isValid = false;
          showFieldError(field, 'This field is required');
        } else {
          clearFieldError(field);
          
          // Extra validation for email fields
          if (field.type === 'email' && !validateEmail(field.value)) {
            isValid = false;
            showFieldError(field, 'Please enter a valid email address');
          }
          
          // Make sure passwords are strong enough
          if (field.name === 'password' && form.id === 'addUserForm' && field.value.length < 6) {
            isValid = false;
            showFieldError(field, 'Password must be at least 6 characters');
          }
        }
      });
      
      // Stop the form submission if validation failed
      if (!isValid) {
        event.preventDefault();
      }
    });
  });
  
  // Live search functionality for the user table
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', function() {
      const searchTerm = this.value.toLowerCase();
      const tableRows = document.querySelectorAll('#usersTable tbody tr');
      
      // Filter the table rows based on search term
      tableRows.forEach(row => {
        const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        // Show/hide rows based on search term match
        if (username.includes(searchTerm) || email.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  
  // Confirm delete operations
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      // Double check before deleting
      if (!confirm('Are you sure you want to delete this user?')) {
        event.preventDefault();
      }
    });
  });
  
  // Auto-hide alerts after 5 seconds
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      alert.style.display = 'none';
    });
  }, 5000);
  
  // Table sorting functionality
  const tableSortHeaders = document.querySelectorAll('.sortable');
  tableSortHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const table = this.closest('table');
      const index = Array.from(this.parentNode.children).indexOf(this);
      const sortDirection = this.classList.contains('sort-asc') ? 'desc' : 'asc';
      
      // Reset all headers
      tableSortHeaders.forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
      });
      
      // Set current sort direction
      this.classList.add(`sort-${sortDirection}`);
      
      // Sort the table
      sortTable(table, index, sortDirection);
    });
  });
});

// Helper functions

// Show validation errors under form fields
function showFieldError(field, message) {
  // Clear any existing error
  clearFieldError(field);
  
  // Add error class to field
  field.classList.add('is-invalid');
  
  // Create and append error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

// Remove validation errors
function clearFieldError(field) {
  field.classList.remove('is-invalid');
  const existingError = field.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

// Simple email validator
function validateEmail(email) {
  // Regular expression for basic email validation
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Function to sort table data
function sortTable(table, columnIndex, direction) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Sort the rows
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();
    
    if (direction === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
  
  // Remove existing rows
  rows.forEach(row => row.remove());
  
  // Add sorted rows
  rows.forEach(row => tbody.appendChild(row));
} 