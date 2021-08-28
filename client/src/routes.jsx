import React from "react"
import { Switch, Route } from 'react-router-dom'

import { AuthPage } from "./pages/AuthPage"

import './static/css/CabinetPage.css'

import LoginedContainer from "./components/LoginedContainer"

export function UseRoutes(props) {
    return (
        <>
            {
                props.isAuth ? (
                    <LoginedContainer />
                ) : (
                    <Switch>
                        <Route>
                            <AuthPage />
                        </Route>
                    </Switch >)
            }
        </>
    )
}