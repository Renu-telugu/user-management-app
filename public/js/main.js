document.addEventListener('DOMContentLoaded', function() {
  // Form validation
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          showFieldError(field, 'This field is required');
        } else {
          clearFieldError(field);
          
          // Email validation
          if (field.type === 'email' && !validateEmail(field.value)) {
            isValid = false;
            showFieldError(field, 'Please enter a valid email address');
          }
          
          // Password validation for registration
          if (field.name === 'password' && form.id === 'addUserForm' && field.value.length < 6) {
            isValid = false;
            showFieldError(field, 'Password must be at least 6 characters');
          }
        }
      });
      
      if (!isValid) {
        event.preventDefault();
      }
    });
  });
  
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', function() {
      const searchTerm = this.value.toLowerCase();
      const tableRows = document.querySelectorAll('#usersTable tbody tr');
      
      tableRows.forEach(row => {
        const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        if (username.includes(searchTerm) || email.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      if (!confirm('Are you sure you want to delete this user?')) {
        event.preventDefault();
      }
    });
  });
  
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      alert.style.display = 'none';
    });
  }, 5000);
  
  // Handle sorting
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
      
      sortTable(table, index, sortDirection);
    });
  });
});

function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add('is-invalid');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  const existingError = field.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function sortTable(table, columnIndex, direction) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();
    
    if (direction === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  rows.forEach(row => row.remove());

  rows.forEach(row => tbody.appendChild(row));
} 