import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearAuthFromStorage, getToken } from '@shared/utils/cookies-utils/cookies.util';
import axios from 'axios';
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
export const getUserTableData = createAsyncThunk(
  'usersTable',
  async ({ startDate, endDate, currentPage }: any) => {
    let apiUrl = `${publicRuntimeConfig.baseURL}/consultant/consultations?page=${currentPage}`;
    if (startDate !== null) {
      apiUrl += `&from=${startDate}`;
    }
    if (endDate !== null) {
      apiUrl += `&to=${endDate}`;
    }
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (response.status === 200) {
      return response.data;
    } else if (response.status === 401) { //unauthenticated
      clearAuthFromStorage();
    } else {
      console.log(response.status)
    }
  }
);
