import { CaseType } from "@/lib/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: CaseType[] = [];

const caseSlice = createSlice({
  name: "case",
  initialState,
  reducers: {
    setCase: (_state, action: PayloadAction<CaseType[]>) => {
      return action.payload;
    },

    clearCase: () => {
      return [];
    },

    addCase: (state, action: PayloadAction<CaseType>) => {
      state.push(action.payload); // cleaner, uses Immer
    },
  },
});

export const { addCase, setCase, clearCase } = caseSlice.actions;
export default caseSlice.reducer;
