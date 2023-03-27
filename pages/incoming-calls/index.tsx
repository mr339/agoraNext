import AppContext from '@shared/components/appContext';
import { endCall, incomingCall, videoCallGreen } from 'imageConfig';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import styles from './incomingCalls.module.scss';

const IncomingCalls = ({ ConsultantDetails }: any) => {
  const {
    socket,
    channelName,
    channelToken,
    roomName,
    consultationId,
    setCallStatus,
    setRoomName,
    callStatus,
  } = useContext(AppContext) as {
    socket: any;
    channelToken: any;
    channelName: any;
    roomName: any;
    consultationId: any;
    setCallStatus: any;
    setRoomName: any;
    callStatus: any;
  };
  const handleClose = () => setShow(false);
  const [show, setShow] = useState(true);
  const router = useRouter();

  if (
    callStatus === 'userCancelled' ||
    callStatus === 'pickedUpByFirstOperator'
  ) {
    setShow(false);
  }
  let socketDataForCancle = {
    roomName: roomName,
    userType: 'operator',
  };
  const handleCall = () => {
    let socketData = {
      roomName: roomName,
      channelName: channelName,
      channelToken: channelToken,
      userType: 'operator',
    };
    setCallStatus('callAccepted');
    socket.emit('call-connected', socketData, (data: any) => {
      setRoomName(roomName);
      router.push(`/call-now/${consultationId}`);
    });
  };

  const declineCall = () => {
    socket.emit('call-cancel', socketDataForCancle, (data: any) => {
      console.log(data);
    });
    setCallStatus('callDeclined');
    setShow(false);
  };
  return (
    <>
      <div className={`modal show ${styles.call_modal}`}>
        <Modal
          show={show}
          onHide={handleClose}
          centered
          size="sm"
          backdrop="static"
          keyboard={false}
          dialogClassName={styles.call_modal_dialog}
          contentClassName={styles.call_modal_content}
        >
          <Modal.Body className={styles.modal_incoming_wrapper}>
            <div className={styles.main_modal_incoming_calls}>
              <h1>Calling...</h1>
              <div className={styles.user_calling_image}>
                <Image
                  src={incomingCall}
                  width={115}
                  height={115}
                  className="img-fluid"
                  alt="user"
                />
              </div>
              <p>{ConsultantDetails?.name}</p>
              {ConsultantDetails?.is_individual ? (
                <span>Individual </span>
              ) : (
                <span>Group </span>
              )}
              <div className="calls_images d-flex">
                <Image
                  src={videoCallGreen}
                  width={60}
                  onClick={() => handleCall()}
                  height={60}
                  className="img-fluid mx-2"
                  alt="Video Callasdfadsf"
                />
                <Image
                  src={endCall}
                  width={60}
                  onClick={() => declineCall()}
                  height={60}
                  className="img-fluid mx-2"
                  alt="End Call"
                />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default IncomingCalls;
