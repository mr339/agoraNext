import Footer from '@features/home/components/layout/main/footer';
import Header from '@features/home/components/layout/main/header';
import React from 'react';

import { Inter } from '@next/font/google';
import Head from 'next/head';
import { useRouter } from 'next/router';

const inter = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export type Props = {
  children: React.ReactNode;
};

const MainLayout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  // useEffect(() => {
  //   router.replace('/login');
  // }, []);
  return (
    <div>
      <Head>
        <title>Rudraksha - Dashboard</title>
      </Head>
      <section>{children}</section>
    </div>
  );
};

export default MainLayout;
