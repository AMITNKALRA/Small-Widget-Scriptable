// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
/*
 * SETUP
 * Use this section to set up the widget.
 * ======================================
 */

// Set the locale code. Leave blank "" to match the device's locale. You can change the hard-coded text strings in the TEXT section below.
let locale = "en"

// The size of the widget preview in the app.
const widgetPreview = "small"

// Set to true for an image background, false for no image.
const imageBackground = true

// Set to true to reset the widget's background image.
const forceImageUpdate = false

// Set the padding around each item. Default is 5.
const padding = 5

// Decide if icons should match the color of the text around them.
const tintIcons = true

/*
 * LAYOUT
 * Decide what items to show on the widget.
 * ========================================
 */

// You always need to start with "row," and "column," items, but you can now add as many as you want.
// Adding left, right, or center will align everything after that. The default alignment is left.

// You can add a flexible vertical space with "space," or a fixed-size space like this: "space(50)"
// Align items to the top or bottom of columns by adding "space," before or after all items in the column.

// There are many possible items, including: date, greeting, events, current, future, battery, sunrise, and text("Your text here")
// Make sure to always put a comma after each item.

const items = [
  
    row,
  
       column,
       //greeting,
       date,
       // sunrise,

  
     row,
  
       column,
       events,

       column(50),
       //sunrise, use this one
       space(8),
       tasks,
       
  ]

  /*
 * ITEM SETTINGS
 * Choose how each item is displayed.
 * ==================================
 */  
 
// DATE
// ====
const dateSettings = {

    // If set to true, date will become smaller when events are displayed.
    dynamicDateSize: false
  
    // If the date is not dynamic, should it be large or small?
    ,staticDateSize: "small"
  
    // Determine the date format for each date type. See docs.scriptable.app/dateformatter
    ,smallDateFormat: "EEEE, MMMM d"
    ,largeDateLineOne: "EEEE,"
    ,largeDateLineTwo: "MMMM d"
    ,justDateNumber: "d"
    ,justDay: "EEEE"
  }
  
  // EVENTS
  // ======
  const eventSettings = {
  
    // How many events to show.
    numberOfEvents: 2
  
    // Show all-day events.
    ,showAllDay: true
  
    // Show tomorrow's events.
    ,showTomorrow: true
  
    // Can be blank "" or set to "duration" or "time" to display how long an event is.
    ,showEventLength: "duration"
  
    // Set which calendars for which to show events. Empty [] means all calendars.
    ,selectCalendars: []
  
    // Leave blank "" for no color, or specify shape (circle, rectangle) and/or side (left, right).
    ,showCalendarColor: "rectangle left"
    
    // When no events remain, show a hard-coded "message", a "greeting", or "none".
    ,noEventBehavior: "message"
  }

  /*
 * TEXT
 * Change the language and formatting of text displayed.
 * =====================================================
 */  
 
// You can change the language or wording of any text in the widget.
const localizedText = {
  
    // The text shown if you add a greeting item to the layout.
    nightGreeting: "Good night."
    ,morningGreeting: "Good morning."
    ,afternoonGreeting: "Good afternoon."
    ,eveningGreeting: "Good evening."
    
    // The text shown if you add a future weather item to the layout, or tomorrow's events.
    ,nextHourLabel: "Next hour"
    ,tomorrowLabel: "Tomorrow"
  
    // Shown when noEventBehavior is set to "message".
    ,noEventMessage: "No more events today" //"Enjoy the rest of your day."
    
    // The text shown after the hours and minutes of an event duration.
    ,durationMinute: "m"
    ,durationHour: "h"
       
  }

  // Set the font, size, and color of various text elements. Use iosfonts.com to find fonts to use. If you want to use the default iOS font, set the font name to one of the following: ultralight, light, regular, medium, semibold, bold, heavy, black, or italic.
