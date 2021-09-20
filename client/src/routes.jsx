import React, { useEffect } from "react"
import { Switch, Route } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal'

import './static/css/CabinetPage.css'

import AuthPage from "./pages/AuthPage"

import LoginedContainer from "./components/LoginedContainer"

import { useModal } from "./hooks/modal.hook"
import { ModalContext } from "./context/ModalContext"
import { useHttp } from "./hooks/http.hook"
import { RequestContext } from "./context/RequestContext"

function AuthCheck({ isAuth }) {
    if (isAuth)
        return <LoginedContainer />
    else
        return <AuthPage />
}

export function UseRoutes(props) {
    const modal = useModal()
    const httpHook = useHttp()

    return (
        <RequestContext.Provider value={httpHook}>
            <ModalContext.Provider value={modal}>
                
                <AuthCheck isAuth={props.isAuth} />
                <Modal
                    show={modal.isOpen}
                    onHide={() => modal.setOpen(false)}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdrop={modal.isClosable ? true : "static"}
                    keyboard={modal.isClosable}
                >
                    <Modal.Body>
                        {modal.content}
                    </Modal.Body>
                </Modal>
            </ModalContext.Provider>
        </RequestContext.Provider>
    )
}