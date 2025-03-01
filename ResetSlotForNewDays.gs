/**
 * Resets all slots for a new day.
 * 
 * This function performs the following steps:
 * 1. Calculates tomorrow's date and formats it for storage (MM/DD/YYYY) and display ("5 February, 2025").
 * 2. Updates the date and day cells in the Google Sheet.
 * 3. Iterates through all slots starting from row 6 to reset expired or invalid bookings:
 *    - Clears student bookings (red cells).
 *    - Clears admin bookings (purple cells) if their end date has passed.
 * 4. Resets the background color of cleared slots to the default "Available" color.
 * 5. Logs the completion of the process.
 */
function resetSlotsForNewDay() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Get tomorrow's date (since we reset at midnight)
  var today = new Date();
  today.setDate(today.getDate() + 1);


  // Generating new sheet for the new day.
  var newSheetName = Utilities.formatDate(today, Session.getScriptTimeZone(), "d MMMM, yyyy");
  
  // Duplicate the active sheet and rename it
  var newSheet = sheet.copyTo(spreadsheet);
  newSheet.setName(newSheetName);
  
  // Move the backup sheet to the front (index 1) and make it the active sheet
  spreadsheet.setActiveSheet(newSheet);
  spreadsheet.moveActiveSheet(1);
  
  // Store date in MM/DD/YYYY format but display as "5 February, 2025"
  var storedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), "MM/dd/yyyy");
  var displayDate = Utilities.formatDate(today, Session.getScriptTimeZone(), "d MMMM, yyyy");
  var formattedDay = Utilities.formatDate(today, Session.getScriptTimeZone(), "EEEE");
  
  // Update Date and Day cells
  sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(4, 5).setValue(displayDate);  
  sheet.getRange(5, 5).setValue(formattedDay);
  
  // Get range of all slots (Assuming bookings start from row 6)
  var dataRange = sheet.getRange(6, 1, sheet.getMaxRows() - 5, sheet.getMaxColumns());
  var backgrounds = dataRange.getBackgrounds();
  var values = dataRange.getValues();
  var notes = dataRange.getNotes();
  
  // Convert today to a comparable Date object
  var todayParts = storedDate.split("/");
  var todayDate = new Date(todayParts[2], todayParts[0] - 1, todayParts[1]); 
  todayDate.setHours(0, 0, 0, 0);
  
  // Iterate through the range to reset slots
  for (var i = 0; i < backgrounds.length; i++) {
    for (var j = 0; j < backgrounds[i].length; j++) {
      var cellNote = notes[i][j].trim(); // Get cell note (comment)
      
      // Reset **User Bookings** (Red Cells)
      if (backgrounds[i][j] === STUDENT_COLOR) { 
        values[i][j] = "";   // Clear value
        notes[i][j] = "";    // Clear note
        backgrounds[i][j] = NORMAL_COLOR; // Reset background
      }
      
      // Reset **Admin Bookings** (Purple Cells) if expired
      if (backgrounds[i][j] === ADMIN_COLOR) { 
        var dateRange = cellNote.match(/\d{1,2}\/\d{1,2}\/\d{4}/g); // Extract dates
        if (dateRange && dateRange.length === 2) {
          var endDateParts = dateRange[1].split("/");  // End date
          var endDate = new Date(endDateParts[1] - 1, endDateParts[0], endDateParts[2]);
          endDate.setHours(0, 0, 0, 0);
          if (todayDate > endDate) { // If today is past the end date
            values[i][j] = "";   // Clear value
            notes[i][j] = "";    // Clear note
            backgrounds[i][j] = NORMAL_COLOR; // Reset background
          }
        }
      }
    }
  }
  
  // Apply changes back to the sheet
  dataRange.setValues(values);
  dataRange.setNotes(notes);
  dataRange.setBackgrounds(backgrounds);

  deleteOldSheets(); // Delete Previous sheets except newst 7 days.
  
  Logger.log("Slots reset for the new day.");
}

/**
 * Deletes all sheets except those created in the last 7 days.
 * 
 * This function performs the following steps:
 * 1. Retrieves all sheets in the active spreadsheet.
 * 2. Parses the sheet names to extract their creation dates (assumes names are in "d MMMM, yyyy" format).
 * 3. Compares each sheet's date with the current date to determine if it is older than 7 days.
 * 4. Deletes sheets older than 7 days.
 */
function deleteOldSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets(); // Get all sheets in the spreadsheet
  
  var today = new Date(); // Current date
  today.setHours(0, 0, 0, 0); // Normalize time to midnight for accurate comparison
  
  // Loop through all sheets
  for (var i = sheets.length - 1; i >= 0; i--) { // Iterate backwards to avoid index issues when deleting
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    
    // Parse the sheet name to extract the date
    var sheetDate = parseDateFromSheetName(sheetName);
    
    if (sheetDate) { // If the sheet name contains a valid date
      var timeDifference = (today - sheetDate) / (1000 * 60 * 60 * 24); // Difference in days

      if (timeDifference > 7) { // If the sheet is older than 7 days
        spreadsheet.deleteSheet(sheet); // Delete the sheet
      }
    }
  }
  
  Logger.log("Old sheets deleted successfully.");
}

/**
 * Parses a date from a sheet name in the format "d MMMM, yyyy".
 * 
 * @param {string} sheetName - The name of the sheet.
 * @return {Date|null} - The parsed date or null if parsing fails.
 */
function parseDateFromSheetName(sheetName) {
  try {
    // Attempt to parse the date using the expected format
    var parsedDate = new Date(sheetName); // Convert sheet name to a Date object
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }
    return parsedDate; // Return as a Date object
  } catch (e) {
    Logger.log(`Failed to parse date from sheet name: ${sheetName}`);
    return null; // Return null if parsing fails
  }
}