import { createContext } from "react"

export const AuthContext = createContext(
    {
        token: null,
        userid: null,
        lastid: null,
        login: () => { },
        logout: (full) => { },
        isLogined: false,
        currUser: null,
        setCurrUser: () => { }
    })