import AppContext from '@shared/components/appContext';
// Toast styles from react-toasify
// import { SSRProvider } from '@react-aria/ssr';
import { config } from '@shared/config';
import { triggerVideo } from '@shared/services/trigger-video';
import { showToast, Types } from '@shared/utils/toast-utils/toast.util';
import { store } from '@store/index';
import { NextPage } from 'next';
import { Session } from 'next-auth';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SSRProvider } from 'react-bootstrap';
import { Provider } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.scss';
import '../styles/sass/styles.scss';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  pageProps: { session?: Session };
};

function BaseCode({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const publicRuntimeConfig = config.gateway;

  const router = useRouter();
  const { asPath } = useRouter();
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [userVideoDisplayStatus, setUserVideoDisplayStatus] = useState(true);
  const [userAudioStatus, setUserAudioStatus] = useState('');
  const [userType, setUserType] = useState('operator');
  const [buildingId, setBuildingId] = useState([]);
  const [users, setUsers] = useState([]);
  const [callStatus, setCallStatus] = useState('');
  const [consultationId, setConsultationId] = useState();
  const [callFromName, setCallFromName] = useState('');
  const [joinTo, setJoinTo] = useState();
  const [isInCall, setIsInCall] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isOperatorBusy, setIsOperatorBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputValue, setInputValue] = useState(null);
  const [joined, setJoined] = useState(false);
  const [channelToken, setChannelToken] = useState(null);
  const [channelName, setChannelName] = useState(null);
  const [emergencyChannelToken, setEmergencyChannelToken] = useState(null);
  const [emergencyChannelName, setEmergencyChannelName] = useState(null);
  const [client, setGlobalClient] = useState<any>(null);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        setIsConnected(socket.connected);
        console.log(`operator is connected to socket room: ${buildingId}`);
      });

      socket.on('reconnect', (attempt: any) => {
        console.log(attempt);
      });

      socket.on('call-init', async (data: any) => {
        setCallStatus('calling');
        setRoomName(data.rName)
        setChannelName(data.channelName);
        setChannelToken(data.token);
        setConsultationId(data.consultationId)
      });

      socket.on('call-joined', (data: any) => {
        setChannelName(data.channelName);
        setChannelToken(data.token);
        setRoomName(data.rName);
        setCallStatus('attended');
      });

      if (callStatus !== 'callAccepted') {
        socket.on('call-pickedByFirstOperator', async (data: any) => { // handling logic when call goes to multiple operators and the first one picks up so need to close incoming call popup for remaining operators
          setCallStatus('pickedUpByFirstOperator');
          router.push('/home');
        });
      }

      socket.on('call-onhold', (data: any) => {
        setCallStatus('hold');
      });

      socket.on('call-reconnected', (data: any) => {
        setCallStatus('rejoin');
      });

      socket.on('call-leaved', async (data: any) => { // user cancelled while on call
        setCallStatus('userLeft');
        client?.leave();
        setIsInCall(false);
        router.push('/home');
        const [response] = await triggerVideo('end', data.customerId, data.consultationId);
        if (!response) {
          showToast(Types.error, 'Something went wrong! in triggervideoApi end');
        }

      });

      socket.on('call-cancelled', (data: any) => { // user declined while ringing
        setCallStatus('userCancelled');
        router.push('/home')
      });

      socket.on('video-display', (data: any) => { // detecting if user disabled or enabled their video
        if (data.video) {
          setUserVideoDisplayStatus(true)
        } else {
          setUserVideoDisplayStatus(false)
        }
      });

      socket.on('audio-value', (data: any) => { // detecting if user disabled or enabled their audio
        if (data.audio) {
          setUserAudioStatus('unmute')
        } else {
          setUserAudioStatus('mute')
        }
      });

      socket.on('disconnect', (reason: any) => {
        setCallStatus('socketDisconnected');
        setIsConnected(false);
        leaveCall();
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket.connect();
        }
        // else the socket will automatically try to reconnect
      });

      socket.on('operator-busy', (data: any) => {
        if (
          userType === 'user' &&
          Number(buildingId) === Number(data.buildingId)
        ) {
          if (data?.msg) {
            setErrorMessage(data?.msg);
            setIsOperatorBusy(true);
          } else {
            setIsOperatorBusy(false);
            setErrorMessage('');
          }
        }
      });


      socket.on('error', (error: any) => {
        leaveCall();
        console.log(error);
      });

      return () => {
        socket.off('call-init');
        socket.off('reconnect');
        socket.off('call-sos-init');
        socket.off('ring-init');
        socket.off('ring-sos-init');
        socket.off('call-joined');
        socket.off('call-sos-joined');
        socket.off('call-onhold');
        socket.off('call-reconnected');
        socket.off('call-sos-leaved');
        socket.off('disconnect');
        socket.off('call-cancelled');
        socket.off('video-display');
        leaveCall();
        socket.disconnect();
      };
    }
  }, [socket, buildingId]);

  const reJoinCall = () => {
    socket.emit('call-reconnect', { buildingId: joinTo }, (rejoin: any) => {
      setCallStatus('rejoin');
    });
  };

  const leaveCall = async () => {
    socket.emit(
      'call-disconnected',
      { buildingId: joinTo },
      (isDisconnected: any) => {
        if (isDisconnected) {
          setCallStatus('left');
          setIsInCall(false);
        }
      }
    );
  };

  const holdCall = () => {
    socket.emit('call-hold', { buildingId: joinTo }, (isHold: any) => {
      if (isHold) {
        setCallStatus('hold');
      }
    });
  };

  return (
    <SSRProvider>
      <AppContext.Provider
        value={{
          socket,
          setSocket,
          isConnected,
          setIsConnected,
          buildingId,
          setBuildingId,
          users,
          setUsers,
          callStatus,
          setCallStatus,
          callFromName,
          setRoomName,
          consultationId,
          setConsultationId,
          roomName,
          joinTo,
          setJoinTo,
          isInCall,
          setIsInCall,
          isOperatorBusy,
          setIsOperatorBusy,
          errorMessage,
          setErrorMessage,
          inputValue,
          setInputValue,
          joined,
          setJoined,
          channelToken,
          userVideoDisplayStatus,
          userAudioStatus,
          setUserVideoDisplayStatus,
          setUserAudioStatus,
          setChannelToken,
          channelName,
          setChannelName,
          emergencyChannelToken,
          setEmergencyChannelToken,
          emergencyChannelName,
          setEmergencyChannelName,
          reJoinCall,
          leaveCall,
          holdCall,
          setGlobalClient,
        }}
      >
        <ThemeProvider themes={['light', 'darken']} attribute="class">
          <Provider store={store}>
            {getLayout(<Component {...pageProps} />)}
          </Provider>
        </ThemeProvider>
      </AppContext.Provider>
    </SSRProvider>
  );
}

export default BaseCode;