const textFormat = {
  
    // Set the default font and color.
    defaultText: { size: 14, color: "ffffff", font: "regular" },
    
    // Any blank values will use the default.
    smallDate:   { size: 17, color: "", font: "semibold" },
    largeDate1:  { size: 30, color: "", font: "light" },
    largeDate2:  { size: 30, color: "", font: "light" },
    justNumber:   { size: 35, color: "", font: "light" },
    justDey:   { size: 12, color: "", font: "semibold" },
    
    eventLabel:  { size: 10, color: "", font: "semibold" },
    eventTitle:  { size: 11, color: "", font: "semibold" },
    eventTime:   { size: 9, color: "ffffffcc", font: "" },
    noEvents:    { size: 12, color: "", font: "light" },
    
    customText:  { size: 14, color: "", font: "" },
  }

  /*
 * WIDGET CODE
 * Be more careful editing this section. 
 * =====================================
 */

// Make sure we have a locale value.
if (locale == "" || locale == null) { locale = Device.locale() }

// Declare the data variables.
var eventData

// Create global constants.
const currentDate = new Date()
const files = FileManager.local()

/*
 * CONSTRUCTION
 * ============
 */

// Set up the widget with padding.
const widget = new ListWidget()
const horizontalPad = padding < 10 ? 10 - padding : 10
const verticalPad = padding < 15 ? 15 - padding : 15
widget.setPadding(horizontalPad, verticalPad, horizontalPad, verticalPad)
widget.spacing = 0

// Set up the global variables.
var currentRow = {}
var currentColumn = {}

// Set up the initial alignment.
var currentAlignment = alignLeft

// Set up the global ASCII variables.
var currentColumns = []
var rowNeedsSetup = false

// It's ASCII time!
if (typeof items[0] == 'string') {
  for (line of items[0].split(/\r?\n/)) { await processLine(line) }
}
// Otherwise, set up normally.
else {
  for (item of items) { await item(currentColumn) }
}

/*
 * BACKGROUND DISPLAY
 * ==================
 */

// If it's an image background, display it.
if (imageBackground) {
  
  // Determine if our image exists and when it was saved.
  const path = files.joinPath(files.documentsDirectory(), "cal-rem-image")//"weather-cal-image")
  const exists = files.fileExists(path) // come back
  
  // If it exists and an update isn't forced, use the cache.
  if (exists && (config.runsInWidget || !forceImageUpdate)) {
    widget.backgroundImage = files.readImage(path)
  
  // If it's missing when running in the widget, use a gray background.
  } else if (!exists && config.runsInWidget) {
      widget.backgroundColor = Color.gray() 
    
  // But if we're running in app, prompt the user for the image.
  } else {
      const img = await Photos.fromLibrary()
      widget.backgroundImage = img
      files.writeImage(path, img)
  }
    
// If it's not an image background, show the gradient.
} else {

  widget.backgroundColor = Color.white() 
}

// Finish the widget and show a preview.
Script.setWidget(widget)
if (widgetPreview == "small") { widget.presentSmall() }
else if (widgetPreview == "medium") { widget.presentMedium() }
else if (widgetPreview == "large") { widget.presentLarge() }
Script.complete()

/*
 * ASCII FUNCTIONS
 * Now isn't this a lot of fun?
 * ============================
 */

// Provide the named function.
function provideFunction(name) {
  const functions = {
    space() { return space },
    left() { return left },
    right() { return right },
    center() { return center },
    date() { return date },
    events() { return events },

  }
  return functions[name]
}

