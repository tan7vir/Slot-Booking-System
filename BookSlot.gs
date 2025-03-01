/**
 * Books a slot for a student.
 * Ensures only one slot can be booked per student per day.
 * Sends a confirmation email upon successful booking.
 * 
 * @param {number} row - The row index of the slot.
 * @param {number} col - The column index of the slot.
 * @param {string} studentName - The name of the student booking the slot.
 * @param {string} studentEmail - The email of the student booking the slot.
 * @returns {string} - Confirmation message indicating success or failure.
 */
function bookSlot(row, col, studentName, studentEmail) {

  if ( !checkOnOff () ) {
    return "Slot booking is currently off";
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cell = sheet.getRange(row, col);
  var cellColor = cell.getBackground();

  if (cellColor === ADMIN_COLOR || cellColor === STUDENT_COLOR) {
    return "This slot is already booked. ❌";
  } else if (cellColor === NOT_AVAILABLE_COLOR || cellColor === CELL_COLOR) {
    return "This slot is not open for booking. ❌";
  } else if (cellColor !== NORMAL_COLOR) {
    return "Please apply for a valid slot.";
  }

  if (hasStudentBookedSlot(studentName, studentEmail)) {
    return "You have already booked a slot.\nOnly one slot can be booked per day.";
  }

  if (cell.getValue() === "") {
    cell.setValue(studentName);
    cell.setNote("Booked by: " + studentName + "\nEmail: " + studentEmail);
    cell.setBackground(STUDENT_COLOR);

    var slotType = sheet.getRange(row, 1).getValue();
    var bookedDateObj = new Date();
    var formattedDate = Utilities.formatDate(bookedDateObj, Session.getScriptTimeZone(), "MM/dd/yyyy");
    var displayDate = Utilities.formatDate(bookedDateObj, Session.getScriptTimeZone(), "d MMMM, yyyy");
    sheet.getRange(4, 5).setValue(formattedDate);
    var bookedDay = sheet.getRange(5, 5).getDisplayValue();
    var bookedTime = sheet.getRange(7, col).getDisplayValue();

    MailApp.sendEmail({
      to: studentEmail,
      subject: "NSU Sports Slot Booking Confirmation",
      body: `Dear ${studentName},\n\nYou have successfully booked your slot for ${slotType}.\n\nSlot Details:\nDay: ${bookedDay}\nDate: ${displayDate}\nTime: ${bookedTime}\n\nThank you!`,
    });

    Logger.log(`✅ Slot booked successfully for: ${studentName} on ${displayDate}`);
    return "Booking Successful ✅";
  } else {
    return "Slot already booked ❌";
  }
}

/**
 * Books a slot for an admin.
 * Allows admins to book slots with a start and end date.
 * Sends a confirmation email upon successful booking.
 * 
 * @param {number} row - The row index of the slot.
 * @param {number} col - The column index of the slot.
 * @param {string} adminName - The name of the admin booking the slot.
 * @param {string} adminEmail - The email of the admin booking the slot.
 * @param {string} startDate - Start date in MM/DD/YYYY format.
 * @param {string} endDate - End date in MM/DD/YYYY format.
 * @param {boolean} force - Whether to overwrite existing bookings.
 * @returns {string} - Confirmation message indicating success or failure.
 */
function bookAdminSlot(row, col, adminName, adminEmail, startDate, endDate, force) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cell = sheet.getRange(row, col);
  var cellColor = cell.getBackground();

  if (cellColor === ADMIN_COLOR || cellColor === STUDENT_COLOR || cellColor === NORMAL_COLOR) {
    // Valid slot color
  } else {
    return "Please apply for a valid slot.";
  }

  var referenceDateObj = new Date(sheet.getRange(4, 5).getValue());
  var displayReferenceDate = Utilities.formatDate(referenceDateObj, Session.getScriptTimeZone(), "d MMMM, yyyy");
  var startDateObj = new Date(startDate);
  var endDateObj = new Date(endDate);

  startDateObj.setHours(0, 0, 0, 0);
  endDateObj.setHours(0, 0, 0, 0);
  referenceDateObj.setHours(0, 0, 0, 0);

  if (startDateObj < referenceDateObj) {
    return `❌ Start date cannot be before ${displayReferenceDate}`;
  }

  if (cellColor === "white" || cellColor === CELL_COLOR) {
    return "Please apply for a valid slot.";
  }

  var existingValue = cell.getValue();
  var existingNote = cell.getNote();

  if (existingValue !== "" && !force) {
    return `Slot already booked by ${existingValue}. Cannot overwrite! ❌`;
  }

  if (existingValue !== "" && force) {
    var previousUserEmail = extractEmailFromNote(existingNote);
    if (previousUserEmail) {
      MailApp.sendEmail({
        to: previousUserEmail,
        subject: "Slot Booking Cancellation Notice",
        body: `Dear ${existingValue},\n\nYour booked slot for ${Utilities.formatDate(startDateObj, Session.getScriptTimeZone(), "d MMMM, yyyy")} has been canceled by the admin.\n\nIf you have any concerns, please contact the administration.\n\nThank you!`,
      });
    }
  }

  var formattedStartDateForNote = Utilities.formatDate(startDateObj, Session.getScriptTimeZone(), "dd/MM/yyyy");
  var formattedEndDateForNote = Utilities.formatDate(endDateObj, Session.getScriptTimeZone(), "dd/MM/yyyy");

  cell.setValue(adminName);
  cell.setNote(`Booked by: ${adminName}\nEmail: ${adminEmail}\nDuration: ${formattedStartDateForNote} - ${formattedEndDateForNote}`);
  cell.setBackground(ADMIN_COLOR);

  MailApp.sendEmail({
    to: adminEmail,
    subject: "Admin Slot Booking Confirmation",
    body: `Dear ${adminName},\n\nYou have successfully booked a slot for:\n\nActivity: ${sheet.getRange(row, 1).getValue()}\nDate Range: ${Utilities.formatDate(startDateObj, Session.getScriptTimeZone(), "d MMMM, yyyy")} - ${Utilities.formatDate(endDateObj, Session.getScriptTimeZone(), "d MMMM, yyyy")}\n\nThank you!`,
  });

  Logger.log(`✅ Admin Slot Booked by ${adminName} for ${Utilities.formatDate(startDateObj, Session.getScriptTimeZone(), "d MMMM, yyyy")} - ${Utilities.formatDate(endDateObj, Session.getScriptTimeZone(), "d MMMM, yyyy")}`);
  return "✅ Admin slot booked successfully!";
}

/**
 * Checks if a student has already booked a slot.
 * 
 * @param {string} studentName - The name of the student.
 * @param {string} studentEmail - The email of the student.
 * @returns {boolean} - True if the student has already booked a slot, false otherwise.
 */
function hasStudentBookedSlot(studentName, studentEmail) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  var notes = dataRange.getNotes();

  for (var row = 0; row < notes.length; row++) {
    for (var col = 0; col < notes[row].length; col++) {
      var cellNote = notes[row][col];
      if (cellNote.includes("Booked by: " + studentName) && cellNote.includes("Email: " + studentEmail)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extracts an email address from a cell note.
 * 
 * @param {string} note - The note content containing the email.
 * @returns {string|null} - The extracted email or null if not found.
 */
function extractEmailFromNote(note) {
  if (!note) return null;
  var match = note.match(/Email: (.+)/);
  return match ? match[1].trim() : null;
}