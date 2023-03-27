import { clearAuthFromStorage } from '@shared/utils/cookies-utils/cookies.util';
import { getConsultantData } from '@store/actions/consultant-actions';
import { useAppDispatch, useAppSelector } from '@store/redux-Hooks';
import { dotsDrop, logoHuge, logOut, userImage } from 'imageConfig';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import styles from './headerHome.module.scss';

function HeaderHome() {
  const handleLogout = () => {
    clearAuthFromStorage();
    router.push('/login');
  };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { Consultant } = useAppSelector((state: any) => state.consultant);

  useEffect(() => {
    dispatch(getConsultantData());
  }, []);

  return (
    <div className={styles.head_listing_dash}>
      <div className="container d-flex justify-content-between">
        <div className={styles.logo_header}>
          <Link href={'/home'}>
            <Image
              src={logoHuge}
              width={314}
              height={75}
              className="img-fluid"
              alt="logo"
            />
          </Link>
        </div>
        <div className="user_drop">
          <div className="user_drop_inner">
            <Dropdown align="end" className={styles.profile_main_dropdowns}>
              <div>
                <Dropdown.Toggle
                  className={styles.profile_drop}
                  variant="success"
                  id="dropdown-basic"
                >
                  <div className={styles.profile_images}>
                    <div className="d-flex align-items-center">
                      <div className="inner_profile_image">
                        <Image
                          src={userImage}
                          className="img-fluid"
                          alt="logo"
                          width="55"
                          height="55"
                        />
                      </div>
                      <div
                        className={`mb-0 px-2 ${styles.astrologer_infomations}`}
                      >
                        <p>{Consultant.name}</p>
                        <span>Consultant</span>
                      </div>
                    </div>
                    <div className={styles.dots_image}>
                      <Image
                        src={dotsDrop}
                        className="img-fluid me-3"
                        alt="logo"
                        width="5"
                        height="4"
                      />
                    </div>
                  </div>
                </Dropdown.Toggle>
              </div>

              <Dropdown.Menu className={`${styles.drop_menu_user}`}>
                <Dropdown.Item
                  className={`d-flex align-items-center mb-0 p-0 ${styles.items_drop}`}
                >
                  <Image
                    src={logOut}
                    className="img-fluid me-3"
                    alt="logo"
                    width="24"
                    height="24"
                  />
                  <p onClick={handleLogout}>Logout</p>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderHome;
