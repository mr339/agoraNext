import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import durationPlugin from 'dayjs/plugin/duration';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useEffect, useState } from 'react';
dayjs.extend(durationPlugin);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

export const timeRemaining = (date: string) => {
  const durationString = date;
  const parts = durationString.split(':');
  const days = parseInt(parts[0], 10);
  const hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);
  const seconds = parseInt(parts[3], 10);

  const duration = dayjs.duration({
    days,
    hours,
    minutes,
    seconds,
  });

  const remainingDays = duration.days();
  const remainingHours = duration.hours();
  const remainingMinutes = duration.minutes();

  const timeRemaining = [
    remainingDays
      ? `${remainingDays} day${remainingDays === 1 ? '' : 's'}`
      : '',
    remainingHours
      ? `${remainingHours} hr${remainingHours === 1 ? '' : 's'}`
      : '',
    remainingMinutes
      ? `${remainingMinutes} min${remainingMinutes === 1 ? '' : 's'}`
      : '',
  ]
    .join(' ')
    .trim();

  return timeRemaining;
};

export const dateFormat = (date: string) => {
  return dayjs(date).format('MMMM DD, YYYY');
};

export const formatHoursMinutes = (decimalValue: number) => {
  const duration = dayjs.duration(decimalValue, 'minutes');
  const formattedDuration = duration.format('HH:mm');
  let hoursAndMinutes = formattedDuration.split(':');
  return `${hoursAndMinutes[0]}hr${hoursAndMinutes[1]}m`;

  //   const hours = Math.floor(decimalValue);
  //   const minutes = Math.round((decimalValue - hours) * 60);
};

export const twelveHourFormat = (date: string) => {
  const timeString = date;
  const time = dayjs(timeString, 'HH:mm:ss');
  const formattedTime = time.format('h:mm A');
  return formattedTime;
};

export const durations = (minutes: number) => {
  const durationInMinutes = dayjs.duration(minutes, 'minutes');
  const formattedDuration = durationInMinutes.format('HH:mm:ss');
  return formattedDuration;
};

export const unixTimeStamp = () => {
  const timestamp = dayjs().unix(); // get the current Unix timestamp
  return timestamp; // prints the current Unix timestamp in seconds
};

function getTimeInSeconds(time: string = '00:00:00') {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function getTimeFromSeconds(totalSeconds: any) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function timeDiff(
  time1: string = '00:00:00',
  time2: string = '00:00:00'
) {
  const totalSeconds1 = getTimeInSeconds(time1);
  const totalSeconds2 = getTimeInSeconds(time2);
  const remainingSeconds = totalSeconds1 - totalSeconds2;
  return getTimeFromSeconds(remainingSeconds);
}

export const useCountdown = (initialTime: string = '00:00:00') => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const [hourStr, minuteStr, secondStr] = initialTime.split(':');
    let totalSeconds =
      parseInt(hourStr) * 60 * 60 +
      parseInt(minuteStr) * 60 +
      parseInt(secondStr);

    const intervalId = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(intervalId);
      } else {
        totalSeconds--;
        const hours = Math.floor(totalSeconds / (60 * 60))
          .toString()
          .padStart(2, '0');
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
          .toString()
          .padStart(2, '0');
        const seconds = Math.floor(totalSeconds % 60)
          .toString()
          .padStart(2, '0');

        setTime(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [initialTime]);

  return time;
};
