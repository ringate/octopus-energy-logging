const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

const formatTime = (hours, minutes) => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const getCurrentDateTime = () => {
  const now = DateTime.now().setZone('Europe/London');
  return {
    date: now.toFormat('yyyy-MM-dd'),
    time: now.hour * 60 + now.minute,
    timeStr: formatTime(now.hour, now.minute)
  };
};

const getNextDay = (date) => {
  const nextDay = DateTime.fromISO(date).plus({ days: 1 });
  return nextDay.toFormat('yyyy-MM-dd');
};

const readDataFile = (filename) => {
  if (!fs.existsSync(filename)) return [];

  const data = fs.readFileSync(filename, 'utf8').split('\n');
  const timeslots = [];

  for (let i = 0; i < data.length; i += 2) {
    const times = data[i].split(' - ').map(time => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    });
    if ( (times[0] == 1410) && (times[1] == 0) ) times[1] = 1440;

    timeslots.push({
      start: times[0],
      end: times[1],
      value: data[i + 1] || 'N/A'
    });
  }

  return timeslots;
};

const getValue = (currentDateTime) => {
  const currentFile = path.join('data', `${currentDateTime.date}.txt`);
  let timeslots = readDataFile(currentFile);

  const currentTimeslotIndex = timeslots.findIndex(slot => currentDateTime.time >= slot.start && currentDateTime.time < slot.end);

  if (currentTimeslotIndex === -1 || timeslots.length - currentTimeslotIndex < 3) {
    // if the current time is after 22:59:59 or there are not enough timeslots for today, load next day's timeslots.
    const nextDayFile = path.join('data', `${getNextDay(currentDateTime.date)}.txt`);
    timeslots = timeslots.concat(readDataFile(nextDayFile));
  }

  const current = timeslots[currentTimeslotIndex] ? timeslots[currentTimeslotIndex].value : 'N/A';
  const next1 = timeslots[currentTimeslotIndex + 1] ? timeslots[currentTimeslotIndex + 1].value : 'N/A';
  const next2 = timeslots[currentTimeslotIndex + 2] ? timeslots[currentTimeslotIndex + 2].value : 'N/A';

  return `Current (${currentDateTime.timeStr}) - ${current}, next two timeslots are ${next1} and ${next2}.`;
};

const getCurrentValues = () => {
  const currentDateTime = getCurrentDateTime();
  const response = getValue(currentDateTime);

  // extracting the values from the string response to return as JSON
  const regex = /Current \((\d{2}:\d{2})\) - ([\d.]+p\/kWh), next two timeslots are ([\d.]+p\/kWh) and ([\d.]+p\/kWh)./;

  const match = response.match(regex);
  
  if (!match) return null;

  return {
    time: match[1],
    current: parseFloat(match[2]),
    next1: parseFloat(match[3]),
    next2: parseFloat(match[4])
  };
};

module.exports = {
  getCurrentValues
};

//const currentDateTime = getCurrentDateTime();
//console.log(getValue(currentDateTime));
console.log(getCurrentValues());
