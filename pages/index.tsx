import LoginPage from '@features/auth/components/login';
import MainLayout from '@features/home/components/layout/main';
import { NextPageWithLayout } from '@pages/_app';

const Dashboard: NextPageWithLayout<{ records: any }> = ({ records }) => {
  return <LoginPage></LoginPage>
};

export default Dashboard;
Dashboard.getLayout = (page: React.ReactElement) => {
  return <MainLayout>{page}</MainLayout>;
};
