import { clockIcon } from 'imageConfig';
import Image from 'next/image';
import { Button } from 'react-bootstrap';
import styles from './toast-notification.module.scss';

type Props = {
  message: string;
  hideNotifcation: () => void;
  classname?: string;
};

const ToastNotification = ({ message, hideNotifcation, classname }: Props) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-between ${styles.notification} ${classname} `}
    >
      <div className="d-flex align-items-center">
        <span className="me-3">
          <Image height={44} width={44} src={clockIcon} alt="Clock" />
        </span>
        <p>{message}</p>
      </div>
      <Button variant="cross" className="p-0" onClick={hideNotifcation}>
        <i className="fa-regular fa-circle-xmark text-danger fs-lg"></i>
      </Button>
    </div>
  );
};

export default ToastNotification;
