import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
	voiceDemoPlaying: boolean;
	sidebarOpen: boolean;
	activeModal: string | null;
}

const initialState: UIState = {
	voiceDemoPlaying: false,
	sidebarOpen: false,
	activeModal: null,
};

export const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		setVoiceDemoPlaying: (state, action: PayloadAction<boolean>) => {
			state.voiceDemoPlaying = action.payload;
		},
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},
		openModal: (state, action: PayloadAction<string>) => {
			state.activeModal = action.payload;
		},
		closeModal: (state) => {
			state.activeModal = null;
		},
	},
});

export const { setVoiceDemoPlaying, toggleSidebar, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
