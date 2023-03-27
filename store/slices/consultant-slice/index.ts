import { createSlice } from '@reduxjs/toolkit';
import { getConsultantData } from '@store/actions/consultant-actions';

interface consultantInterface {
    address: string;
    city: string;
    email: string;
    contact: string;
    id: string;
    image: string;
    name: string;
    state: string;
}

interface State {
    Consultant: consultantInterface[];
    isLoading: boolean;
}

const initialState: State = {
    Consultant: [],
    isLoading: true,
};

const consultantSlice = createSlice({
    name: 'consultant slice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getConsultantData.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(getConsultantData.fulfilled, (state, action) => {
            state.Consultant = action.payload.data;
            state.isLoading = false;
        });
        builder.addCase(getConsultantData.rejected, (state, action) => {
            state.Consultant = [];
            state.isLoading = false;
        });
    },
});

export default consultantSlice.reducer;
