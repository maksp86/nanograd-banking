import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import domtoimage from 'dom-to-image'
import React, { useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom'
import { RequestContext } from "../context/RequestContext";
import { AuthContext } from "../context/AuthContext";
import DialogModal from '../components/DialogModal'
import PasswordChangeModal from '../components/PasswordChangeModal'
import { ShowFor } from '../components/ShowFor';
import UserCard from '../components/UserCard'

import 'moment/locale/ru'

import { accesslevelNames } from "../helpers/funcs";
import { ModalContext } from "../context/ModalContext";
import ErrorModal from "../components/ErrorModal";
import Spinner from "react-bootstrap/esm/Spinner";
import { CaretLeftFill, Download } from "react-bootstrap-icons";
import GetQR from "../components/GetQR";
import { useTitle } from "../hooks/title.hook";

export default function UserDetailPage(props) {
    const [user, setUser] = useState(null);

    const http = useContext(RequestContext)
    const auth = useContext(AuthContext)
    const modal = useContext(ModalContext)
    const title = useTitle()

    useEffect(() => {
        async function func() {
            try {
                const data = await http.request('/api/user/get', 'POST', { token: auth.token, userid: props.match.params.userid })
                console.log(data)
                if (data)
                    if (data.user) {
                        setUser(data.user)
                    }
            }
            catch (e) {

            }
        }
        func()
        title.set("Пользователь " + props.match.params.userid)
    }, [])

    useEffect(() => {
        if (http.error) {
            let action;
            switch (http.error.errcod) {
                case "req-user-not-exist":
                case "valid-err":
                    http.error.message = "Ошибка загрузки пользователя";
                    action = () => { props.history.goBack(); modal.close(); }
                    break;
            }
            modal.show(<ErrorModal context={modal} error={http.error} onClose={action || (() => { modal.close(); })} />, false)
            http.clearError()
        }
    }, [http.error])

    async function downloadCard(user) {
        var Card = React.createElement(UserCard, {
            user,
            showlevel: true,
            qrsize: 180,
            width: "254px",
            actions: false
        });

        var portal = document.createElement('div')
        portal.style.padding = "8px"
        document.body.appendChild(portal);
        ReactDOM.render(Card, portal)

        domtoimage.toPng(portal,
            {
                bgcolor: "white",
                width: 270,
                height: 359
            }
        ).then((img) => {
            var link = document.createElement('a');
            link.download = user.userid + '-card.png';
            link.href = img;
            link.click();
            document.body.removeChild(portal)
        })

    }

    async function deleteUser(userid) {
        try {
            const data = await http.request('/api/user/delete', 'POST', { token: auth.token, userid });
            if (data) {
                modal.show(
                    <ErrorModal
                        context={modal}
                        error={{ message: data.message }}
                        onClose={
                            () => {
                                modal.close();
                                props.history.goBack();
                            }
                        }
                    />
                )
            }
        }
        catch (e) {

        }
    }

    if (user)
        return (
            <>
                <div className="px-3">
                    <Row className="justify-content-start align-items-center mb-4">
                        <Col xs="12" sm="auto" className="p-0">
                            <Button
                                variant="outline"
                                className="rounded-circle p-0"
                                size="lg"
                                style={{ height: "48px", width: "48px" }}
                                onClick={() => { props.history.goBack() }}>
                                <CaretLeftFill />
                            </Button>
                        </Col>
                        <Col xs="auto">
                            <h3 className="m-0" style={{ lineHeight: "40px" }}><span className="unselectable">пользователь </span>{user.userid}</h3>
                        </Col>
                    </Row>
                    <Row className="align-items-center justify-content-between my-2">
                        <Col xs={12} md={6}>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">
                                        <span className="unselectable">Фамилия: </span>
                                        <span className="font-regular">{user.surname}</span></h5>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">
                                        <span className="unselectable">Имя: </span>
                                        <span className="font-regular">{user.name}</span></h5>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">
                                        <span className="unselectable">Отчество: </span>
                                        <span className="font-regular">{user.patronymic}</span></h5>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">
                                        <span className="unselectable">Баланс: </span>
                                        <span className="font-regular">{user.balance}</span>
                                        <span className="font-regular unselectable"> нанолисиков</span></h5>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">
                                        <span className="unselectable">Тип: </span>
                                        <span className="font-regular">{accesslevelNames[user.accesslevel].toLowerCase()}</span></h5>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={12} md={6}>
                            <div className="d-flex my-2">
                                <GetQR
                                    style={{ margin: "0 auto" }}
                                    size={200}
                                    data={{ userid: user.userid }}
                                />
                            </div>
                        </Col>
                    </Row>

                    <ShowFor user={auth.currUser} level={[4, 10]}>
                        {user.accesslevel !== -1 && <Row className="justify-content-center">
                            <Col md="auto">
                                <Button
                                    size='lg'
                                    variant="outline-primary"
                                    className="rounded-circle p-1 mt-4"
                                    style={{ height: "48px", width: "48px" }}
                                    onClick={() => downloadCard(user)}>
                                    <Download />
                                </Button>
                            </Col>
                            <Col md={4}>
                                <Button
                                    size='lg'
                                    variant="outline-primary"
                                    className="btn-block mt-4"
                                    onClick={() => { modal.show(<PasswordChangeModal userid={user.userid} />) }}
                                >сменить пароль</Button>
                            </Col>
                            <Col md={4}>
                                <Button
                                    size='lg'
                                    variant="danger"
                                    className="btn-block mt-4"
                                    onClick={() => {
                                        modal.show(<DialogModal
                                            message={"Удалить пользователя " + user.userid + "?"}
                                            buttons={[
                                                { text: "Нет", primary: false, action: () => { modal.close() } },
                                                { text: "Да", primary: true, action: () => { deleteUser(user.userid); modal.close() } }
                                            ]}
                                        />)
                                    }}
                                >удалить</Button>
                            </Col>
                        </Row>}
                    </ShowFor>

                </div>
            </>
        )
    else
        return <>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Spinner style={{ height: "70px", width: "70px", margin: "auto 0" }} animation="border" />
                </Col>
            </Row></>
}