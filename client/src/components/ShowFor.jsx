import React from "react";

function ShowFor({ user, level, children }) {
    if (user)
        if (parseInt(level) == user.accesslevel || (Array.isArray(level) && level.includes(user.accesslevel)))
            return children
    return <></>
}

function NotShowFor({ user, level, children }) {
    if (user)
        if (parseInt(level) == user.accesslevel || (Array.isArray(level) && level.includes(user.accesslevel)))
            return <></>
    return children
}

export { ShowFor, NotShowFor }