//Import module scss as styles
import { useEffect, useState } from 'react';
import { Navbar } from 'react-bootstrap';
// import ThemeToggler from '../theme-toggler';

const HeaderOne = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScroll(window.scrollY > 200);
    });
  }, []);
  //You can concatenate or just give one styles such as shown below
  return (
    <Navbar
      className={` ${
        scroll ? 'bg-navbar fixed-top shadow-sm' : ''
      }   py-lg-2  py-0 `}
      aria-label="Main navigation"
    >
      Header
    </Navbar>
  );
};

export default HeaderOne;
