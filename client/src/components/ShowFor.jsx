import React from "react";

function ShowFor(props) {
    if (props.user)
        if (parseInt(props.level) == props.user.accesslevel || (Array.isArray(props.level) && props.level.includes(props.user.accesslevel)))
            return props.children
    return <></>
}

function NotShowFor(props) {
    if (props.user)
        if (parseInt(props.level) == props.user.accesslevel || (Array.isArray(props.level) && props.level.includes(props.user.accesslevel)))
            return <></>
    return props.children
}

export {ShowFor, NotShowFor}