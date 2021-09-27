import React, { useContext, useEffect } from "react"

import Container from 'react-bootstrap/Container'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'

import { BrowserView, MobileView, isDesktop } from "react-device-detect";
import Fade from 'react-reveal/Fade'


import BottomNavigation from "./Navigation/BottomNavigation"

import '../static/css/CabinetPage.css'

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
import TopNavigation from "./Navigation/TopNavigation";
import DialogModal from "./DialogModal";

export default function LoginedContainer(props) {
    document.body.style.backgroundColor = "white";
    document.body.style.color = "#2D3142";

    const httpHook = useContext(RequestContext)
    const modal = useContext(ModalContext)
    const auth = useContext(AuthContext)

    const loadUser = async () => {
        const data = await httpHook.request('/api/user/get', 'POST', { token: auth.token, userid: auth.userid });

        if (data && data.user) {
            data.user.accesslevelText = accesslevelNames[data.user.accesslevel]
            auth.setCurrUser(data.user)
        }
    }

    useEffect(() => {
        if (httpHook.error && !navigator.onLine) {
            modal.show(<DialogModal
                message="Отсутствует интернет"
                buttons={[
                    {
                        text: "Обновить",
                        primary: true,
                        action: () => { window.location.reload() }
                    }
                ]} />, false)
            httpHook.clearError()
        }

        if (httpHook.error && httpHook.error.errcod === "token-expired") {
            httpHook.clearError()
            auth.logout()
        }
    }, [httpHook.error])

    useEffect(() => {
        if (auth.token && auth.userid)
            loadUser()
    }, [auth.token, auth.userid])

    let location = useLocation();

    return (
        <div>
            <BrowserView> <TopNavigation currUser={auth.currUser} /> </BrowserView>

            <div
                className="vertical-center px-4"
                style={
                    {
                        paddingBottom: !isDesktop && "calc(80px + 1.5rem)",
                        paddingTop: isDesktop ? "calc(80px + 1.5rem)" : "1.5rem!important"
                    }
                }>
                <Container fluid="sm" className="p-3" style={{ borderRadius: '35px', boxShadow: "0px 0px 16px 16px rgb(45 49 66 / 3%)" }}>
                    <div className="px-3 py-3">
                        <Fade
                            duration={200}
                            spy={location.key}
                            appear={true}
                        >
                            <Switch location={location}>
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
                        </Fade>
                    </div>
                </Container>
            </div>

            <MobileView><BottomNavigation currUser={auth.currUser} /></MobileView>
        </div>
    )
}