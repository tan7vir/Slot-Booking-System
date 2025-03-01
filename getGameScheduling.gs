function testGetGameSchedule () {
  var data = getGameSchedule ("tanvirul.niloy@northsouth.edu");
  // console.log(data);
  var temp = 'Badminton Court 1';
  var basketbal = 'Basketball'
  console.log(data.toDay.indoorGames[temp]);
  // console.log ( data);
}


/**
 * Retrieves the game schedule with slot details based on user email.
 * 
 * @param {string} userEmail - The email of the user requesting the schedule.
 * @returns {object} - The formatted game schedule object.
 */
/**
 * Retrieves the game schedule for both today and the previous day.
 * 
 * @param {string} userEmail - The email of the user requesting the schedule.
 * @returns {object} - The formatted game schedule object containing both today and prevDay.
 */
function getGameSchedule(userEmail) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();

  // Get today's date from the sheet (cell E4)
  var todayDate = formattedDate(sheet);

  // Calculate yesterday's date
  var prevDate = new Date(todayDate);
  prevDate.setDate(prevDate.getDate() - 1);
  var prevDateFormatted = Utilities.formatDate(prevDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

  // Fetch schedules for both today and yesterday
  var todaySchedule = fetchScheduleForDate(sheet, todayDate, userEmail);
  var prevDaySchedule = fetchScheduleForDate(sheet, prevDateFormatted, userEmail);

  var admin = isAdmin(userEmail);           

  // Combine both schedules into a single object
  return {
    available: checkOnOff(),
    isAdmin: admin,
    toDay : prevDaySchedule,
    nextDay : todaySchedule
  };
}

/**
 * Fetches the game schedule for a specific date.
 * 
 * @param {Sheet} sheet - The active sheet.
 * @param {string} date - The date for which the schedule is fetched (format: yyyy-MM-dd).
 * @param {string} userEmail - The email of the user requesting the schedule.
 * @returns {object} - The formatted game schedule for the specified date.
 */
function fetchScheduleForDate(sheet, date, userEmail) {
  var gamesSchedule = {
    date: date,
    timeSlots: [],
    indoorGames: {},
    outdoorGames: {}
  };

  var isIndoorGames = true; // Flag to track indoor vs outdoor games
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var backgrounds = dataRange.getBackgrounds();
  var notes = dataRange.getNotes();

  var timeSlots = values[6].slice(1); // Time slots from row 7 (index 6)

  // Time slots - extracting all the data after it find a space.
  for (var i = 0; i < timeSlots.length; i++) {
    if (timeSlots[i] === "") {
      timeSlots = timeSlots.slice(0, i); // Truncate the array
      break; // Exit the loop
    }
  }

  gamesSchedule.timeSlots = timeSlots;

  for (var i = 7; i < values.length; i++) { // Start from row 8 (index 7)
    var rowValue = values[i][0]; // First column (game name)

    // If we encounter a blank row, switch to outdoor games
    if (!rowValue) {
      isIndoorGames = false;
      continue; // Skip the blank row
    }

    var gameName = String(rowValue.trim());
    var gameSlots = {};

    for (var j = 1; j < values[i].length; j++) { 

      var cellColor = backgrounds[i][j];
      var cellNote = notes[i][j].trim();

      // Determine the status and bookedBy fields
      var status = "";
      var bookedBy = "";

      if (cellColor === NOT_AVAILABLE_COLOR) {
        status = "Not Available";
      } else if (cellColor === NORMAL_COLOR) {
        status = "Available";
      } else if (cellColor === STUDENT_COLOR || cellColor === ADMIN_COLOR) {
        var noteEmail = extractEmailFromNote(cellNote);
        if (noteEmail && noteEmail === userEmail) {
          status = "Booked by You";
          bookedBy = extractNameFromNote(cellNote);
        } else {
          status = "Booked";
          bookedBy = extractNameFromNote(cellNote);
        }
      } else {
        break;
      }

      gameSlots[j] = {
        status: status,
        bookedBy: bookedBy,
        row: i + 1,
        col: j + 1
      };
    }

    // Add the game to the appropriate section (indoor or outdoor)
    if (isIndoorGames) {
      gamesSchedule.indoorGames[gameName] = gameSlots;
    } else {
      gamesSchedule.outdoorGames[gameName] = gameSlots;
    }
  }

  return gamesSchedule;
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

/**
 * Extracts the name of the person who booked the slot from a cell note.
 * 
 * @param {string} note - The note content containing the name.
 * @returns {string|null} - The extracted name or null if not found.
 */
function extractNameFromNote(note) {
  if (!note) return null;
  var match = note.match(/Booked by: (.+)/);
  return match ? match[1].trim() : null;
}

/**
 * Formats the date from the sheet into "yyyy-MM-dd" format.
 * 
 * @param {Sheet} sheet - The active sheet.
 * @returns {string} - The formatted date.
 */
function formattedDate(sheet) {
  var cellValue = sheet.getRange(4, 5).getValue(); // Expected format: MM/dd/yyyy
  if (cellValue instanceof Date) {
    var timeZone = Session.getScriptTimeZone();
    return Utilities.formatDate(cellValue, timeZone, "yyyy-MM-dd");
  }
  return cellValue; // Fallback if the value is already a string
}


