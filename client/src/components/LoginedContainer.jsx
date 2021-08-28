import React, { useContext, useEffect } from "react"

import Container from 'react-bootstrap/Container'
import Modal from 'react-bootstrap/Modal'

import { Switch, Route, Redirect } from 'react-router-dom'

import Navigation from "./Navigation"

import '../static/css/CabinetPage.css'

import { useHttp } from "../hooks/http.hook"
import { useModal } from "../hooks/modal.hook"

import { ModalContext } from '../context/ModalContext'
import { RequestContext } from "../context/RequestContext"
import { AuthContext } from "../context/AuthContext"

import { accesslevelNames } from '../helpers/funcs'

import HomePage from "../pages/HomePage"
import UsersPage from "../pages/UsersPage"
import AccountPage from "../pages/AccountPage"
import HistoryPage from "../pages/HistoryPage"
import HistoryDetailPage from "../pages/HistoryDetailPage"
import AddUser from "../pages/AddUser"
import UserDetailPage from "../pages/UserDetailPage"
import PayPage from "../pages/PayPage"
import PaymentsPage from "../pages/PaymentsPage"
import ShopPage from "../pages/ShopPage"

export default function LoginedContainer(props) {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "#2D3142";

    const httpHook = useHttp()
    const modal = useModal()

    const auth = useContext(AuthContext)
    const appModal = useContext(ModalContext)

    const loadUser = async () => {
        const data = await httpHook.request('/api/user/get', 'POST', { token: auth.token, userid: auth.userid });

        if (data && data.user) {
            data.user.accesslevelText = accesslevelNames[data.user.accesslevel]
            auth.setCurrUser(data.user)
        }
    }

    useEffect(() => {
        if (httpHook.error && httpHook.error.errcod === "token-expired") {
            httpHook.clearError()
            auth.logout("")
        }
    }, [appModal.isOpen, httpHook.error])

    useEffect(() => {
        if (auth.token && auth.userid)
            loadUser()
    }, [auth.token, auth.userid])

    return (
        <RequestContext.Provider value={httpHook}>
            <ModalContext.Provider value={modal}>
                <div>
                    <div className="vertical-center px-4 pt-4" style={{ paddingBottom: "calc(80px + 1.5rem)" }}>
                        <Container fluid="sm" className="p-3" style={{ borderRadius: '35px', boxShadow: "0px 0px 16px 16px rgb(45 49 66 / 3%)" }}>
                            <div className="px-3 py-3">
                                <Switch>
                                    <Route path="/" exact component={HomePage} />

                                    <Route path="/history" exact component={HistoryPage} />

                                    <Route exact path="/history/:id" component={HistoryDetailPage} />

                                    <Route path="/pay" component={PayPage} />

                                    <Route path="/account" component={AccountPage} />

                                    <Route path="/shop" component={ShopPage} />

                                    <Route path="/payments" component={PaymentsPage} />

                                    <Route path="/users" exact component={UsersPage} />

                                    <Route path="/users/add" exact component={AddUser} />

                                    <Route exact path="/users/id:userid" component={UserDetailPage} />

                                    <Route>
                                        <Redirect to="/" />
                                    </Route>
                                </Switch>
                            </div>
                        </Container>
                    </div>


                    <Navigation currUser={auth.currUser} />
                </div>

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