// Processes a single line of ASCII. 
async function processLine(lineInput) {
  
  // Because iOS loves adding periods to everything.
  const line = lineInput.replace(/\.+/g,'')
  
  // If it's blank, return.
  if (line.trim() == '') { return }
  
  // If it's a line, enumerate previous columns (if any) and set up the new row.
  if (line[0] == '-' && line[line.length-1] == '-') { 
    if (currentColumns.length > 0) { await enumerateColumns() }
    rowNeedsSetup = true
    return
  }
  
  // If it's the first content row, finish the row setup.
  if (rowNeedsSetup) { 
    row(currentColumn)
    rowNeedsSetup = false 
  }
  
  // If there's a number, this is a setup row.
  const setupRow = line.match(/\d+/)

  // Otherwise, it has columns.
  const items = line.split('|')
  
  // Iterate through each item.
  for (var i=1; i < items.length-1; i++) {
    
    // If the current column doesn't exist, make it.
    if (!currentColumns[i]) { currentColumns[i] = { items: [] } }
    
    // Now we have a column to add the items to.
    const column = currentColumns[i].items
    
    // Get the current item and its trimmed version.
    const item = items[i]
    const trim = item.trim()
    
    // If it's not a function, figure out spacing.
    if (!provideFunction(trim)) { 
      
      // If it's a setup row, whether or not we find the number, we keep going.
      if (setupRow) {
        const value = parseInt(trim, 10)
        if (value) { currentColumns[i].width = value }
        continue
      }
      
      // If it's blank and we haven't already added a space, add one.
      const prevItem = column[column.length-1]
      if (trim == '' && (!prevItem || (prevItem && !prevItem.startsWith("space")))) {
        column.push("space")
      }
      
      // Either way, we're done.
      continue
    
    }
    
    // Determine the alignment.
    const index = item.indexOf(trim)
    const length = item.slice(index,item.length).length
    
    let align
    if (index > 0 && length > trim.length) { align = "center" }
    else if (index > 0) { align = "right" }
    else { align = "left" }
    
    // Add the items to the column.
    column.push(align)
    column.push(trim)
  }
}

// Runs the function names in each column.
async function enumerateColumns() {
  if (currentColumns.length > 0) {
    for (col of currentColumns) {
      
      // If it's null, go to the next one.
      if (!col) { continue }
      
      // If there's a width, use the width function.
      if (col.width) {
        column(col.width)(currentColumn)
        
      // Otherwise, create the column normally.
      } else {
        column(currentColumn)
      }
      for (item of col.items) {
        const func = provideFunction(item)()
        await func(currentColumn)
      }
    }
    currentColumns = []
  }
}

/*
 * LAYOUT FUNCTIONS
 * These functions manage spacing and alignment.
 * =============================================
 */

// Makes a new row on the widget.
function row(input = null) {

  function makeRow() {
    currentRow = widget.addStack()
    currentRow.layoutHorizontally()
    currentRow.setPadding(0, 0, 0, 0)
    currentColumn.spacing = 0
    
    // If input was given, make a column of that size.
    if (input > 0) { currentRow.size = new Size(0,input) }
  }
  
  // If there's no input or it's a number, it's being called in the layout declaration.
  if (!input || typeof input == "number") { return makeRow }
  
  // Otherwise, it's being called in the generator.
  else { makeRow() }
}

// Makes a new column on the widget.
function column(input = null) {
 
  function makeColumn() {
    currentColumn = currentRow.addStack()
    currentColumn.layoutVertically()
    currentColumn.setPadding(0, 0, 0, 0)
    currentColumn.spacing = 0
    
    // If input was given, make a column of that size.
    if (input > 0) { currentColumn.size = new Size(input,0) }
  }
  
  // If there's no input or it's a number, it's being called in the layout declaration.
  if (!input || typeof input == "number") { return makeColumn }
  
  // Otherwise, it's being called in the generator.
  else { makeColumn() }
}

// Create an aligned stack to add content to.
function align(column) {
  
  // Add the containing stack to the column.
  let alignmentStack = column.addStack()
  alignmentStack.layoutHorizontally()
  
  // Get the correct stack from the alignment function.
  let returnStack = currentAlignment(alignmentStack)
  returnStack.layoutVertically()
  return returnStack
}

// Create a right-aligned stack.
function alignRight(alignmentStack) {
  alignmentStack.addSpacer()
  let returnStack = alignmentStack.addStack()
  return returnStack
}

// Create a left-aligned stack.
function alignLeft(alignmentStack) {
  let returnStack = alignmentStack.addStack()
  alignmentStack.addSpacer()
  return returnStack
}

