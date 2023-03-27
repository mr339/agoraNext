import MainLayout from '@features/home/components/layout/main';
import HeaderHome from '@pages/header-home';
import AppContext from '@shared/components/appContext';
import Countdown from '@shared/components/countdown/countdown';
import ToastNotification from '@shared/components/toast-notification';
import { triggerVideo } from '@shared/services/trigger-video';
import {
  dateFormat,
  durations,
  timeDiff,
  twelveHourFormat,
  useCountdown
} from '@shared/utils/dateAndTime-utils/dateAndTime.util';
import { showToast, Types } from '@shared/utils/toast-utils/toast.util';
import { getConsultantDetailsData } from '@store/actions/consultation-details-actions';
import { useAppDispatch, useAppSelector } from '@store/redux-Hooks';
import {
  audioEnabledIcon,
  endButton,
  fullScreenImage,
  hourglassIcon,
  microPhone,
  phoneCall,
  ringingUser,
  smallScreenImage,
  videoCall,
  videoEnabledIcon
} from 'imageConfig';
import getConfig from 'next/config';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import ReactHowler from 'react-howler';
import { ToastContainer } from 'react-toastify';
import VideoPlayer from '../video-player';
import styles from './callNow.module.scss';

const { publicRuntimeConfig } = getConfig();
const APP_ID = publicRuntimeConfig.AGORA_APP_ID;

