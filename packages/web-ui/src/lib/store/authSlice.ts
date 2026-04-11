import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	userId: string | null;
	email: string | null;
	plan: "FREE" | "PRO" | "BUSINESS";
	isHydrated: boolean;
}

const initialState: AuthState = {
	userId: null,
	email: null,
	plan: "FREE",
	isHydrated: false,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<{ userId: string; email: string; plan: AuthState["plan"] }>) => {
			state.userId = action.payload.userId;
			state.email = action.payload.email;
			state.plan = action.payload.plan;
			state.isHydrated = true;
		},
		clearUser: (state) => {
			state.userId = null;
			state.email = null;
			state.plan = "FREE";
		},
	},
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