// Create a center-aligned stack.
function alignCenter(alignmentStack) {
  alignmentStack.addSpacer()
  let returnStack = alignmentStack.addStack()
  alignmentStack.addSpacer()
  return returnStack
}

// This function adds a space, with an optional amount.
function space(input = null) { 
  
  // This function adds a spacer with the input width.
  function spacer(column) {
  
    // If the input is null or zero, add a flexible spacer.
    if (!input || input == 0) { column.addSpacer() }
    
    // Otherwise, add a space with the specified length.
    else { column.addSpacer(input) }
  }
  
  // If there's no input or it's a number, it's being called in the column declaration.
  if (!input || typeof input == "number") { return spacer }
  
  // Otherwise, it's being called in the column generator.
  else { input.addSpacer() }
}

// Change the current alignment to right.
function right(x) { currentAlignment = alignRight }

// Change the current alignment to left.
function left(x) { currentAlignment = alignLeft }

// Change the current alignment to center.
function center(x) { currentAlignment = alignCenter }

// THIS IS WHERE THE DEFAULT CODE ENDS

/*
 * SETUP FUNCTIONS
 * These functions prepare data needed for items.
 * ==============================================
 */

 // Set up Reminders.

 async function tasks(column, alignment) {

  function sortItems(first, second) {
           return first.dueDate - second.dueDate
  }
  // const yesterdayTasks = await Reminder.incompleteDueYesterday([])
  const todayTasks = await Reminder.incompleteDueToday([])
  const tomorrowTasks = await Reminder.incompleteDueTomorrow([])
  
  if (todayTasks.length + tomorrowTasks.length > 0) {
    var tasksStack = column.addStack()
    tasksStack.layoutVertically()
    tasksStack.url = 'x-apple-reminderkit://'
  
  }
  
  if (todayTasks.length > 0) {
  
      todayTasks.length = 2;
    // const heading = widget.addText("Reminders:");
      todayTasks.sort(sortItems).slice(0, 2).forEach(({ title, dueDate }) => {
  
          if (dueDate < currentDate) {
  
        const task = tasksStack.addText(`❕❕ ${title}`);
        task.textColor = Color.white()
        task.font = Font.regularSystemFont(10)
        task.lineLimit = 1;
        const dueTime = String(dueDate)
        const options = { hour: 'numeric', minute: '2-digit'};
  const americanDateTime = new Intl.DateTimeFormat('en-US', options).format;
   const due = tasksStack.addText("     " + americanDateTime(dueDate)); 
             due.textOpacity = .7
          due.textColor = Color.white()
          due.font = Font.mediumSystemFont(8)
       
          tasksStack.addSpacer(10);  
  
      } else {
  
          todayTasks.length = 2;
          const task = tasksStack.addText(`○ ${title}`);
        task.textColor = Color.white()
        task.font = Font.regularSystemFont(10)
        task.lineLimit = 1;
        const dueTime = String(dueDate)
        const options = { hour: 'numeric', minute: '2-digit'};
  const americanDateTime = new Intl.DateTimeFormat('en-US', options).format;
   const due = tasksStack.addText("     " + americanDateTime(dueDate)); 
             due.textOpacity = .7
          due.textColor = Color.white()
          due.font = Font.mediumSystemFont(8)
  
      }
      });
    }
  
  if (todayTasks.length == 0 && tomorrowTasks.length > 0) { 
  
      tomorrowTasks.length = 2;
    // const heading = widget.addText("Reminders:");
      tomorrowTasks.sort(sortItems).slice(0, 2).forEach(({ title, dueDate }) => {
  
          if (dueDate > currentDate) {
  
        const task = tasksStack.addText(`○ ${title}`);
        task.textColor = Color.white()
        task.font = Font.regularSystemFont(10)
        task.lineLimit = 1;
        const dueTime = String(dueDate)
        const options = { hour: 'numeric', minute: '2-digit'};
  const americanDateTime = new Intl.DateTimeFormat('en-US', options).format;
   const due = tasksStack.addText("     " + americanDateTime(dueDate)); 
             due.textOpacity = .7
          due.textColor = Color.white()
          due.font = Font.mediumSystemFont(8)
       
          tasksStack.addSpacer(10);  
      
      } 
      });
    }
  
  
  }

  // Set up the eventData object.
