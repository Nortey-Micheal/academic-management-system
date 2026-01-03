import { UserType } from '@/lib/type'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


const initialState: UserType = {} as UserType

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (_state: UserType | null, action: PayloadAction<UserType>) => {
      return action.payload as UserType
    },
    clearUser: () => {
      return {} as UserType
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
