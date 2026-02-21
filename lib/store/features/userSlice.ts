import { FullUserType } from '@/lib/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


const initialState: FullUserType = {} as FullUserType

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (_state: FullUserType | null, action: PayloadAction<FullUserType>) => {
      return action.payload as FullUserType
    },
    clearUser: () => {
      return {} as FullUserType
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