async function setupEvents() {
  
  eventData = {}
  const calendars = eventSettings.selectCalendars
  const numberOfEvents = eventSettings.numberOfEvents

  // Function to determine if an event should be shown.
  function shouldShowEvent(event) {
  
    // If events are filtered and the calendar isn't in the selected calendars, return false.
    if (calendars.length && !calendars.includes(event.calendar.title)) { return false }

    // Hack to remove canceled Office 365 events.
    if (event.title.startsWith("Canceled:")) { return false }

    // If it's an all-day event, only show if the setting is active.
    if (event.isAllDay) { return eventSettings.showAllDay }

    // Otherwise, return the event if it's in the future.
    return (event.startDate.getTime() > currentDate.getTime())
  }

  // Determine which events to show, and how many.
  const todayEvents = await CalendarEvent.today([])
  let shownEvents = 0
  let futureEvents = []
  
  for (const event of todayEvents) {
    if (shownEvents == numberOfEvents) { break }
    if (shouldShowEvent(event)) {
      futureEvents.push(event)
      shownEvents++
    }
  }

    // If there's room and we need to, show tomorrow's events.
    let multipleTomorrowEvents = false

  if (eventSettings.showTomorrow && shownEvents < numberOfEvents) {
  
    const tomorrowEvents = await CalendarEvent.tomorrow([])
    for (const event of tomorrowEvents) {
      if (shownEvents == numberOfEvents) { break }
      if (shouldShowEvent(event)) {
      
        // Add the tomorrow label prior to the first tomorrow event.
        if (!multipleTomorrowEvents) { 
          
          // The tomorrow label is pretending to be an event.

          let newTomorrowLabel = localizedText.tomorrowLabel

          futureEvents.push({ title: newTomorrowLabel.toUpperCase(), isLabel: true })
          futureEvents.textColor = Color.black()
          
          multipleTomorrowEvents = true
        }
        
        // Show the tomorrow event and increment the counter.
        futureEvents.push(event)
        shownEvents++
      }
    }
  }

  // Store the future events, and whether or not any events are displayed.
  eventData.futureEvents = futureEvents
  eventData.eventsAreVisible = (futureEvents.length > 0) && (eventSettings.numberOfEvents > 0)
}

/*
 * WIDGET ITEMS
 * These functions display items on the widget.
 * ============================================
 */

// Display the date on the widget.
async function date(column) {

  // Requirements: events (if dynamicDateSize is enabled)
  if (!eventData && dateSettings.dynamicDateSize) { await setupEvents() }

  // Set up the date formatter and set its locale.
  let df = new DateFormatter()
  df.locale = locale

  let moreDF = new DateFormatter()
  moreDF.locale = locale
  
  // Show small if it's hard coded, or if it's dynamic and events are visible.
  if (dateSettings.staticDateSize == "small" || (dateSettings.dynamicDateSize && eventData.eventsAreVisible)) {
    let dateStack = align(column)
    dateStack.setPadding(padding, padding, padding, padding)

    df.dateFormat = dateSettings.justDay
    moreDF.dateFormat = dateSettings.justDateNumber
    let dayText = provideText(df.string(currentDate).toUpperCase(), dateStack, textFormat.justDey) 
    dayText.textColor = Color.red()  
    let dateText = provideText(moreDF.string(currentDate), dateStack, textFormat.justNumber)
    
  // Otherwise, show the large date.
  } /* else {
    let dateOneStack = align(column)
    df.dateFormat = dateSettings.largeDateLineOne
    let dateOne = provideText(df.string(currentDate), dateOneStack, textFormat.largeDate1)
    dateOneStack.setPadding(padding/2, padding, 0, padding)
    
    let dateTwoStack = align(column)
    df.dateFormat = dateSettings.largeDateLineTwo
    let dateTwo = provideText(df.string(currentDate), dateTwoStack, textFormat.largeDate2)
    dateTwoStack.setPadding(0, padding, padding, padding)
  } */
}

