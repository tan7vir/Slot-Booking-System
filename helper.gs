/**
 * Formats a date object into MM/DD/YYYY format.
 * 
 * @param {Date} date - The date object to format.
 * @returns {string} - The formatted date string.
 */
function formatDateForStorage(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MM/dd/yyyy");
}

/**
 * Formats a date object into "d MMMM, yyyy" format for display.
 * 
 * @param {Date} date - The date object to format.
 * @returns {string} - The formatted date string.
 */
function formatDateForDisplay(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "d MMMM, yyyy");
}


// Check if the user is an admin
function isAdmin(userEmail) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var startRow = 8;  // Start checking from row 8
  var col = 11;      // Column K (11th column)
  
  var row = startRow;
  while (sheet.getRange(row, col).getValue() !== "") { // Loop until an empty cell
    var storedEmail = sheet.getRange(row, col).getValue().trim();
    if (storedEmail === userEmail) {
      return true;  // ✅ Email exists in the column → User is an admin
    }
    row++; // Move to the next row
  }
  
  return false; // ❌ Email not found in the admin list
}

function testBookSlot() {
  // Test the function with sample data
  var row = 8;  // Test row 4
  var col = 2;  // Test column 4
  var studentName = "Tan Vir";
  var studentEmail = "tanvirul1.niloy@northsouth.edu";

  if (isAdmin(studentEmail)) {
    var result = bookAdminSlot(8, 5, "Admin Name12", studentEmail, "02/08/2025", "02/08/2025", true);
  } else {
    var result = bookSlot(row, col, studentName, studentEmail);
  }
  
  // Log the result
  Logger.log(result);
}

function checkOnOff( ) {
  // Read the value from row 5, column 3
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cellValue = sheet.getRange(5, 3).getValue(); // Row 5, Column 3

  // Convert the value to a string and trim whitespace
  cellValue = String(cellValue || "").trim().toLowerCase();

  // Check if the value is "on" or "off"
  if (cellValue === "on") {
    return true; // Return true for "On"
  } else if (cellValue === "off") {
    return false; // Return false for "Off"
  } else {
    return null; // Return null for invalid values
  }
}



/**
 * Toggles the value in row 5, column 3 between "On" and "Off".
 * 
 * @param {Sheet} sheet - The active sheet.
 */
function toggleOnOff( ) {
  // Read the current value from row 5, column 3
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currentValue = sheet.getRange(5, 3).getValue();
  currentValue = String(currentValue || "").trim().toLowerCase();

  // Determine the new value
  var newValue = "";
  if (currentValue === "on") {
    newValue = "Off"; // Toggle "On" to "Off"
  } else if (currentValue === "off") {
    newValue = "On"; // Toggle "Off" to "On"
  } else {
    // If the current value is invalid, set it to "Off" by default
    newValue = "Off";
  }

  // Write the new value back to row 5, column 3
  sheet.getRange(5, 3).setValue(newValue);
}