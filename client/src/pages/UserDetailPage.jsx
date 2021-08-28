import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useContext, useEffect, useState } from "react";
import { RequestContext } from "../context/RequestContext";
import { AuthContext } from "../context/AuthContext";

import 'moment/locale/ru'

import { accesslevelNames } from "../helpers/funcs";
import { ModalContext } from "../context/ModalContext";
import ErrorModal from "../components/ErrorModal";
import Spinner from "react-bootstrap/esm/Spinner";
import { CaretLeftFill } from "react-bootstrap-icons";

export default function UserDetailPage(props) {
    const [user, setUser] = useState(null);

    const http = useContext(RequestContext)
    const auth = useContext(AuthContext)
    const modal = useContext(ModalContext)

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
    }, [])

    useEffect(() => {
        if (http.error) {
            modal.show(<ErrorModal context={modal} error={{ message: "Ошибка загрузки пользователя" }} onClose={() => { props.history.goBack(); modal.close(); }} />)
            http.clearError()
        }
    }, [http.error])

    if (user)
        return (
            <>
                <div className="px-3">
                    <Row className="justify-content-start align-items-center mb-4">
                        <Col xs="auto" className="p-0">
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
                            <h3 className="m-0" style={{ lineHeight: "40px" }}><span className="unselectable">Пользователь </span>{user.userid}</h3>
                        </Col>
                    </Row>

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