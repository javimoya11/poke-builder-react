import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { IGlobalStore, IUser } from './types.store'

export const useGlobalStore = create(subscribeWithSelector<IGlobalStore>((set) => ({
    user: null,
    setUser: (user: IUser | null) => set({ user })
})));