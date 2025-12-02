// =====================================================================================
// BEAR CANYON VOLUNTEERS - BACKEND SCRIPT (TEXT-ONLY V9)
// =====================================================================================
// Instructions:
// 1. Open Extensions > Apps Script in your Google Sheet.
// 2. Paste this code.
// 3. Deploy > New deployment > Web app > Version: New version > Access: Anyone > Deploy.
// =====================================================================================

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action;
    var payload = data.payload;

    // Headers check
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID", "Submitted At", "Class Type", "Signup Type", "Parent Name", 
        "Student Name", "Email", "Is Recurring", "Date (Single)", "Interests", 
        "Other Details", "Admin Notes", "Contacted"
      ]);
    }

    // --- CREATE ---
    if (action === 'CREATE') {
      // Handle Time Slots (One row per date)
      if (payload.signupType === 'TIME_SLOT' && payload.dates && payload.dates.length > 0) {
        payload.dates.forEach(function(dateStr) {
          // CRITICAL: Prepend apostrophe to force Plain Text storage
          // This prevents Google from converting "2025-12-10" to a Date Object with Timezone
          var safeDate = "'" + dateStr; 

          sheet.appendRow([
            payload.id,
            payload.submittedAt,
            payload.classType,
            payload.signupType,
            payload.parentName,
            payload.studentName,
            payload.email,
            payload.isRecurring ? "TRUE" : "FALSE",
            safeDate, 
            "[]",
            payload.otherDetails || "",
            payload.adminNotes || "",
            payload.isContacted ? "TRUE" : "FALSE"
          ]);
        });
      } 
      // Handle Activity Interest (One row)
      else {
        var interestsStr = JSON.stringify(payload.activityInterests || []);
        sheet.appendRow([
            payload.id,
            payload.submittedAt,
            payload.classType,
            payload.signupType,
            payload.parentName,
            payload.studentName,
            payload.email,
            payload.isRecurring ? "TRUE" : "FALSE",
            "", 
            interestsStr,
            payload.otherDetails || "",
            payload.adminNotes || "",
            payload.isContacted ? "TRUE" : "FALSE"
          ]);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', id: payload.id }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    
    // --- UPDATE ---
    else if (action === 'UPDATE') {
      var rows = sheet.getDataRange().getValues(); // Values are fine for IDs
      var targetId = String(payload.id);

      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          if (payload.adminNotes !== undefined) {
            sheet.getRange(i + 1, 12).setValue(payload.adminNotes);
          }
          if (payload.isContacted !== undefined) {
            sheet.getRange(i + 1, 13).setValue(payload.isContacted ? "TRUE" : "FALSE");
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    
    // --- DELETE ---
    else if (action === 'DELETE') {
      // CRITICAL: Use getDisplayValues() to read exactly what is visible (TEXT)
      // This ensures "2025-12-10" matches "2025-12-10" perfectly
      var rows = sheet.getDataRange().getDisplayValues();
      var targetId = String(payload.id);
      var targetDate = String(payload.date || ""); 

      // Iterate backwards to delete safely
      for (var i = rows.length - 1; i >= 1; i--) {
        var rowId = String(rows[i][0]);
        
        if (rowId === targetId) {
          // If deleting a specific date
          if (targetDate) {
             var rowDate = String(rows[i][8]); // Col 9 is Index 8
             // Clean up any stray apostrophes just in case
             rowDate = rowDate.replace(/'/g, "").trim(); 
             
             // SUBSTRING MATCH SAFETY NET
             // Even if one is "2025-12-10" and other is "2025-12-10T00:00", this catches it
             if (rowDate === targetDate || rowDate.indexOf(targetDate) > -1) {
               sheet.deleteRow(i + 1);
             }
          } 
          // If deleting the whole volunteer record
          else {
             sheet.deleteRow(i + 1);
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // CRITICAL: Use getDisplayValues() to get strict text representation
  // This avoids the script timezone shifting dates by -1 day
  var rows = sheet.getDataRange().getDisplayValues();
  
  var volunteersMap = {};

  // Start at i=1 to skip header
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue; 

    var id = String(row[0]);
    
    if (!volunteersMap[id]) {
      volunteersMap[id] = {
        id: id,
        submittedAt: row[1],
        classType: row[2],
        signupType: row[3],
        parentName: row[4],
        studentName: row[5],
        email: row[6],
        isRecurring: row[7] === "TRUE" || row[7] === "true",
        dates: [],
        activityInterests: [],
        otherDetails: row[10],
        adminNotes: row[11],
        isContacted: row[12] === "TRUE" || row[12] === "true"
      };
    }

    // Process Date Column (Col 9 / Index 8)
    var rawDate = String(row[8]);
    if (rawDate && rawDate !== "") {
      // Remove any apostrophes or whitespace
      var cleanDate = rawDate.replace(/'/g, "").trim();
      // Only keep if it looks like a date (YYYY-MM-DD is 10 chars)
      if (cleanDate.length >= 10) { 
        // Force strip any time component for frontend consistency
        if(cleanDate.includes('T')) cleanDate = cleanDate.split('T')[0];
        volunteersMap[id].dates.push(cleanDate);
      }
    }

    // Process Interests
    try {
      if (row[9] && String(row[9]).startsWith('[')) {
        var interests = JSON.parse(row[9]);
        if (interests.length > 0) volunteersMap[id].activityInterests = interests;
      }
    } catch(err) {}
  }

  var result = Object.keys(volunteersMap).map(function(key) {
    return volunteersMap[key];
  });

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}