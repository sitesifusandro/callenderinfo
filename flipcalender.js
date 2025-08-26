<script>
const notesData = JSON.parse(document.getElementById("notitiesData").textContent);

const card = document.getElementById('calendarCard');
const calendarContent = document.getElementById('calendarMonthContent');
const backNotes = document.getElementById('backNotes');
const monthLabel = document.getElementById('monthLabel');

const months = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];
const weekdays = ["M", "D", "W", "D", "V", "Z", "Z"];
let currentMonth = new Date().getMonth();
let year = new Date().getFullYear();

function flipCard() {
  card.classList.toggle("flipped");
  if (card.classList.contains("flipped")) {
    loadBackNotes();
  }
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    year--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    year++;
  }
  renderCalendar();
}


function renderCalendar() {
  const firstDay = new Date(year, currentMonth, 1).getDay();
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  monthLabel.textContent = `${months[currentMonth]} ${year}`;

  let html = "<table><tr>";
  weekdays.forEach(day => {
    html += `<th>${day}</th>`;
  });
  html += "</tr><tr>";

  let day = 1;
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < 42; i++) {
    if (i < startDay) {
      html += "<td></td>";
    } else if (day <= daysInMonth) {
      const dateStr = `${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let classes = [];
      let dotColor = "";

      if (i % 7 === 5 || i % 7 === 6) classes.push("weekend");

      const today = new Date();
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        year === today.getFullYear();

      if (isToday) {
        classes.push("today");
      }

      // Check of er een event is op deze datum
      if (notesData[dateStr]) {
        classes.push("event-day");
        const note = notesData[dateStr].toLowerCase();

        if (note.includes("#groen")) dotColor = "rgba(0, 255, 0, 1)";
        else if (note.includes("#rood")) dotColor = "rgba(255, 0, 0, 1)";
        else if (note.includes("#geel")) dotColor = "rgba(255, 255, 0, 1)";
        else if (note.includes("#blauw")) dotColor = "rgba(0, 191, 255, 1)";
        else if (note.includes("#wit")) dotColor = "rgba(255, 255, 255, 1)";
        else if (note.includes("#paars")) dotColor = "rgba(236, 4, 232, 1)";
      }

      html += `<td class="${classes.join(' ')}" ${isToday ? `data-day="${day}"` : ""}>
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div class="day-cell">${day}</div>
                  ${dotColor ? `<div style="width: 18px; height: 5px; border-radius: 50%; background-color: ${dotColor};"></div>` : ""}
                </div>
              </td>`;

      day++;
    } else {
      html += "<td></td>";
    }

    if ((i + 1) % 7 === 0 && i < 41) html += "</tr><tr>";
  }

  html += "</tr></table>";
  calendarContent.innerHTML = html;
}


function loadBackNotes() {
  backNotes.innerHTML = "";
  let foundNotes = false;

  const sortedDates = Object.keys(notesData).sort((a, b) => new Date(a) - new Date(b));
  const today = new Date();
  let upcomingNoteId = null;

  for (const date of sortedDates) {
    const d = new Date(date);
    const noteMonth = d.getMonth();

    if (d.getFullYear() === year && noteMonth === currentMonth) {
      foundNotes = true;
      const day = d.getDate();
      const rawText = notesData[date];

      const colorMatch = rawText.match(/#(groen|rood|geel|blauw|wit|paars)/i);
      let dateBgColor = "";
      let dateTextColor = "#fff";
      let dateBorder = "1px solid #000";

      if (colorMatch) {
        const kleur = colorMatch[1].toLowerCase();
        switch (kleur) {
          case "groen":
            dateBgColor = "rgba(0, 255, 0, 0.6)";
            break;
          case "rood":
            dateBgColor = "rgba(255, 0, 0, 0.6)";
            break;
          case "geel":
            dateBgColor = "rgba(255, 255, 0, 0.6)";
            dateTextColor = "#232227";
            break;
          case "blauw":
            dateBgColor = "rgba(0, 191, 255, 0.6)";
            break;
          case "wit":
            dateBgColor = "rgba(255, 255, 255, 0.8)";
            dateTextColor = "#232227";
            break;
          case "paars":
            dateBgColor = "rgba(236, 4, 232, 0.6)";
            break;
        }
      }

      const noteText = rawText
        .replace(/::/g, "")
        .replace(/#(groen|rood|geel|blauw|wit|paars)/gi, "")
        .trim();

      const noteId = `note-${date}`;
      if (!upcomingNoteId && d >= today) {
        upcomingNoteId = noteId;
      }

      const dayName = d.toLocaleDateString("nl-BE", { weekday: "long" });

      backNotes.innerHTML += `
        <div class="note" id="${noteId}" style="margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <strong style="
              background-color: ${dateBgColor};
              color: ${dateTextColor};
              padding: 4px 6px;
              border-radius: 4px;
              display: inline-block;
              border: ${dateBorder};
            ">
              ${day} ${months[noteMonth]}
            </strong>
            <span style="font-weight: 400; color: #bfbfbf; line-height: 1; padding-bottom: 10px;">${dayName}</span>
          </div>
          <div style="margin-top: 4px;">${noteText}</div>
        </div>`;
    }
  }

  setTimeout(() => {
    let targetNote = null;
    if (upcomingNoteId) {
      targetNote = document.getElementById(upcomingNoteId);
    } else {
      const notes = backNotes.querySelectorAll(".note");
      if (notes.length > 0) {
        targetNote = notes[notes.length - 1];
      }
    }

    if (targetNote) {
      backNotes.scrollTo({
  top: targetNote.offsetTop - 120,
  behavior: "smooth"
});
    }
  }, 100);




  if (!foundNotes) {
    backNotes.innerHTML = `<p><em>Nog geen notities voor ${months[currentMonth]}</em></p>`;
  }
}

function updateTodayEvent() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  document.getElementById("date").textContent = day;
  document.getElementById("month").textContent = months[month];
  document.getElementById("day").textContent = today.toLocaleDateString('nl-BE', { weekday: 'long' });

  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const todayEventDiv = document.getElementById("today-event");

  let eventText = "Geen stage";
  let bgColor = "#434141"; // default
  let textColor = "white";

  if (notesData[dateStr]) {
    const rawText = notesData[dateStr];
    const cleanedText = rawText.replace(/#(groen|rood|geel|blauw|wit|paars)/gi, "").trim();
    const splitText = cleanedText.split("::")[0].trim();
    if (splitText) {
      eventText = splitText;
    }

    if (rawText.includes("#groen")) bgColor = "rgba(0, 255, 0, 0.6)";
    else if (rawText.includes("#rood")) bgColor = "rgba(255, 0, 0, 0.6)";
    else if (rawText.includes("#geel")) {
      bgColor = "rgba(255, 255, 0, 0.6)";
      textColor = "#232227";
    }
    else if (rawText.includes("#blauw")) bgColor = "rgba(0, 191, 255, 0.6)";
    else if (rawText.includes("#wit")) {
      bgColor = "rgba(255, 255, 255, 0.8)";
      textColor = "#232227";
    }
    else if (rawText.includes("#paars")) bgColor = "rgba(236, 4, 232, 0.6)";
  }


  todayEventDiv.innerHTML = `
    <div style="font-size: 16px; font-weight: 400; text-align: center; margin-top: 2px;height:26px;width:115px;border-radius: 5px; background-color:#323131;
      top: 0; position: absolute; left: 2px; color: #fff;display: block ruby;">
      Vandaag
    </div>
<div style="font-size: 14px; font-weight: 600; text-align: center; margin-top: -12px; background-color:#434141; width: 115px; height:140px;right: 6px;position: relative;border-radius: 5px;z-index: -1;margin-bottom: -75px;
 color: ${notesData[dateStr]?.toLowerCase().includes('#wit') ? '#232227' : '#fff'};">
    ${eventText}
 

  <div style="width: 80px; height: 10px; background-color: ${bgColor}; border-radius: 50%; position: fixed;bottom: -7px; right:4px;"></div> </div>
`;
 // todayEventDiv.style.backgroundColor = bgColor;
 // todayEventDiv.style.color = textColor;
}

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  updateTodayEvent();
});
</script>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    const dayNames = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
    const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

    document.getElementById("day").textContent = dayNames[today.getDay()];
    document.getElementById("date").textContent = today.getDate();
document.getElementById("month").textContent = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;

  });
</script>

