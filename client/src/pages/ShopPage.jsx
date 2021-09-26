import React, { useCallback, useContext, useEffect, useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import ToggleButton from 'react-bootstrap/ToggleButton'

import '../static/css/CabinetPage.css'
import 'moment/locale/ru'

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
import LoadingButton from '../components/LoadingButton'
import { useTitle } from '../hooks/title.hook'

export default function ShopPage(props) {
    const modal = useContext(ModalContext)
    const http = useContext(RequestContext)
    const auth = useContext(AuthContext)
    const history = useHistory()
    const validation = useValidation()
    const title = useTitle()

    const [paySender, setPaySender] = useState("shop");
    const [payUserid, setPayUserid] = useState("");
    const [payAmount, setPayAmount] = useState(0);
    const [payMessage, setPayMessage] = useState("");
    const [payToken, setPayToken] = useState("");
    const [payType, setPayType] = useState(3);

    useEffect(() => {
        title.set("Касса")
    }, [])

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

    const makeTransaction = useCallback(async () => {
        try {
            const data = await http.request('/api/pay/send', "POST",
                {
                    token: auth.token,
                    sender: payType === 3 ? payUserid : paySender,
                    target: payType === 3 ? paySender : payUserid,
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

    return (
        <div className="m-3">
            <Row className="align-items-center">
                <Col>
                    <ButtonGroup>
                        <ToggleButton
                            name="payType"
                            id="opType3"
                            type="checkbox"
                            variant="outline-primary"
                            checked={payType === 3}
                            onClick={() => { setPayType(3) }}>
                            Покупка
                        </ToggleButton>
                        <ToggleButton
                            name="payType"
                            id="opType4"
                            type="checkbox"
                            variant="outline-primary"
                            checked={payType === 31}
                            onClick={() => { setPayType(31) }}>
                            Возврат
                        </ToggleButton>
                    </ButtonGroup>
                </Col>
            </Row>

            <Row className="align-items-center my-2 mt-4">
                <Col md='auto'>
                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                        {payType === 3 ? "Покупатель:" : "Получатель:"}
                    </h4>
                </Col>
                <Col>
                    <AddValidationMsg err={validation.states['target']}>
                        <IdField
                            placeholder={(payType === 3 ? "id покупателя" : "id получателя")}
                            value={payUserid}
                            validator={
                                (data) => {
                                    try {
                                        const parsed = JSON.parse(data);
                                        if (parsed && parsed.userid && parsed.paytoken) {
                                            return parsed;
                                        }
                                    }
                                    catch (e) { }
                                    return null;
                                }
                            }
                            onChange={
                                (val) => {
                                    validation.unsetState('target');
                                    if (val.userid && val.paytoken) {
                                        setPayUserid(val.userid)
                                        setPayToken(val.paytoken)
                                    }
                                    if (val == '')
                                        setPayUserid('')
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

            <Row className="justify-content-center">
                <Col md={{ span: 4 }}>
                    <LoadingButton
                        loading={http.loading}
                        size='lg'
                        variant="outline-primary"
                        className="btn-block mt-2 fs-6"
                        onClick={() => makeTransaction()}
                    >Совершить транзакцию</LoadingButton>
                </Col>
            </Row>
        </div>
    )
}