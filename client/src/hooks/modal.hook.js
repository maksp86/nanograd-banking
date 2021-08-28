import { useState } from "react"


export const useModal = () => {
    const [isOpen, setOpen] = useState(false)
    const [isClosable, setClosable] = useState(true)
    const [content, setContent] = useState(null)

    return {
        isOpen, setOpen, isClosable, setClosable, content, setContent,
        show: (content, closable = true) => {
            setContent(content); setClosable(closable); setOpen(true);
        },
        close: () => { setOpen(false); }
    }
}