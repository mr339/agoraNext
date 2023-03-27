import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearAuthFromStorage, getToken } from '@shared/utils/cookies-utils/cookies.util';
import axios from 'axios';
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const getConsultantDetailsData = createAsyncThunk(
    'consultantDetailsData',
    async (Id: any) => {
        const response = await axios.get(
            `${publicRuntimeConfig.baseURL}/consultant/consultations/${Id}`,
            {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                }
            }
        );
        if (response.status === 200) {
            return response.data;
        } else if (response.status === 401) { //unauthenticated
            clearAuthFromStorage();
        } else {
            console.log(response.status)
        }
    }
);
