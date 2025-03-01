// Constants for different colors used in the application
const STUDENT_COLOR = "#d6e6ff";
const NORMAL_COLOR = "#dfffd6";
const ADMIN_COLOR = "#d8bfd8";
const NOT_AVAILABLE_COLOR = "#ff6561";
const CELL_COLOR = "#003366";

/**
 * Handles GET requests to fetch game schedule and user details.
 * @param {Object} event - The event object containing request parameters.
 * @returns {ContentService.Output} - JSON response with success status and data.
 */
const doGet = (event = {}) => {
  const token = event.parameter.token;

  // Check if token is provided
  if (!token) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No token provided" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Validate the provided Google token
  const validationResult = validateGoogleToken(token);
  if (validationResult.error) {
    return ContentService.createTextOutput(JSON.stringify(validationResult))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Extract user details from validation result
  const userName = validationResult.name || "Unknown";
  const userEmail = validationResult.email || "Unknown";
  const userPicture = validationResult.picture || null;

  // Access the Google Spreadsheet and fetch some value (for example, from row 4, column 5)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cellValue = sheet.getRange(4, 5).getValue(); 

  // Fetch game schedule for a specific user
  var returnData = getGameSchedule("tanvirul.niloy@northsouth.edu");
  console.log(returnData.toDay.indoorGames['Badminton Court 2']);

  return ContentService.createTextOutput(JSON.stringify({ success: true, Data: returnData }))
    .setMimeType(ContentService.MimeType.JSON);
};

/**
 * Handles POST requests to perform actions like booking slots.
 * @param {Object} e - The event object containing request data.
 * @returns {ContentService.Output} - JSON response with success status and message.
 */
const doPost = (e = {}) => {
  const requestData = JSON.parse(e.postData.contents);
  const token = requestData.token;

  // Check if token is provided
  if (!token) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "No token provided" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Validate the provided Google token
  const validationResult = validateGoogleToken(token);
  if (validationResult.error) {
    return ContentService.createTextOutput(JSON.stringify(validationResult))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Extract user details from validation result
  const userName = validationResult.name || "Unknown";
  const userEmail = validationResult.email || "Unknown";
  const userPicture = validationResult.picture || null;

  // Parse row, column, and action from request data
  var row = parseInt(requestData.row, 10);
  var col = parseInt(requestData.col, 10);
  var action = requestData.action;
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Validate row and column values
  if (isNaN(row) || isNaN(col) || row < 1 || col < 1 || row > sheet.getMaxRows() || col > sheet.getMaxColumns()) {
    return createErrorResponse("Invalid row or column values.", origin);
  }

  // Log the action attempt
  Logger.log(`User ${userEmail} (${userName}) attempted action: ${action} at row: ${row}, col: ${col}`);

  var success = true;
  var result;

  // Perform the requested action
  switch (action) {
    case "bookSlot":
      result = isAdmin(userEmail) ? bookAdminSlot(row, col, userName, userEmail, requestData.force)
        : bookSlot(row, col, userName, userEmail);
      break;
    case "toggleAvailability":
      result = isAdmin(userEmail) ? toggleSlotAvailability(row, col)
        : "Only admins can toggle slot availability.";
      break;
    default:
      message = "Slot Booking Failed.";
      success = false;
      break;
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: result }))
    .setMimeType(ContentService.MimeType.JSON);
};
