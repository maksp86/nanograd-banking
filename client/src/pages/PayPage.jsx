import React, { useCallback, useContext, useEffect, useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import '../static/css/CabinetPage.css'
import 'moment/locale/ru'

import QrModal from '../components/QrModal'
import ErrorModal from '../components/ErrorModal'
import IdField from '../components/IdField'
import AddValidationMsg from '../components/AddValidationMsg'

import { AuthContext } from '../context/AuthContext'
import { useValidation } from '../hooks/validation.hook'
import { ModalContext } from '../context/ModalContext'
import { RequestContext } from '../context/RequestContext'
import { generatePath, useHistory } from 'react-router-dom'
import ClearableInput from '../components/ClearableInput'
import DialogModal from '../components/DialogModal'

export default function PayPage(props) {
    const modal = useContext(ModalContext)
    const http = useContext(RequestContext)
    const auth = useContext(AuthContext)
    const history = useHistory()
    const validation = useValidation()

    useEffect(() => {
        if (http.error) {
            console.log(http.error);
            if (http.error.errors)
                validation.importStates(http.error.errors)
            else {
                modal.show(<ErrorModal context={modal} error={{ message: http.error.message || "Ошибка" }} />)
            }
            http.clearError()
        }
    }, [http.error])

    const loadPaymentToken = useCallback(async () => {
        try {
            const data = await http.request('/api/pay/gentoken', "POST", { token: auth.token })

            if (data && data.paymentToken) {
                modal.show(<QrModal context={modal} data={{ userid: auth.userid, paytoken: data.paymentToken._id }} />)
            }
        }
        catch (e) {

        }
    })

    const makeTransaction = useCallback(async () => {
        try {
            const data = await http.request('/api/pay/send', "POST",
                {
                    token: auth.token,
                    sender: paySender,
                    target: payUserid,
                    amount: payAmount,
                    type: payType,
                    message: payMessage,
                    paymentToken: payToken
                })
            console.log("DATA", data)

            if (data) {
                modal.show(<DialogModal
                    message={data.message}
                    buttons={[
                        {
                            text: "подробности", primary: false, action: () => {
                                history.push(generatePath("/history/:id", { id: data.transaction._id }))
                                modal.close()
                            }
                        },
                        { text: "закрыть", primary: true, action: () => { modal.close() } }
                    ]}
                />)
                validation.unsetAll()
                setPayUserid("")
                setPayAmount(0)
                setPayMessage("")
                setPayToken("")
            }
        }
        catch (e) {
        }
    });

    const [paySender, setPaySender] = useState("");
    const [payUserid, setPayUserid] = useState("");
    const [payAmount, setPayAmount] = useState(0);
    const [payMessage, setPayMessage] = useState("");
    const [payToken, setPayToken] = useState("");
    const [payType, setPayType] = useState(1);

    return (
        <div className="m-3">
            <Row className="align-items-center justify-content-center">
                <Col xs={12} md={6}>
                    <Button
                        size='lg'
                        variant="primary"
                        className="btn-block fs-6"
                        onClick={loadPaymentToken}
                    >Получить QR-код для оплаты</Button>
                </Col>
            </Row>

            <Row className="align-items-center my-2 mt-4">
                <Col md='auto'>
                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                        Перевод:
                    </h4>
                </Col>
                <Col>
                    <AddValidationMsg err={validation.states['target']}>
                        <IdField value={payUserid} onChange={
                            (val) => {
                                validation.unsetState('target');
                                setPayUserid((typeof val === "string") ? val : val.userid)
                            }} />
                    </AddValidationMsg>
                </Col>
            </Row>

            <Row className="align-items-center my-2">
                <Col md='auto'>
                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                        Сумма:
                    </h4>
                </Col>
                <Col>
                    <AddValidationMsg err={validation.states['amount']}>
                        <ClearableInput
                            value={payAmount}
                            placeholder="сумма"
                            type="number"
                            onChange={
                                (e) => {
                                    validation.unsetState('amount');
                                    setPayAmount(e)
                                }
                            } />
                    </AddValidationMsg>
                </Col>
            </Row>

            <Row className="align-items-center my-2">
                <Col md='auto'>
                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                        Сообщение:
                    </h4>
                </Col>
                <Col>
                    <ClearableInput
                        value={payMessage}
                        placeholder="сообщение"
                        onChange={(e) => { setPayMessage(e) }}
                    />
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col md={{ span: 4 }}>
                    <Button
                        size='lg'
                        variant="outline-primary"
                        className="btn-block mt-2 fs-6"
                        onClick={() => { setPaySender(auth.userid); makeTransaction(); }}
                    >Перевести</Button></Col>
            </Row>
        </div >
    )
}