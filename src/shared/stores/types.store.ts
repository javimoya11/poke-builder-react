export interface IGlobalStore {
    user?: IUser | null
    setUser: (user: IUser | null) => void
}

export interface IUser {
    id: number
    name: string
}