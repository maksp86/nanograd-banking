import React from "react"
import { Switch, Route, Redirect } from 'react-router-dom'
import { CabinetPage } from "./pages/CabinetPage"
import { AuthPage } from "./pages/AuthPage"

export const useRoutes = isAuth => {
    if (isAuth) {
        return (
            <Switch>
                <Route path="/cabinet" exact>
                    <CabinetPage />
                </Route>
                <Redirect to="/cabinet" />
            </Switch>
        )
    }
    else {
        return (
            <Switch>
                <Route path="/" exact>
                    <AuthPage />
                </Route>
                <Redirect to="/" />
            </Switch>
        )
    }
}