import { User } from '@/lib/generated/prisma/client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'


const initialState: User = {} as User

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (_state: User | null, action: PayloadAction<User>) => {
      return action.payload as User
    },
    clearUser: () => {
      return {} as User
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
