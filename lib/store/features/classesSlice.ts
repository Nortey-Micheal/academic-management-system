import { ClassWithStudentsAndSbjects as Class } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState: Class[] = []
export const classesSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    setClasses: (_state, action: PayloadAction<Class[]>) => {
      return action.payload as Class[];
    },
    addClass: (state, action: PayloadAction<Class>) => {
      state.push(action.payload);
    },
    updateClass: (state, action: PayloadAction<Class>) => {
      const index = state.findIndex(c => c.id === action.payload.id);
      if (index !== -1) state[index] = action.payload;
    },
    clearClasses: (_state) => {
      return [];
    }
  },
});

// Export actions
export const { setClasses, addClass, updateClass, clearClasses } = classesSlice.actions;

// Export reducer
export default classesSlice.reducer;