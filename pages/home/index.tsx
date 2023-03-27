import HeaderHome from '@pages/header-home';
import axiosInstance from '@shared/axios';
import AppContext from '@shared/components/appContext';
import PaginationComponent from '@shared/components/pagination/pagination';
import { getToken } from '@shared/utils/cookies-utils/cookies.util';
import { getConsultantDetailsData } from '@store/actions/consultation-details-actions';
import ReactHowler from 'react-howler';

import {
  dateFormat,
  formatHoursMinutes,
  timeRemaining,
  twelveHourFormat,
  unixTimeStamp
} from '@shared/utils/dateAndTime-utils/dateAndTime.util';
import { showToast, Types } from '@shared/utils/toast-utils/toast.util';
import { getUserTableData } from '@store/actions/user-table-actions';
import { useAppDispatch, useAppSelector } from '@store/redux-Hooks';
import dayjs from 'dayjs';
import { calendarColor, phoneCall } from 'imageConfig';
import getConfig from 'next/config';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { ToastContainer } from 'react-toastify';
import { io } from 'socket.io-client';
import IncomingCalls from '../incoming-calls/index';
import styles from './home.module.scss';

const { publicRuntimeConfig } = getConfig();

const defaultDateSelection = {
  startDate: new Date(),
  endDate: new Date(),
  key: 'selection',
  color: '#C19C23',
};

