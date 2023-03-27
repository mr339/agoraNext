import { useEffect, useState } from 'react';
import styles from './countdown.module.scss';

export type Props = {
  remainingTime: string;
};
const Countdown = ({ remainingTime = '00:00:00:00' }: Props) => {
  const [days, setDays] = useState<string>('00');
  const [hours, setHours] = useState<string>('00');
  const [minutes, setMinutes] = useState<string>('00');
  const [seconds, setSeconds] = useState<string>('00');

  useEffect(() => {
    const [dayStr, hourStr, minuteStr, secondStr] = remainingTime.split(':');
    let totalSeconds =
      parseInt(dayStr) * 24 * 60 * 60 +
      parseInt(hourStr) * 60 * 60 +
      parseInt(minuteStr) * 60 +
      parseInt(secondStr);

    const intervalId = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(intervalId);
        setDays('00');
        setHours('00');
        setMinutes('00');
        setSeconds('00');
      } else {
        totalSeconds--;
        const days = Math.floor(totalSeconds / (24 * 60 * 60))
          .toString()
          .padStart(2, '0');
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
          .toString()
          .padStart(2, '0');
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
          .toString()
          .padStart(2, '0');
        const seconds = Math.floor(totalSeconds % 60)
          .toString()
          .padStart(2, '0');

        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingTime]);

  return (
    <div className={`${styles.countdown} d-flex justify-content-evenly`}>
      <div className={styles.countdown_item}>
        <h5>{days}</h5>
        <p>Days</p>
      </div>
      <div className={styles.countdown_item}>
        <h5>{hours}</h5>
        <p>Hours</p>
      </div>
      <div className={styles.countdown_item}>
        <h5>{minutes}</h5>
        <p>Minutes</p>
      </div>
      <div className={styles.countdown_item}>
        <h5>{seconds}</h5>
        <p>Seconds</p>
      </div>
    </div>
  );
};

export default Countdown;
