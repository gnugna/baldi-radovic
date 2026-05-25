/**
 * Google Apps Script — Wedding RSVP webhook
 *
 * Writes ONE ROW PER GUEST with individual day columns (boolean).
 *
 * Setup:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code into Code.gs
 * 4. Click Deploy > New deployment
 * 5. Select type: Web app
 * 6. Set "Execute as: Me" and "Who has access: Anyone"
 * 7. Click Deploy and copy the URL
 * 8. Paste the URL into APPS_SCRIPT_URL in each team page's HTML
 */

var HEADERS = [
  'Timestamp',
  'Team',
  'Email',
  'Attending',
  'Friday',
  'Sat Pool',
  'Sat Dinner',
  'Sun Lunch',
  'Sun Dinner',
  'Monday',
  'First Name',
  'Last Name',
  'Adult/Child',
  'Age',
  'Dietary Requirements',
  'Allergy Details',
  'Alcohol',
  'Notes'
];

var DINNER_SHEET_NAME = 'Sat Dinner Choices';
var DINNER_HEADERS = [
  'Timestamp',
  'Email',
  'First Name',
  'Last Name',
  'Starter',
  'Main',
  'Notes'
];

function doPost(e) {
  var data;

  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.kind === 'dinner_choice') {
    return handleDinnerChoice(data);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Create headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }

  var timestamp = data.timestamp || new Date().toISOString();
  var team = data.team || '';
  var email = data.email || '';
  var attending = data.attending !== false ? 'Yes' : 'No';
  var friday = data.friday ? 'Yes' : 'No';
  var sat_pool = data.sat_pool ? 'Yes' : 'No';
  var sat_dinner = data.sat_dinner ? 'Yes' : 'No';
  var sun_lunch = data.sun_lunch ? 'Yes' : 'No';
  var sun_dinner = data.sun_dinner ? 'Yes' : 'No';
  var monday = data.monday ? 'Yes' : 'No';
  var notes = data.notes || '';
  var guests = data.guests || [];

  // One row per guest
  for (var i = 0; i < guests.length; i++) {
    var g = guests[i];
    sheet.appendRow([
      timestamp,
      team,
      email,
      attending,
      friday,
      sat_pool,
      sat_dinner,
      sun_lunch,
      sun_dinner,
      monday,
      g.firstName || '',
      g.lastName || '',
      g.type || 'Adult',
      g.age || '',
      g.diet || '',
      g.allergy || '',
      g.alcohol || '',
      i === 0 ? notes : ''  // notes only on first row
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleDinnerChoice(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DINNER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DINNER_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(DINNER_HEADERS);
    sheet.getRange(1, 1, 1, DINNER_HEADERS.length).setFontWeight('bold');
  }

  var timestamp = data.timestamp || new Date().toISOString();
  var email = data.email || '';
  var notes = data.notes || '';
  var guests = data.guests || [];

  for (var i = 0; i < guests.length; i++) {
    var g = guests[i];
    sheet.appendRow([
      timestamp,
      email,
      g.firstName || '',
      g.lastName || '',
      g.starter || '',
      g.main || '',
      i === 0 ? notes : ''
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Wedding RSVP endpoint is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}