const Dashboard = () => {
  const dateRef: any = useRef();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { Users, isLoading } = useAppSelector((state: any) => state.userTable);
  const { socket, setSocket, callStatus, setCallStatus, consultationId } =
    useContext(AppContext) as {
      socket: any;
      setSocket: any;
      callStatus: any;
      setCallStatus: any;
      consultationId: any;
    };

  // STATES
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [range, setRange] = useState([defaultDateSelection]);
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [dateState, setDateState] = useState<any>([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
      color: '#C19C23',
    },
  ]);
  const { ConsultantDetails } = useAppSelector(
    (state: any) => state.consultationDetails
  );

  useEffect(() => {
    if (consultationId) {
      dispatch(getConsultantDetailsData(consultationId));
    }
  }, [consultationId]);

  //FUNCTIONS
  const handleClick = async (user: any) => {
    setUserId(user.id);
    if (user.remaining_time === '00:00:00:00') {
      // only emit socket when time remaining is 0 else just reroute
      let socketData = {
        userType: 'operator',
        roomName: unixTimeStamp(),
        userId: user.id,
      };
      socket.emit('calling', socketData, async (data: any) => {
        try {
          setCallStatus('redirectFromHomeToCall');  // setting this so that callstatus has a value when moving to another page and is not empty, when its time for call
          const response = await axiosInstance.post(
            `/request-video-call/${user.customer_id}`,
            {
              //send token id and roomname for push notfication on mobile side
              token: data.token,
              consultation_id: user.id,
              channel_name: data.channelName,
              room_name: JSON.stringify(data.rName),
            },
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          if (response.status === 200) {
            console.log(response);
          } else {
            return [null, null];
          }
        } catch (err: any) {
          if (err.status === 400) {
            setCallStatus('alreadyInCall');
            router.push('/home');
          }
          if (err.status === 401) console.log('401');
          if (err.status === 500) console.log('500');
          return [null, err];
        }
      });
      router.push(`call-now/${user.id}`);
    } else {
      setCallStatus('redirectFromHome'); // setting this so that call status has a value when moving to another page and is not empty, when its not time for call
      router.push(`call-now/${user.id}`);
    }
  };

  const hideOnClickOutside = (e: Event) => {
    if (dateRef.current && !dateRef.current.contains(e.target)) {
      setDateOpen(false);
    }
  };
  const handleDateRange = (item: any) => {
    setRange([item.selection]);
  };

  const clearDateSelection = () => {
    setDateState([
      {
        startDate: null,
        endDate: null,
        key: 'selection',
        color: '#C19C23',
      },
    ]);
    setRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
        color: '#C19C23',
      },
    ]);
    setDateOpen(false);
  };

  // handling popups when user declines or leaves the call
  useEffect(() => {
    switch (callStatus) {
      case 'userLeft':
        showToast(Types.error, 'User has left the call.');
        break;
      case 'userCancelled':
        showToast(Types.error, 'User has declined the call.');
        break;
      case 'issueInCall': //this has been set in the consultationId page
        showToast(
          Types.error,
          'Something went wrong! Call has been disconnected'
        );
        break;
      case 'disconnectedAutomatically': // disconnect when user doesn't pick up call
        showToast(
          Types.error,
          'User unavailable'
        );
        break;
      case 'alreadyInCall':
        showToast(Types.error, 'Call is already in process.');
        break;
    }
  }, [callStatus]);

  useEffect(() => {
    dispatch(
      getUserTableData({
        startDate:
          dateState[0].startDate !== null
            ? dayjs(dateState[0].startDate).format('YYYY-MM-DD')
            : null,
        endDate:
          dateState[0].endDate !== null
            ? dayjs(dateState[0].endDate).format('YYYY-MM-DD')
            : null,
        currentPage,
      })
    );
    if (!socket) {
      const socketURL = publicRuntimeConfig.SOCKET_URL;
      let socketConn = io(socketURL, {
        query: {
          userId: userId,
          userType: 'operator',
        },
      });
      setSocket(socketConn);
    }
  }, [dateState, currentPage]);

  // To hide the calendar on clicking outside
  useEffect(() => {
    document.addEventListener('click', hideOnClickOutside, true);
  }, []);

  return (
    <>
      <ToastContainer />
      <div>
        <ReactHowler
          src="/assets/incomingCall.mp3"
          playing={callStatus === 'calling'}
          loop={true}
          preload={true}
        />
        {callStatus === 'calling' && ConsultantDetails !== '' ? (
          <IncomingCalls ConsultantDetails={ConsultantDetails}></IncomingCalls>
        ) : (
          ''
        )}
        <div className="main_dashboard_listing">
          <HeaderHome />
          <div className={styles.main_section_listing}>
            <div className="container">
              <div className={styles.section_listing}>
                <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                  <div className={styles.caller_text}>
                    <p>Caller List</p>
                  </div>
                  <div className={styles.select_date_section}>
                    <div className={styles.inner_date_pick_inp}>
                      <div className={styles.calendar_image}>
                        <Image
                          src={calendarColor}
                          className="img-fluid"
                          alt="calendar"
                          width="18"
                          height="19"
                        />
                      </div>
                      <input
                        readOnly
                        type="text"
                        className={`form-control pr-0 ${styles.select_inputs}`}
                        placeholder="Select Date"
                        onClick={() => setDateOpen((dateOpen) => !dateOpen)}
                        value={
                          dateState[0].startDate !== null ||
                            dateState[0].endDate !== null
                            ? `${dayjs(dateState[0].startDate).format(
                              'YYYY-MM-DD'
                            )} - ${dayjs(dateState[0].endDate).format(
                              'YYYY-MM-DD'
                            )}`
                            : 'Select Date'
                        }
                      />
                    </div>
                    <div className={styles.inner_date_pick} ref={dateRef}>
                      {dateOpen && (
                        <>
                          <DateRangePicker
                            onChange={handleDateRange}
                            moveRangeOnFirstSelection={false}
                            months={2}
                            ranges={range}
                            direction="horizontal"
                            preventSnapRefocus={true}
                            calendarFocus="backwards"
                            dateDisplayFormat="yyyy MMM d"
                            minDate={new Date()}
                          />
                          <div className="d-flex justify-content-end px-2 bg-white">
                            <Button
                              variant="secondary"
                              className="btn-sm mb-3 me-1"
                              onClick={clearDateSelection}
                            >
                              Clear
                            </Button>
                            <Button
                              variant="primary"
                              className="btn-sm mb-3"
                              onClick={() => {
                                setDateState(range);
                                setDateOpen(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="table_listing">
                  <Table
                    striped
                    borderless
                    responsive
                    className={`mb-0 ${styles.table_main}`}
                  >
                    <thead>
                      <tr>
                        <th>SN</th>
                        <th>Name</th>
                        <th>Session List</th>
                        <th>Date </th>
                        <th>Duration</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Users?.results.length > 0 ? (
                        <>
                          {Users?.results?.map((user: any, index: any) => (
                            <tr key={index}>
                              <td>{(currentPage - 1) * 3 + (index + 1)}.</td>
                              <td>{user.name}</td>
                              <td>{user.consultation_type}</td>
                              <td>{dateFormat(user.consult_date)}</td>
                              <td>
                                {twelveHourFormat(user.start_time)}-
                                {twelveHourFormat(user.end_time)} (
                                {formatHoursMinutes(user.duration)})
                                {user.remaining_time !== '00:00:00:00' && user.status !== 'pending' && user.status !== 'consulted'
                                  ? <p className="fs-base text-danger fw-400">
                                    {timeRemaining(user.remaining_time)}{' '}
                                    remaining
                                  </p>
                                  : <p className="fs-base text-success fw-400">
                                    You are able to call now
                                  </p>
                                }
                              </td>
                              <td>
                                <button
                                  className={`d-flex align-items-center ${styles.call_now
                                    } ${user.remaining_time == '00:00:00:00'
                                      ? ''
                                      : styles.deactivated_calls
                                    }`}
                                  onClick={() => handleClick(user)}
                                >
                                  <Image
                                    src={phoneCall}
                                    width={20}
                                    height={20}
                                    className="img-fluid"
                                    alt="Phone"
                                  />
                                  <p className="ps-1">Call Now</p>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <>
                          <tr>
                            <td colSpan={6}>No Data Found</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </Table>
                  {Users?.results && Users.results?.length > 0 && (
                    <>
                      <PaginationComponent
                        itemsCount={Users.pagination?.total}
                        itemsPerPage={Users.pagination?.per_page}
                        currentPage={Users.pagination.current_page}
                        setCurrentPage={setCurrentPage}
                        totalPage={Users.pagination.total_pages}
                        alwaysShown={true}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
