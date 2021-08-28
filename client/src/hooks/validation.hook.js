import { useCallback, useState } from "react"

const defaultValue = { value: false, message: null }

export const useValidation = () => {
    const [states, setStates] = useState([])

    const importStates = useCallback((errors) => {
        if (errors) {
            errors.forEach(element => {
                if (!states[element.param]) {
                    states[element.param] = Object.assign({}, defaultValue)
                }
                states[element.param].value = true;
                states[element.param].message = element.msg;

            })
            setStates(states)
        }
    }, [states])

    const unsetState = useCallback((name) => {
        if (states[name]) {
            states[name].value = false
            setStates(states)
        }
    }, [states])

    const unsetAll = useCallback(() => {
        setStates([])
    }, [states])

    return { states, importStates, unsetState, unsetAll }
}