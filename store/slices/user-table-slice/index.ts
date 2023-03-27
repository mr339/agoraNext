import { createSlice } from '@reduxjs/toolkit';
import { getUserTableData } from '@store/actions/user-table-actions';

interface IPaginationProps {
  count: number;
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  link: any;
}

interface UsersData {
  results: TableUsers[];
  pagination: IPaginationProps;
}
interface TableUsers {
  id: number;
  name: string;
  sessionList: string;
  date: string;
  duration: string;
}

interface ICourtInterface {
  Users: UsersData;
  isLoading: boolean;
}


const initialState: ICourtInterface = {
  Users: {
    results: [],
    pagination: {
      current_page: 1,
      // next: 0,
      per_page: 20,
      total_pages: 0,
      total: 0,
      count: 0,
      link: {},
    },
  },
  isLoading: true,
};

const userTableSlice = createSlice({
  name: 'User Slice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserTableData.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(getUserTableData.fulfilled, (state, action) => {
      state.Users.results = action.payload.data;
      state.Users.pagination = action.payload.meta.pagination;
      state.isLoading = false;
    });
    builder.addCase(getUserTableData.rejected, (state, action) => {
      state.Users.results = [];
      state.isLoading = false;
    });
  },
});
// export const { changePageUserTable } = userTableSlice.actions;

export default userTableSlice.reducer;
