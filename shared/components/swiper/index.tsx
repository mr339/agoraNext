// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// import required modules
import React from 'react';
import { Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Records from './swiper.mock';
import style from './swiper.module.scss';

const SwiperComponent: React.FC<{ records: Records[] }> = ({ records }) => {
  // console.log(datas);
  return (
    <>
      <Swiper
        className=" d-flex align-items-center flex-column pb-50 text-center "
        slidesPerView={1}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
          992: {
            slidesPerView: 4,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 50,
          },
        }}
        modules={[Navigation, Pagination]}
      >
        {records.map((data: Records) => (
          <div key={data.id}>
            <SwiperSlide
              className={`${style.swiper_slide} border shadow-sm border-opacity-10 p-2`}
            >
              <figure
                className={`${style.width_maxContent} rounded-circle overflow-hidden mx-auto`}
              >
                <img src={data.avatar} alt="avatar" width="128px" />
              </figure>
              <h5>
                {data.first_name} {data.last_name}{' '}
              </h5>
              <p className="text-break fs-sm">{data.email}</p>
            </SwiperSlide>
          </div>
        ))}
      </Swiper>
    </>
  );
};
export default SwiperComponent;
