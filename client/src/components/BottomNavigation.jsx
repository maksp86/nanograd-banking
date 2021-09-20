import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'

import { useHistory, useRouteMatch } from 'react-router'
import { HouseDoor, ClockHistory, Wallet2, Person, Cash, Bank, People } from 'react-bootstrap-icons'
import { ShowFor } from './ShowFor';


export default function BottomNavigation(props) {
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
                className={active && "button-active" + " " + props.className}
                onClick={() => navigateTo(props.path)}
            >
                <div className="selector-holder">
                    {props.children}
                </div>
            </Button>
        )
    }
    return (
        <Navbar
            bg="dark"
            variant="dark"
            fixed="bottom"
            className="p-0"
            style={{ borderRadius: "35px 35px 0px 0px", height: "60px", overflowX: "auto", overflowY: "hidden" }}>

            <ButtonGroup className="selectors">
                <NavButton path="/" exact={true} text="Главная">
                    <HouseDoor size={30} />
                </NavButton>

                <NavButton path="/history" compatiblePath={["/history", "/history/:payid"]} text="История">
                    <ClockHistory size={30} />
                </NavButton>

                <NavButton path="/pay" text="Оплата">
                    <Wallet2 size={30} />
                </NavButton>

                <ShowFor user={currUser} level={[2, 10]}>
                    <NavButton path="/shop" text="Касса">
                        <Cash size={30} />
                    </NavButton>
                </ShowFor>

                <ShowFor user={currUser} level={[3, 10]}>
                    <NavButton path="/payments" text="Выплаты">
                        <Bank size={30} />
                    </NavButton>
                </ShowFor>

                <ShowFor user={currUser} level={[4, 10]}>
                    <NavButton path="/users" text="Пользователи">
                        <People size={30} />
                    </NavButton>
                </ShowFor>

                <NavButton path="/account" text="Аккаунт">
                    <Person size={30} />
                </NavButton>
            </ButtonGroup>
        </Navbar >
    )
}