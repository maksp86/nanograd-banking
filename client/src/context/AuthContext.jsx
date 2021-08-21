import { createContext } from "react"

export const AuthContext = createContext(
    {
        token: null,
        userid: null,
        login: () => { },
        logout: () => { },
        isLogined: false
    })