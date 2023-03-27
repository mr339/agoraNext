import { loginUser } from '@shared/services/auth';
import { getUserFromStorage } from '@shared/utils/cookies-utils/cookies.util';
import { showToast, Types } from '@shared/utils/toast-utils/toast.util';
import {
  backgroundlogin,
  eyesopen,
  logoSmall,
  visiblePassword
} from 'imageConfig';
import getConfig from 'next/config';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FormEventHandler, useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { ILogin } from './interface';
import styles from './login.module.scss';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();

  const validateUser: FormEventHandler<HTMLFormElement> = async (event) => {
    toast.dismiss();
    event.preventDefault();
    setDisabled(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values: ILogin = {
      username: formData.get('userName') as string,
      password: formData.get('password') as string,
      rememberMe: formData.get('rememberMe') === 'true',
      clientId: publicRuntimeConfig.CLIENT_ID as string,
      clientSecret: publicRuntimeConfig.CLIENT_SECRET as string,
      grantType: publicRuntimeConfig.GRANT_TYPE as string,
    };
    const {
      username,
      password,
      rememberMe,
      clientId,
      clientSecret,
      grantType,
    } = values;
    const [response] = await loginUser({
      username,
      password,
      rememberMe,
      clientId,
      clientSecret,
      grantType,
    });
    if (response && getUserFromStorage()) {
      showToast(Types.success, 'Successfully logged in.');
      router.push('/home');
    } else {
      showToast(Types.error, 'Something went wrong!');
      setDisabled(false);
      console.log('error'); //may need to add popup
    }
  };

  useEffect(() => {
    if (getUserFromStorage()) {
      router.push('/home');
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <div
        className={styles.main_login}
        style={{ backgroundImage: `url(${backgroundlogin})` }}
      >
        <div className={styles.main_login_section}>
          {/* <div className="banner_main_section w-50">
          <div className="banner_login">
            <Image
              src={loginBanner}
              width={869}
              height={870}
              className="img-fluid"
              alt="login banner"
            />
          </div>
        </div> */}
          <div
            className={`d-flex justify-content-center align-items-center ${styles.main_login_forms}`}
          >
            <div className={styles.login_form}>
              <div className={`mb-4 ${styles.upper_login}`}>
                <div className="small_logo">
                  <Image
                    src={logoSmall}
                    width={100}
                    height={99.8}
                    className="img-fluid"
                    alt="login banner"
                  />
                </div>
                <div className={styles.main_title}>
                  <h1>
                    welcome to <br /> nepa Rudraksha
                  </h1>
                  <p>
                    Welcome to Nepa Rudraksha. Login with your <br />{' '}
                    credentials to acess your account.
                  </p>
                </div>
              </div>
              <form className="w-100" onSubmit={validateUser}>
                <Form.Group className="mb-4">
                  <Form.Label name="userName" className={styles.lables_login}>
                    Email or Phone Number
                  </Form.Label>
                  <div>
                    <Form.Control
                      type="text"
                      name="userName"
                      placeholder="shivahari@example.com"
                      className={styles.inputs_login}
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label name="password" className={styles.lables_login}>
                    Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      name="password"
                      className={styles.inputs_login}
                      autoComplete="off"
                    />
                    <div className={styles.pass_icon}>
                      <Image
                        src={showPassword ? visiblePassword : eyesopen}
                        className="img-fluid"
                        alt="logo"
                        width="24"
                        height="24"
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                      />
                    </div>
                  </div>
                </Form.Group>
                <Form.Check
                  label={`Remember Me`}
                  className={styles.radio_remember}
                  name="rememberMe"
                  value="true"
                  defaultChecked={false}
                />
                <div className={`${styles.login_button}`}>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={disabled}
                    className="w-100"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