// Display events on the widget.
async function events(column) {

  // Requirements: events
  if (!eventData) { await setupEvents() }

  // If no events are visible, figure out what to do.
  if (!eventData.eventsAreVisible) { 
    const display = eventSettings.noEventBehavior
    
    // If it's a greeting, let the greeting function handle it.
    if (display == "greeting") { return await greeting(column) }
    
    // If it's a message, get the localized text.
    if (display == "message" && localizedText.noEventMessage.length) {
      const messageStack = align(column)
      messageStack.setPadding(padding, padding, padding, padding)
      let nothingLeft = provideText(localizedText.noEventMessage, messageStack, textFormat.noEvents)
      nothingLeft.textColor = Color.gray()
    }
    
    // Whether or not we displayed something, return here.
    return
  }
  
  // Set up the event stack.
  let eventStack = column.addStack()
  eventStack.layoutVertically()
  const todaySeconds = Math.floor(currentDate.getTime() / 1000) - 978307200
  eventStack.url = 'calshow:' + todaySeconds
  
  // If there are no events and we have a message, show it and return.
  if (!eventData.eventsAreVisible && localizedText.noEventMessage.length) {
    let message = provideText(localizedText.noEventMessage, eventStack, textFormat.noEvents)
    message.textColor = Color.gray()
    eventStack.setPadding(padding, padding, padding, padding)
    return
  }
  
  // If we're not showing the message, don't pad the event stack.
  eventStack.setPadding(0, 0, 0, 0)
  
  // Add each event to the stack.
  var currentStack = eventStack
  const futureEvents = eventData.futureEvents
  for (let i = 0; i < futureEvents.length; i++) {
    
    const event = futureEvents[i]
    const bottomPadding = (padding-10 < 0) ? 0 : padding-10
    
    // If it's the tomorrow label, change to the tomorrow stack.
    if (event.isLabel) {
      let tomorrowStack = column.addStack()
      tomorrowStack.layoutVertically()
      const tomorrowSeconds = Math.floor(currentDate.getTime() / 1000) - 978220800
      tomorrowStack.url = 'calshow:' + tomorrowSeconds
      currentStack = tomorrowStack
      
      // Mimic the formatting of an event title, mostly.
      const eventLabelStack = align(currentStack)
      const eventLabel = provideText(event.title, eventLabelStack, textFormat.eventLabel)
      eventLabelStack.setPadding(padding, padding, padding, padding)
      continue
    }
    
    const titleStack = align(currentStack)
    titleStack.layoutHorizontally()
    const showCalendarColor = eventSettings.showCalendarColor
    const colorShape = showCalendarColor.includes("circle") ? "circle" : "rectangle"
    
    // If we're showing a color, and it's not shown on the right, add it to the left.
    if (showCalendarColor.length && !showCalendarColor.includes("right")) {
      let colorItemText = provideTextSymbol(colorShape) + " "
      let colorItem = provideText(colorItemText, titleStack, textFormat.eventTitle)
      colorItem.textColor = event.calendar.color
    }

    const title = provideText(event.title.trim(), titleStack, textFormat.eventTitle)
    titleStack.setPadding(padding, padding, event.isAllDay ? padding : padding/5, padding)
    
    // If we're showing a color on the right, show it.
    if (showCalendarColor.length && showCalendarColor.includes("right")) {
      let colorItemText = " " + provideTextSymbol(colorShape)
      let colorItem = provideText(colorItemText, titleStack, textFormat.eventTitle)
      colorItem.textColor = event.calendar.color
    }
  
    // If there are too many events, limit the line height.
    if (futureEvents.length >= 3) { title.lineLimit = 1 }

    // If it's an all-day event, we don't need a time.
    if (event.isAllDay) { continue }
    
    // Format the time information.
    let timeText = formatTime(event.startDate)
    
    // If we show the length as time, add an en dash and the time.
    if (eventSettings.showEventLength == "time") { 
      timeText += "–" + formatTime(event.endDate) 
      
    // If we should it as a duration, add the minutes.
    } else if (eventSettings.showEventLength == "duration") {
      const duration = (event.endDate.getTime() - event.startDate.getTime()) / (1000*60)
      const hours = Math.floor(duration/60)
      const minutes = Math.floor(duration % 60)
      const hourText = hours>0 ? hours + localizedText.durationHour : ""
      const minuteText = minutes>0 ? minutes + localizedText.durationMinute : ""
      const showSpace = hourText.length && minuteText.length
      timeText += " \u2022 " + hourText + (showSpace ? " " : "") + minuteText
    }

    const timeStack = align(currentStack)
    const time = provideText(timeText, timeStack, textFormat.eventTime)
    timeStack.setPadding(0, padding, padding, padding)
  }
}

