// Role detection utility based on email patterns
export function detectRoleFromEmail(email) {
  const emailLower = email.toLowerCase();
  
  // Admin detection - must contain admin and college domain
  if (emailLower.includes("admin") && emailLower.includes("@college.edu")) {
    return "admin";
  }
  
  // Teacher/Faculty detection
  if (emailLower.includes("@teacher.college.edu") || 
      emailLower.includes("@faculty.college.edu") ||
      emailLower.includes("@prof.college.edu")) {
    return "teacher";
  }
  
  // Staff detection
  if (emailLower.includes("@staff.college.edu")) {
    return "staff";
  }
  
  // Librarian detection
  if (emailLower.includes("@library.college.edu") || 
      emailLower.includes("@librarian.college.edu")) {
    return "librarian";
  }
  
  // Accountant detection
  if (emailLower.includes("@accounting.college.edu") || 
      emailLower.includes("@finance.college.edu")) {
    return "accountant";
  }
  
  // HR detection
  if (emailLower.includes("@hr.college.edu") || 
      emailLower.includes("@humanresources.college.edu")) {
    return "hr";
  }
  
  // Student detection
  if (emailLower.includes("@student.college.edu") || 
      emailLower.includes("@college.edu")) {
    return "student";
  }
  
  // Fallback to student for any other college domain
  if (emailLower.includes("@college.edu")) {
    return "student";
  }
  
  // Default fallback
  return "student";
}

// Test ID validation - No longer required for any role
export function validateTestId(role, testId) {
  // Test ID is no longer required for any role
  return true;
}

// Determine approval authority based on role
export function getApprovalAuthority(role) {
  // All users go to registration block for admin approval
  return 'registration_block';
}

// Validation function to check if email is valid
export function isValidCollegeEmail(email) {
  // Allow any valid email format for development
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
