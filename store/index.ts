import { configureStore } from '@reduxjs/toolkit';

// import usersReducer from '@store/slices/user-slice';
import consultantSlice from './slices/consultant-slice';
import consultationDetailsSlice from './slices/consultation-details-slice';
import usersTableSlice from './slices/user-table-slice';



export const store = configureStore({
    reducer: {
        userTable: usersTableSlice,
        consultant: consultantSlice,
        consultationDetails: consultationDetailsSlice
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
