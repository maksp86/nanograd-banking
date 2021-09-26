import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useContext, useEffect, useState } from "react";
import { RequestContext } from "../context/RequestContext";
import { AuthContext } from "../context/AuthContext";

import Moment from 'react-moment';
import 'moment/locale/ru'

import { paymentTypes, paymentStates } from "../helpers/funcs";
import { ModalContext } from "../context/ModalContext";
import ErrorModal from "../components/ErrorModal";
import Spinner from "react-bootstrap/esm/Spinner";
import { CaretLeftFill, ClockFill, CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import { generatePath } from 'react-router-dom'
import { useTitle } from "../hooks/title.hook";
import DialogModal from "../components/DialogModal";
import { NotShowFor } from '../components/ShowFor'

export default function HistoryDetailPage(props) {
    const [currTransaction, setCurrTransaction] = useState(null);
    const [currTransactionUsers, setCurrTransactionUsers] = useState({ sender: null, target: null });

    const http = useContext(RequestContext)
    const auth = useContext(AuthContext)
    const modal = useContext(ModalContext)
    const title = useTitle()

    async function undoTransaction(id) {
        try {
            const data = await http.request('/api/pay/undotransact', 'POST', { token: auth.token, id });
            if (data) {
                modal.show(
                    <ErrorModal
                        context={modal}
                        error={{ message: data.message }}
                        onClose={
                            () => {
                                modal.close();
                                currTransaction.state = -1;
                                setCurrTransaction(currTransaction);
                            }
                        }
                    />
                )
            }
        }
        catch (e) {

        }
    }

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

        title.set("Детали транзакции")
        func()
    }, [])

    useEffect(() => {
        if (http.error) {
            let action;
            switch (http.error.errcod) {
                case "valid-err":
                    http.error.message = "Ошибка загрузки транзакции";

                case "valid-err":
                case "req-sender-user-not-exist":
                case "no-permission":
                    action = () => { props.history.goBack(); modal.close(); }
                    break;
            }
            modal.show(<ErrorModal context={modal} error={http.error} onClose={action || (() => { modal.close(); })} />, false)
            http.clearError()
        }
    }, [http.error])

    if (currTransaction && auth.currUser && currTransactionUsers.sender && currTransactionUsers.target) {
        let icon;
        switch (currTransaction.state) {
            case -1:
                icon = <XCircleFill size={30} opacity={0.7} color="#F08282" />
                break;
            case 0:
                icon = <ClockFill size={30} opacity={0.7} color="#2d3142" />
                break;
            case 1:
                icon = <CheckCircleFill size={30} opacity={0.7} color="#00AF54" />
                break;
        }

        return (
            <>
                <div className="m-3">
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
                            <h3 className="m-0" style={{ lineHeight: "40px" }}><span className="unselectable">транзакция №</span>{currTransaction._id.slice(-6)}</h3>
                        </Col>
                        <Col xs="auto" className="p-0">
                            {icon}
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
                                <span className="unselectable">Статус: </span>
                                <span className="font-regular">{paymentStates[currTransaction.state].toLowerCase()}</span></h5>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col>
                            <h5 className={"font-normal" + (currTransaction.state == -1 ? " text-decoration-line-through" : "")}>
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
                                <a href={generatePath("/users/id:userid", { userid: currTransactionUsers.sender.userid })} className="font-regular">
                                    {currTransaction.sender === auth.currUser.userid ? "вы" : currTransactionUsers.sender.name + " " + currTransactionUsers.sender.surname || "" + " " + currTransactionUsers.sender.patronymic || "" + " (" + currTransactionUsers.sender.userid + ")"}
                                </a></h5>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col>
                            <h5 className="font-normal">
                                <span className="unselectable">Получатель: </span>
                                <a href={generatePath("/users/id:userid", { userid: currTransactionUsers.target.userid })} className="font-regular">
                                    {currTransaction.target === auth.currUser.userid ? "вы" : currTransactionUsers.target.name + " " + currTransactionUsers.target.surname || "" + " " + currTransactionUsers.target.patronymic || "" + " (" + currTransactionUsers.target.userid + ")"}
                                </a></h5>
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

                    {currTransaction.state != -1 &&
                        < NotShowFor user={auth.currUser} level={1}>
                            <Row>
                                <Col>
                                    <Row className="justify-content-center">
                                        <Col md={{ span: 3 }}>
                                            <Button
                                                size='lg'
                                                variant="danger"
                                                className="btn-block mt-4"
                                                onClick={() => {
                                                    modal.show(<DialogModal
                                                        message={"Отменить транзакцию " + currTransaction._id.slice(-6) + "?"}
                                                        buttons={[
                                                            { text: "Нет", primary: false, action: () => { modal.close() } },
                                                            { text: "Да", primary: true, action: () => { undoTransaction(currTransaction._id); modal.close() } }
                                                        ]}
                                                    />)
                                                }}
                                            >отменить</Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </NotShowFor>}
                </div>
            </>
        )
    }
    else
        return <>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Spinner style={{ height: "70px", width: "70px", margin: "auto 0" }} animation="border" />
                </Col>
            </Row></>
}