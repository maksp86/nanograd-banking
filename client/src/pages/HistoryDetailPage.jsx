import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useContext, useEffect, useState } from "react";
import { RequestContext } from "../context/RequestContext";
import { AuthContext } from "../context/AuthContext";

import Moment from 'react-moment';
import 'moment/locale/ru'

import { paymentTypes } from "../helpers/funcs";
import { ModalContext } from "../context/ModalContext";
import ErrorModal from "../components/ErrorModal";
import Spinner from "react-bootstrap/esm/Spinner";

export default function HistoryDetailPage(props) {
    const [currTransaction, setCurrTransaction] = useState(null);
    const [currTransactionUsers, setCurrTransactionUsers] = useState({ sender: null, target: null });

    const http = useContext(RequestContext)
    const auth = useContext(AuthContext)
    const modal = useContext(ModalContext)

    useEffect(() => {
        async function func() {
            try {
                //modal.show(<LoadingModal />)

                const data = await http.request('/api/pay/gettransact', 'POST', { token: auth.token, id: props.match.params.id })
                console.log(data)
                if (data)
                    if (data.transaction) {

                        const sender = (data.transaction.sender === auth.currUser.userid) ? { user: auth.currUser } : await http.request('/api/user/get', 'POST', { token: auth.token, userid: data.transaction.sender });

                        const target = (data.transaction.target === auth.currUser.userid) ? { user: auth.currUser } : await http.request('/api/user/get', 'POST', { token: auth.token, userid: data.transaction.target });

                        if ((target && target.user) &&
                            (sender && sender.user)) {
                            setCurrTransactionUsers({ sender: sender.user, target: target.user })
                            setCurrTransaction(data.transaction)
                            //modal.close()
                        }
                    }
            }
            catch (e) {

            }
        }
        func()
    }, [])

    useEffect(() => {
        if (http.error) {
            modal.show(<ErrorModal context={modal} error={{ message: "Ошибка загрузки транзакции" }} onClose={() => { props.history.goBack(); modal.close() }} />)
            http.clearError()
        }
    }, [http.error])

    if (currTransaction && auth.currUser && currTransactionUsers.sender && currTransactionUsers.target)
        return (
            <>
                <div className="m-3">
                    <Row className="justify-content-center">
                        <Col>
                            <h3><span className="unselectable">Транзакция №</span>{currTransaction._id.slice(0, 6)}</h3>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col>
                            <h5 className="font-normal">
                                <span className="unselectable">Тип: </span>
                                <span className="font-regular">{paymentTypes[currTransaction.type].toLowerCase()}</span></h5>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col>
                            <h5 className="font-normal">
                                <span className="unselectable">Проведена </span>
                                <span className="font-regular">
                                    <Moment format="D MMMM в hh:mm" locale="ru" date={currTransaction.date} local />
                                </span></h5>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col>
                            <h5 className="font-normal">
                                <span className="unselectable">Отправитель: </span>
                                <span className="font-regular">
                                    {currTransaction.sender === auth.currUser.userid ? "вы" : currTransactionUsers.sender.name + " " + currTransactionUsers.sender.surname || "" + " " + currTransactionUsers.sender.patronymic || "" + " (" + currTransactionUsers.sender.userid + ")"}
                                </span></h5>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col>
                            <h5 className="font-normal">
                                <span className="unselectable">Получатель: </span>
                                <span className="font-regular">
                                    {currTransaction.target === auth.currUser.userid ? "вы" : currTransactionUsers.target.name + " " + currTransactionUsers.target.surname || "" + " " + currTransactionUsers.target.patronymic || "" + " (" + currTransactionUsers.target.userid + ")"}
                                </span></h5>
                        </Col>
                    </Row>

                    {currTransaction.message && (<Row className="justify-content-center">
                        <Col>
                            <h5 className="font-normal text-break">
                                <span className="unselectable">Сообщение: </span>
                                <span className="font-regular">
                                    {currTransaction.message}
                                </span>
                            </h5>
                        </Col>
                    </Row>)}

                    <Row>
                        <Col>
                            <Row className="justify-content-center">
                                <Col md={{ span: 3 }}>
                                    <Button
                                        size='lg'
                                        variant="outline-primary"
                                        className="btn-block mt-4"
                                        onClick={() => { props.history.goBack() }}
                                    >назад</Button>
                                </Col>
                            </Row>
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