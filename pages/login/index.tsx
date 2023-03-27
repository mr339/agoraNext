import AuthLayout from '@features/auth';
import LoginPage from '@features/auth/components/login';
import { NextPageWithLayout } from '@pages/_app';

const AuthLogin: NextPageWithLayout = () => {
  return <LoginPage></LoginPage>;
};

export default AuthLogin;

AuthLogin.getLayout = (page: React.ReactElement) => {
  return <AuthLayout>{page}</AuthLayout>;
};
