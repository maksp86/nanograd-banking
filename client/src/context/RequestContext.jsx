import { createContext } from "react"

export const RequestContext = createContext(
    {
        loading: false,
        error: null,
        request: () => { },
        clearError: () => { }
    })