const CallNow = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showTimeNotification, setShowTimeNotification] = useState<any>(false);
  const [microphoneEnaled, setMicrophoneEnabled] = useState<any>(true);
  const [videoEnabled, setvideoEnabled] = useState<any>(true);
  const [users, setUsers] = useState<any[]>([]);
  const [userAudio, setUserAudio] = useState<any>();
  const [client, setClient] = useState<any>(null);
  const [userJoined, setUserJoined] = useState<boolean>(false);
  const [AgoraRTC, setAgoraRTC] = useState<any>(null);
  const [localTracks, setLocalTracks] = useState<any[]>([]);
  const [timer, setTimer] = useState<any>(0);
  const [callRing, setCallRing] = useState<boolean>(false);
  const [callDroptimer, setcallDropTimer] = useState<any>(0);
  const [timerId, setTimerId] = useState<any>(null);
  const [callDropTimerId, setcallDropTimerId] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const [uid, setUid] = useState<any>('');
  const allVideoRef: any = useRef();

  const { ConsultantDetails } = useAppSelector(
    (state: any) => state.consultationDetails
  );
  // appointment time difference
  const countDuration = timeDiff(
    ConsultantDetails?.consult_end,
    ConsultantDetails?.recent_time
  );
  // remaining appointment time countdown
  const remainingCountdown = useCountdown(countDuration);

  // total duration
  const totalDuration = durations(ConsultantDetails.duration);

  const formattedConsultStart = twelveHourFormat(
    ConsultantDetails.consult_start
  );
  const formattedConsultEnd = twelveHourFormat(ConsultantDetails.consult_end);
  const { consultationId } = router.query;
  const { setGlobalClient } = useContext(AppContext) as {
    setGlobalClient: any;
  };
  const {
    socket,
    callStatus,
    channelName,
    roomName,
    channelToken,
    setCallStatus,
    userVideoDisplayStatus,
    userAudioStatus
  } = useContext(AppContext) as {
    socket: any;
    setSocket: any;
    callStatus: any;
    channelName: any;
    channelToken: any;
    setCallStatus: any;
    roomName: any;
    userVideoDisplayStatus: any;
    userAudioStatus: any;
  };
  const channelParameterMemo = (channelName: any) => {
    return {
      // A variable to hold a local audio track.
      localAudioTrack: null,
      // A variable to hold a local video track.
      localVideoTrack: null,
      // A variable to hold a remote audio track.
      remoteAudioTrack: null,
      // A variable to hold a remote video track.
      remoteVideoTrack: null,
      // A variable to hold the remote user id.s
      remoteUid: null,
    };
  };
  let channelParameters: any = useMemo(
    () => channelParameterMemo(channelName),
    [channelName]
  );

  useEffect(() => {
    if (callStatus !== 'calling' && callStatus !== 'attended') {
      setCallRing(true);
    }
    const clientFunction = async () => {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8',
      });
      setAgoraRTC(AgoraRTC);
      setClient(client);
    };
    clientFunction();
    if (
      ConsultantDetails.remaining_time !== undefined &&
      ConsultantDetails.remaining_time === '00:00:00:00'
    ) {
      setcallDropTimerId(
        setInterval(() => {
          setcallDropTimer((prevTimer: any) => prevTimer + 1);
        }, 1000)
      );
    }
    return () => {
      clearInterval(callDropTimerId);
    };
  }, []);

  useEffect((): any => {
    // leaving call automatically after 30 seconds if user doesn't pick up
    let socketData = {
      roomName: roomName,
      userType: 'operator',
    };
    if (callDroptimer >= 30) {
      socket.emit('call-cancel', socketData, (data: any) => {
        clearInterval(callDropTimerId);
        router.push('/home');
      });
      setCallStatus('disconnectedAutomatically');
    }
  }, [callDroptimer, callDropTimerId]);

  useEffect((): any => {
    // 10 minute time remaining notification trigger
    let socketData = {
      roomName: roomName,
      userType: 'operator',
    };
    const durationInSeconds = ConsultantDetails.duration * 60;
    if (timer >= durationInSeconds + 1) {
      // checking if timer is more than duration of call
      socket.emit('call-disconnected', socketData, async (data: any) => {
        await handleUserLeftFromCall(ConsultantDetails);
        router.push('/home');
      });
      setCallStatus('disconnectedAfterFullTime');
      clearInterval(timerId);
    } else if (timer === durationInSeconds + 600) {
      // checking if timer + 10 mins
      setShowTimeNotification(true);
    } else {
      // do something later if another use case is added
    }
  }, [ConsultantDetails.duration, timer, timerId]);

  const handleUserJoin = async (data: any) => {
    //function to handle when user joins and calling trigger video call api for logging
    clearInterval(callDropTimerId); //clear the calldroptimer if user joins
    const [response] = await triggerVideo('start', data.customer_id, data.id);
    if (!response) {
      showToast(Types.error, 'Something went wrong! in triggervideoApi start');
    }
  };

  const handleUserLeftFromCall = async (data: any) => {
    //function to handle when consultant leaves or call ends after full time and calling trigger video call api for logging
    const [response] = await triggerVideo('end', data.customer_id, data.id);
    if (!response) {
      showToast(Types.error, 'Something went wrong! in triggervideoApi end');
    }
  };


  const handleFullScreen = (e: any) => {
    setIsFullScreen(!isFullScreen);
    const element: any = allVideoRef.current;
    if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }

    if (isFullScreen) {
      if (!element.webkitRequestFullscreen) {
        document.exitFullscreen();
      } else if (!element.msRequestFullscreen) {
        document.exitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  const handleUserJoined = async (user: any, mediaType: any) => {
    await client.subscribe(user, mediaType);
    if (mediaType === 'video') {
      setUserJoined(true);
      channelParameters.remoteVideoTrack = user.videoTrack;
      user.userType = 'user';
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === 'audio') {
      setUserAudio(user);
      channelParameters.remoteAudioTrack = user.audioTrack;
      user.audioTrack.play();
    }
  };

  const handleUserLeft = (user: any) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  const handleUserUnpublished = (user: any, mediaType: any) => {
    setUsers((previousUsers: any) =>
      previousUsers.filter((u: any) => u.uid !== user.uid)
    );
  };

  const cancelCall = () => {
    let socketData = {
      roomName: roomName,
      userType: 'operator',
    };
    if (channelParameters.remoteAudioTrack) {
      channelParameters.remoteAudioTrack.close();
      channelParameters.remoteAudioTrack.stop();
    }
    if (channelParameters.remoteVideoTrack) {
      channelParameters.remoteVideoTrack.close();
      channelParameters.remoteVideoTrack.stop();
    }

    if (!userJoined) {
      socket.emit('call-cancel', socketData, (data: any) => {
        console.log(data);
      });
      setCallStatus('disconnectedBeforeCall');
    } else {
      socket.emit('call-disconnected', socketData, async (data: any) => {
        console.log(data);
        await handleUserLeftFromCall(ConsultantDetails);
      });
      setCallStatus('disconnectedInCall');
    }
    router.push('/home');
  };

  const handleMicrophoneChange = async () => {
    setMicrophoneEnabled(!microphoneEnaled);
    if (microphoneEnaled) {
      channelParameters.localAudioTrack.setEnabled(false);
    } else {
      channelParameters.localAudioTrack = null;
      let audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      channelParameters.localAudioTrack = audioTrack;
      await client.publish(audioTrack);
    }
  };

  const handleVideoChange = async () => {
    setvideoEnabled(!videoEnabled);
    let socketData = {
      roomname: roomName,
      userType: 'operator',
      videoStatus: videoEnabled
    }
    if (videoEnabled) {
      socket.emit('video-status', socketData, (data: any) => {
        console.log(data)
      });
      channelParameters.localVideoTrack.setEnabled(false);
    } else {
      socket.emit('video-status', socketData, (data: any) => {
        console.log(data)
      });
      channelParameters.localVideoTrack.setEnabled(true);
    }
  };

  useEffect((): any => {
    if (consultationId) {
      dispatch(getConsultantDetailsData(consultationId));
    }
    const hasWindow = typeof window !== 'undefined';
    const joinChannel = () => {
      client
        .join(APP_ID, channelName, channelToken, 0)
        .then((uid: any) => {
          return Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid]);
        })
        .then(async ([tracks, uid]: any) => {
          const [audioTrack, videoTrack] = tracks;
          await client.publish(audioTrack);
          await client.publish(videoTrack);
          channelParameters.localAudioTrack = audioTrack;
          channelParameters.localVideoTrack = videoTrack;
          setUid(uid);
          setUsers((previousUsers) => [
            ...previousUsers,
            {
              uid,
              userType: 'operator',
              videoTrack,
              audioTrack,
            },
          ]);
        });
      client.on('user-published', handleUserJoined);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-left', handleUserLeft);
    };
    if (
      hasWindow &&
      client &&
      (callStatus === 'calling' ||
        callStatus === 'attended' ||
        callStatus === 'callAccepted')
    ) {
      joinChannel();
      setCallRing(false); //stop outgoing ring
      setTimerId(
        setInterval(() => {
          setTimer((prevTimer: any) => prevTimer + 1);
        }, 1000)
      );

      return async () => {
        if (channelParameters.localAudioTrack) {
          channelParameters.localAudioTrack.stop();
          channelParameters.localAudioTrack.close();
        }
        if (channelParameters.localVideoTrack) {
          channelParameters.localVideoTrack.stop();
          channelParameters.localVideoTrack.close();
        }
        client.off('user-published', handleUserJoined);
        client.off('user-unpublished', handleUserUnpublished);
        client.off('user-left', handleUserLeft);
        clearInterval(timerId);
        if (client.connectionState === 'CONNECTED') {
          await client
            .unpublish(
              channelParameters.remoteAudioTrack,
              channelParameters.remoteVideoTrack
            )
            .then(() => client.leave());
        } else {
          client.leave();
        }
      };
    }
    if (callStatus === '' || callStatus === 'socketDisconnected') {
      // redirect to home page if page refreshed or socket error
      setCallStatus('issueInCall');
      client?.leave();
      router.push('/home');
    }
  }, [consultationId, channelName, client, channelToken, callStatus]);

  useEffect(() => {
    //useEffect to handle when user joins and calling trigger video call api for logging
    if (callStatus === 'calling' || callStatus === 'attended' || callStatus === 'callAccepted') {
      handleUserJoin(ConsultantDetails);
    }
  }, [ConsultantDetails]);

  useEffect(() => {
    //useEffect to handle muting and unmuting of user from consultant side
    if (userAudio !== undefined && userAudioStatus !== '' && userAudioStatus === 'mute') {
      channelParameters.remoteAudioTrack.close();
      channelParameters.remoteAudioTrack.stop();
    } else {
      channelParameters.remoteAudioTrack = userAudio?.audioTrack;
      userAudio?.audioTrack.play();
    }
  }, [userAudio, userAudioStatus]);


  return (
    <>
      {ConsultantDetails.remaining_time !== undefined &&
        ConsultantDetails.remaining_time === '00:00:00:00' && (
          <ReactHowler
            src="/assets/outgoingCall.mp3"
            playing={callRing}
            loop={true}
            preload={true}
          />
        )}
      <ToastContainer />
      <div>
        <HeaderHome />
        <div className="row gx-0">
          <div className="col-md-12 col-lg-8">
            <div className={styles.main_calling_section}>
              {ConsultantDetails.remaining_time !== undefined &&
                ConsultantDetails.remaining_time === '00:00:00:00' ? (
                //left side of the page(video section) part starts
                <div>
                  <div className={styles.video_section}>
                    <div
                      className="inner_caller_ringing h-100 position-relative"
                      ref={allVideoRef}
                    >
                      <div className={styles.full_screen_image}>
                        <Image
                          src={
                            isFullScreen ? smallScreenImage : fullScreenImage
                          }
                          width={36}
                          height={36}
                          onClick={handleFullScreen}
                          className="img-fluid cursor-pointer"
                          alt="full screen"
                        />
                      </div>
                      {showTimeNotification && (
                        <div className="mt-4">
                          <ToastNotification
                            hideNotifcation={() =>
                              setShowTimeNotification(false)
                            }
                            message="Your meeting will end in 10 minutes"
                            classname="w-50 mx-auto p-2 text-black"
                          />
                        </div>
                      )}
                      {userJoined ? (
                        users.map((user, index) => (
                          <div
                            key={index}
                            className={`h-100 ${user.uid} ${user.userType === 'operator'
                              ? `${styles.operator}`
                              : `${styles.user} ${!userVideoDisplayStatus
                                ? `${styles.hide_video}`
                                : ''
                              }`
                              }`}
                          >
                            <VideoPlayer user={user}></VideoPlayer>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className={`${styles.ringing_image} h-100`}>
                            <Image
                              src={ringingUser}
                              width={141}
                              height={141}
                              className="img-fluid"
                              alt="ringing"
                            />
                            <p>Ringing</p>
                          </div>
                        </>
                      )}
                      <div className={styles.caller_buttons}>
                        <Button
                          variant="mirophone"
                          className="microphone_section mx-3 p-0 cursor-pointer"
                          onClick={handleMicrophoneChange}
                          disabled={!userJoined}
                        >
                          <Image
                            src={
                              microphoneEnaled ? audioEnabledIcon : microPhone
                            }
                            width={60}
                            height={60}
                            className="img-fluid"
                            alt="microphone"
                          />
                        </Button>
                        <Button
                          variant="microphone"
                          className="microphone_section p-0 mx-1"
                        >
                          <Image
                            src={endButton}
                            onClick={() => cancelCall()}
                            width={80.94}
                            height={55}
                            className="img-fluid"
                            alt="end button"
                          />
                        </Button>
                        <Button
                          variant="microphone"
                          className="microphone_section p-0 mx-3"
                          onClick={() => handleVideoChange()}
                          disabled={!userJoined}
                        >
                          <Image
                            src={videoEnabled ? videoEnabledIcon : videoCall}
                            width={60}
                            height={60}
                            className="img-fluid"
                            alt="video call"
                          />
                        </Button>
                      </div>
                      {/* {isFullScreen && ( */}
                      <div className={styles.fullscreen_time_info}>
                        <div
                          className={`${styles.main_time_counts} fs-sm d-flex`}
                        >
                          <div
                            className={`d-flex align-items-center ${styles.timing}`}
                          >
                            <p className={`me-2 ${styles.time_info}`}>
                              {formattedConsultStart} - {formattedConsultEnd}
                            </p>
                            <span className={styles.span_timing}>|</span>
                          </div>
                          <div
                            className={`ms-2 ${styles.timer} ${styles.time_info}`}
                          >
                            {/* <p>{durations(ConsultantDetails.duration)}</p> */}
                            <p>
                              {userJoined ? remainingCountdown : totalDuration}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>
              ) : ConsultantDetails.remaining_time !== undefined &&
                ConsultantDetails.remaining_time !== '00:00:00:00' ? (
                <div className={`${styles.waiting_section} text-center`}>
                  <Image
                    src={hourglassIcon}
                    height="210"
                    width="200"
                    alt="Hourglass"
                  />
                  <h3>Please wait! It’s not time yet.</h3>
                  <p className="fw-500 mb-3">
                    We’ll let you know when the call is available.{' '}
                  </p>
                  <Link href={'/home'} className="btn btn-primary">
                    Go Back to Home
                  </Link>
                </div>
              ) : (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              )}
            </div>
          </div>
          {/* left side of the page(video section) part ends */}

          {/* right side of the page starts */}
          <div className="col-md-12 col-lg-4">
            <div className={styles.main_info_section}>
              <div className={styles.inner_info_section}>
                {ConsultantDetails.remaining_time === '00:00:00:00' ? (
                  ''
                ) : (
                  <div>
                    <div
                      className={`d-flex justify-content-between ${styles.inner_timers}`}
                    >
                      <h1>{" It's time Now"}</h1>
                      <p>{dateFormat(ConsultantDetails.consult_date)}</p>
                    </div>
                    <div className={styles.timers_numbers}>
                      <Countdown
                        remainingTime={ConsultantDetails?.remaining_time}
                      />
                    </div>
                    <div className="deactivated_button_call">
                      <button
                        className={`d-flex justify-content-center align-items-center w-100 ${styles.deactivated_calls}`}
                      >
                        <Image
                          src={phoneCall}
                          width={20}
                          height={20}
                          className="img-fluid"
                          alt="logo"
                        />
                        <p className="ps-1">Call Now</p>
                      </button>
                    </div>
                  </div>
                )}
                <h1>Appointment Time </h1>
                <div className={styles.main_time_counts}>
                  <div className={`d-flex align-items-center ${styles.timing}`}>
                    <p className="pe-2">
                      {formattedConsultStart} - {formattedConsultEnd}
                    </p>
                    <span className={styles.span_timing}>|</span>
                  </div>
                  <div className={`ms-2 ${styles.timer}`}>
                    <p>{totalDuration}</p>
                  </div>
                </div>
                <div className={styles.session_information}>
                  <div className={`d-flex ${styles.booked_by_sec}`}>
                    <p>Booked By</p>
                    <span>{ConsultantDetails.name}</span>
                  </div>
                  <div className={`d-flex ${styles.booked_by_sec}`}>
                    <p>Session</p>
                    <span>: Individual</span>
                  </div>
                </div>

                <div className={styles.main_info_wrapper}>
                  {ConsultantDetails?.members?.map((user: any, index: any) => (
                    <div key={index} className="main_cards_infor">
                      <div className={styles.members_number}>
                        <p>Member {index + 1}</p>
                      </div>
                      <div className={styles.card_information}>
                        <h2>
                          {user.fullName}
                          <span>{user.relationship}</span>
                        </h2>
                        <div className={`d-flex ${styles.booked_by_sec}`}>
                          <p>DOB</p>
                          {/* <span>: November 29, 1995</span> */}
                          <span>: {user.dob}</span>
                        </div>
                        <div className={`d-flex ${styles.booked_by_sec}`}>
                          <p>Birth Time</p>
                          {/* <span>: 09:10 :00 PM</span> */}
                          <span>: {user.birth_time}</span>
                        </div>
                        <div className={`d-flex ${styles.booked_by_sec}`}>
                          <p>Birth Place</p>
                          <span>: {user.country}</span>
                        </div>
                        <div className={`d-flex mb-0 ${styles.booked_by_sec}`}>
                          <p>Zodiac</p>
                          <span>: {user?.Zodiac}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* right side of the page ends */}
        </div>
      </div>
    </>
  );
};

export default CallNow;

CallNow.getLayout = (page: React.ReactElement) => {
  return <MainLayout>{page}</MainLayout>;
};
