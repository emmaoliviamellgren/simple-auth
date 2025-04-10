import { fetchUserData } from "@/app/lib/auth.db";
import { User } from "@/app/types/User";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: User = {
	uid: "",
	name: "",
	email: "",
	role: "",
};

export const fetchUser = createAsyncThunk(
	"user/fetchUser",
	async (userId: string) => {
		const user = await fetchUserData(userId);
		return user as User;
	}
);

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User>) => {
			state.uid = action.payload.uid;
			state.name = action.payload.name;
			state.email = action.payload.email;
			state.role = action.payload.role;
		},
		resetUser: (state) => {
			state.uid = "";
			state.name = "";
			state.email = "";
			state.role = "";
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUser.pending, () => {
				console.log("Fetching user data...");
			})
			.addCase(
				fetchUser.fulfilled,
				(state, action: PayloadAction<User>) => {
					state.uid = action.payload.uid;
					state.name = action.payload.name;
					state.email = action.payload.email;
					state.role = action.payload.role;
				}
			);
	},
});

export const { setUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
