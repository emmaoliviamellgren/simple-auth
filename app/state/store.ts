import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./users/userSlice";

const authReducer = combineReducers({
	user: userReducer,
});

export const store = configureStore({
	reducer: {
		auth: authReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
