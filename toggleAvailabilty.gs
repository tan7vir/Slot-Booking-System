/**
 * Toggles the availability of a slot between "Not Available" and "Available".
 * 
 * @param {number} row - The row index of the slot.
 * @param {number} col - The column index of the slot.
 * @returns {string} - Confirmation message indicating success or failure.
 */
function toggleSlotAvailability(row, col) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cell = sheet.getRange(row, col);
  var currentColor = cell.getBackground();
  console.log ( currentColor );

  if (currentColor === "#ffffff" || currentColor === CELL_COLOR){
    return "Can not toggle this slot";
  }
  // If the slot is marked as "Not Available", make it "Available"
  else if (currentColor === NOT_AVAILABLE_COLOR) {
    cell.setValue("");
    cell.setNote(""); // Clear any notes
    cell.setBackground(NORMAL_COLOR);
    return "Slot marked as Available ✅";
  } 
  // If the slot is marked as "Available", make it "Not Available"
  else {
    var existingValue = cell.getValue();
    var existingNote = cell.getNote();
    var previousUserEmail = extractEmailFromNote(existingNote);

    // Notify the previous user that their slot has been canceled
    if (previousUserEmail) {
      MailApp.sendEmail({
        to: previousUserEmail,
        subject: "Slot Booking Cancellation Notice",
        body: `Dear ${existingValue},\n\nYour booked slot( ${sheet.getRange(row, 1).getValue()}) for tomorrow has been canceled by the admin.\n\nIf you have any concerns, please contact the administration.\n\nThank you!`,
      });
    }

    // Toggle the slot to "Available"
    cell.setValue("(Not Available)");
    cell.setNote(""); // Clear any notes
    cell.setBackground(NOT_AVAILABLE_COLOR);

    return "Slot cleared and marked as Not Available ✅";
  }
}

/**
 * Test function to check the toggleSlotAvailability functionality.
 */
function checkingToggle() {
  console.log ( toggleSlotAvailability(8, 1)); // Example: Toggle availability for row 8, column 2
}
