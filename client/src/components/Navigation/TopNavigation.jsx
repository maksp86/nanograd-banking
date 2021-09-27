import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import nanogradLogo from '../../static/imgs/logo-white-yellow.svg'
import Image from 'react-bootstrap/Image'

import { useHistory, useRouteMatch } from 'react-router'
import { Person } from 'react-bootstrap-icons'
import { ShowFor } from '../ShowFor';


export default function TopNavigation(props) {
    const history = useHistory();
    const currUser = props.currUser;

    function navigateTo(path) {
        history.push(path)
    }

    function NavButton(props) {
        const active = useRouteMatch({
            path: props.compatiblePath || props.path,
            exact: props.exact
        })

        return (
            <Button
                variant="dark"
                className={(active ? "button-active" : "") + " " + (props.className ? props.className : "")}
                onClick={() => navigateTo(props.path)}
            >
                <div className="selector-holder">
                    <h5 className="font-medium">{props.text}</h5>
                </div>
            </Button>
        )
    }
    return (
        <Navbar
            bg="dark"
            variant="dark"
            fixed="top"
            className="p-0"
            style={{ borderRadius: "0px 0px 30px 30px", height: "80px", overflowX: "auto", overflowY: "hidden" }}>
            <ButtonGroup className="selectors-top">
                <Button
                    className="inactive big"
                    variant="dark"
                    onClick={() => navigateTo('/')}
                >
                    <Image src={nanogradLogo} style={{ maxHeight: "50px", maxWidth: "180px" }} />
                </Button>

                <NavButton path="/" exact={true} text="Главная">
                </NavButton>

                <NavButton path="/history" compatiblePath={["/history", "/history/:payid"]} text="История">
                </NavButton>

                <NavButton path="/pay" text="Оплата">
                </NavButton>

                <ShowFor user={currUser} level={[2, 10]}>
                    <NavButton path="/shop" text="Касса">
                    </NavButton>
                </ShowFor>

                <ShowFor user={currUser} level={[3, 10]}>
                    <NavButton path="/payments" text="Выплаты">
                    </NavButton>
                </ShowFor>

                <ShowFor user={currUser} level={[4, 10]}>
                    <NavButton className="big" path="/users" text="Пользователи">
                    </NavButton>
                </ShowFor>

                <Button
                    variant="dark"
                    className={"big" +
                        (useRouteMatch({
                            path: "/account"
                        }) ? " button-active" : "")}
                    onClick={() => navigateTo("/account")}
                >
                    <div
                        className="selector-holder align-items-center justify-content-center"
                        style={{ flexDirection: 'row' }}
                    >
                        <Person className="m-0 mr-3" size={35} />
                        <h5 className="font-medium">{currUser && currUser.name}</h5>
                    </div>
                </Button>
            </ButtonGroup>
        </Navbar>
    )
}