// Return a text-creation function.
function text(input = null) {

  function displayText(column) {
  
    // Don't do anything if the input is blank.
    if (!input || input == "") { return }
  
    // Otherwise, add the text.
    const textStack = align(column)
    textStack.setPadding(padding, padding, padding, padding)
    const textDisplay = provideText(input, textStack, textFormat.customText)
  }
  return displayText
}

/*
 * HELPER FUNCTIONS
 * These functions perform duties for other functions.
 * ===================================================
 */

// Tints icons if needed.
function tintIcon(icon,format) {
  if (!tintIcons) { return }
  icon.tintColor = new Color(format.color || textFormat.defaultText.color)
}

// Determines if the provided date is at night.
function isNight(dateInput) {
  const timeValue = dateInput.getTime()
  return (timeValue < sunData.sunrise) || (timeValue > sunData.sunset)
}

// Determines if two dates occur on the same day
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

// Returns the number of minutes between now and the provided date.
function closeTo(time) {
  return Math.abs(currentDate.getTime() - time) / 60000
}

// Format the time for a Date input.
function formatTime(date) {
  let df = new DateFormatter()
  df.locale = locale
  df.useNoDateStyle()
  df.useShortTimeStyle()
  return df.string(date)
}

// Provide a text symbol with the specified shape.
function provideTextSymbol(shape) {

  // Rectangle character.
  if (shape.startsWith("rect")) {
    return "\u2759"
  }
  // Circle character.
  if (shape == "circle") {
    return "\u2B24"
  }
  // Default to the rectangle.
  return "\u2759" 
}

// Provide a font based on the input.
function provideFont(fontName, fontSize) {
  const fontGenerator = {
    "ultralight": function() { return Font.ultraLightSystemFont(fontSize) },
    "light": function() { return Font.lightSystemFont(fontSize) },
    "regular": function() { return Font.regularSystemFont(fontSize) },
    "medium": function() { return Font.mediumSystemFont(fontSize) },
    "semibold": function() { return Font.semiboldSystemFont(fontSize) },
    "bold": function() { return Font.boldSystemFont(fontSize) },
    "heavy": function() { return Font.heavySystemFont(fontSize) },
    "black": function() { return Font.blackSystemFont(fontSize) },
    "italic": function() { return Font.italicSystemFont(fontSize) }
  }
  
  const systemFont = fontGenerator[fontName]
  if (systemFont) { return systemFont() }
  return new Font(fontName, fontSize)
}
 
// Add formatted text to a container.
function provideText(string, container, format) {
  const textItem = container.addText(string)
  const textFont = format.font || textFormat.defaultText.font
  const textSize = format.size || textFormat.defaultText.size
  const textColor = format.color || textFormat.defaultText.color
  
  textItem.font = provideFont(textFont, textSize)
  textItem.textColor = new Color(textColor)
  return textItem
}
