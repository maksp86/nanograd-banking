import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useHistory } from 'react-router-dom'
import domtoimage from 'dom-to-image'

import { CaretLeftFill } from 'react-bootstrap-icons'
import UserCard from '../components/UserCard'
import ErrorModal from '../components/ErrorModal'
import DialogModal from '../components/DialogModal'
import ClearableInput from "../components/ClearableInput";
import AddValidationMsg from '../components/AddValidationMsg'
import Switch from '../components/Switch'

import { accesslevelNames } from '../helpers/funcs'

import { useValidation } from '../hooks/validation.hook'

import { AuthContext } from '../context/AuthContext'
import { RequestContext } from '../context/RequestContext'
import { ModalContext } from '../context/ModalContext'
import { useTitle } from '../hooks/title.hook'

export default function AddUser(props) {
    const modal = useContext(ModalContext)
    const http = useContext(RequestContext)
    const auth = useContext(AuthContext)
    const history = useHistory()
    const validation = useValidation()
    const title = useTitle()

    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [patronymic, setPatronymic] = useState("")

    const [password, setPassword] = useState("")

    const [userid, setUserid] = useState("")

    const [accesslevel, setAccesslevel] = useState(0)

    const [showAccesslevel, setShowAccesslevel] = useState(false)

    const divRef = useRef(null);

    useEffect(() => {
        title.set("Аккаунт")
    }, [])

    const clearFields = () => {
        setName("")
        setSurname("")
        setPatronymic("")
        setPassword("")
        setUserid("")
        setAccesslevel(0)
    }

    const registerUser = useCallback(
        async () => {
            try {
                const data = await http.request('/api/user/register', 'POST', { token: auth.token, name, surname, patronymic, accesslevel })
                console.log(data);
                if (data && data.user) {
                    setUserid(data.user.userid)
                    setPassword(data.user.password)
                    // modal.show(<ErrorModal context={modal} error={{ message: data.message }} />)
                    modal.show(<DialogModal message={data.message} buttons={
                        [
                            { text: "закрыть", primary: false, action: () => { modal.close(); clearFields() } },
                            {
                                text: "загрузить", primary: true, action: () => {
                                    domtoimage.toPng(divRef.current, { bgcolor: "white" }).then((img) => {
                                        var link = document.createElement('a');
                                        link.download = data.user.userid + '-card.png';
                                        link.href = img;
                                        link.click();
                                        clearFields();
                                        modal.close();
                                    })
                                }
                            },
                        ]
                    } />)
                    return;
                }
            }
            catch (e) {

            }
            modal.show(<ErrorModal context={modal} error={{ message: "Ошибка добавления пользователя" }} />)
        },
        [name, surname, patronymic, accesslevel])


    useEffect(() => {
        if (http.error) {
            console.log(http.error);
            if (http.error.errors)
                validation.importStates(http.error.errors)
            else {
                modal.show(<ErrorModal context={modal} error={{ message: http.error.message || "Ошибка добавления пользователя" }} />)
            }
            http.clearError()
        }
    }, [http.error])

    function InputLabel(props) {
        return (
            <Col md='auto'>
                <h4 className="m-0 font-regular unselectable" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                    {props.children}
                </h4>
            </Col>)
    }

    return (
        <>
            <div className="px-3">
                <Row className="justify-content-start align-items-center">
                    <Col xs="auto" className="p-0">
                        <Button
                            variant="outline"
                            className="rounded-circle p-0"
                            size="lg"
                            style={{ height: "48px", width: "48px" }}
                            onClick={() => { history.goBack() }}>
                            <CaretLeftFill />
                        </Button>
                    </Col>

                    <Col xs="auto">
                        <h4
                            className="font-bold m-0 unselectable"
                            style={{ lineHeight: "40px" }}>
                            Добавить пользователя
                        </h4>
                    </Col>
                </Row>

                <Row className="align-items-center justify-content-between my-2">
                    <Col xs={12} md={6}>
                        <Row className="align-items-center my-2">
                            <InputLabel>
                                Фамилия:
                            </InputLabel>
                            <Col>
                                <AddValidationMsg err={validation.states["surname"]}>
                                    <ClearableInput placeholder="фамилия" value={surname} onChange={(data) => { setSurname(data); validation.unsetState("surname") }} />
                                </AddValidationMsg>
                            </Col>
                        </Row>
                        <Row className="align-items-center my-2">
                            <InputLabel>
                                Имя:
                            </InputLabel>
                            <Col>
                                <AddValidationMsg err={validation.states["name"]}>
                                    <ClearableInput placeholder="имя" value={name} onChange={(data) => { setName(data); validation.unsetState("name") }} />
                                </AddValidationMsg>
                            </Col>
                        </Row>
                        <Row className="align-items-center my-2">
                            <InputLabel>
                                Отчество:
                            </InputLabel>
                            <Col>
                                <AddValidationMsg err={validation.states["patronymic"]}>
                                    <ClearableInput placeholder="отчество" value={patronymic} onChange={(data) => { setPatronymic(data); validation.unsetState("patronymic") }} />
                                </AddValidationMsg>
                            </Col>
                        </Row>

                        <Row className="align-items-center my-2">
                            <Col md={8}>
                                <Form.Select
                                    className="rounded-pill"
                                    value={accesslevel}
                                    onChange={(e) => { console.log(parseInt(e.target.value)); setAccesslevel(parseInt(e.target.value)) }}>
                                    {
                                        Object.entries(accesslevelNames).map(([level, name]) => (<option key={level} value={level}>{name}</option>))
                                    }
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Switch value={showAccesslevel} onChange={(e) => setShowAccesslevel(e)} text="показать" />
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={12} md={6} className="p-0">
                        <Row className="justify-content-center align-items-center my-3 p-0">
                            <Col className="p-0" xs="auto">
                                <div ref={divRef} className="d-flex flex-column">
                                    <UserCard
                                        user={{
                                            name: (name || "Имя"),
                                            surname: (surname || "Фамилия"),
                                            patronymic: (patronymic || "Отчество"),
                                            accesslevel,
                                            userid
                                        }}
                                        showlevel={showAccesslevel}
                                        qrsize={180}
                                        width="238px"
                                        actions={false}
                                    />
                                    <h5 className="text-center mt-3" >{password}</h5>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col md={{ span: 4 }}>
                        <Button
                            size='lg'
                            variant="outline-primary"
                            className="btn-block mt-2 fs-6"
                            onClick={() => registerUser()}
                        >Готово</Button></Col>
                </Row>
            </div>
        </>
    )
}