import { createContext } from "react"

export const ModalContext = createContext(
    {
        isOpen: false,
        setOpen: () => { },
        setClosable: () => { },
        setContent: () => { },
        show: (content, closable = true) => { },
        close: () => { }
    })