import { useCallback, useState } from "react";

export const useTitle = () => {
    const set = useCallback((title) => {
        window.document.title = title + " - Наноград Банкинг";
    }, [])

    const setGlobal = useCallback((title) => {
        window.document.title = title;
    }, [])

    return { set, setGlobal }
}