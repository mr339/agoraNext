import { createSlice } from '@reduxjs/toolkit';
import { getConsultantDetailsData } from '@store/actions/consultation-details-actions';

interface consultantDetailsInterface {
    birth_time: string;
    city: string;
    consult_date: string;
    consult_end: string;
    consult_start: string;
    consultation_amount: string;
    country: string;
    customer_id: string;
    dob: string;
    duration: number;
    email: string;
    id: string;
    is_individual: boolean;
    members: any;
    name: string;
    recent_time: string;
    relationship: string;
    remaining_time: string;
    status: string;
    zodiac: any;
}

interface State {
    ConsultantDetails: consultantDetailsInterface[];
    isLoading: boolean;
}

const initialState: State = {
    ConsultantDetails: [],
    isLoading: true,
};

const consultationDetailsSlice = createSlice({
    name: 'consultation details slice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getConsultantDetailsData.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(getConsultantDetailsData.fulfilled, (state, action) => {
            state.ConsultantDetails = action.payload.data;
            state.isLoading = false;
        });
        builder.addCase(getConsultantDetailsData.rejected, (state, action) => {
            state.ConsultantDetails = [];
            state.isLoading = false;
        });
    },
});

export default consultationDetailsSlice.reducer;
