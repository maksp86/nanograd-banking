import { useCallback, useState, useEffect } from "react"

const storageName = 'user'
const useridName = 'lastid'

export const useAuth = () => {
    const [token, setToken] = useState(null)
    const [userid, setUserid] = useState(null)
    const [lastid, setLastid] = useState(null)

    const [currUser, setCurrUser] = useState({})

    const login = useCallback((jwtToken, id) => {
        setToken(jwtToken)
        setUserid(id)
        setLastid(id)
        localStorage.setItem(useridName, id)
        localStorage.setItem(storageName, JSON.stringify({ userid: id, token: jwtToken }))
    }, [])

    const logout = useCallback((full) => {
        setToken(null)
        setUserid(null)
        localStorage.removeItem(storageName)

        if (full) {
            localStorage.removeItem(useridName)
            setLastid(null)
        }
    }, [])

    const load = useCallback(() => {
        setLastid(localStorage.getItem(useridName))

        try {
            const data = JSON.parse(localStorage.getItem(storageName))

            if (data && data.token) {
                login(data.token, data.userid)
            }
        }
        catch (e) {
            localStorage.removeItem(storageName)
        }
    }, [])

    useEffect(() => {
        load()
    }, [login])

    return { load, login, logout, token, userid, lastid, currUser, setCurrUser }
}