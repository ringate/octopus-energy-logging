const fs = require('fs');
const path = require('path');

const formatTime = (hours, minutes) => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Get current date and time
const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    time: now.getHours() * 60 + now.getMinutes(), // convert time to minutes for easier comparison
    timeStr: formatTime(now.getHours(), now.getMinutes())
  };
};

const getNextDay = (date) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
};

// Read and parse the data file
const readDataFile = (filename) => {
  if (!fs.existsSync(filename)) return [];

  const data = fs.readFileSync(filename, 'utf8').split('\n');
  const timeslots = [];

  for (let i = 0; i < data.length; i += 2) {
    const times = data[i].split(' - ').map(time => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    });

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
