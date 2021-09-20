import React, { useContext, useState, useCallback, useEffect } from 'react'

import logo from '../static/imgs/logo-white-yellow.svg'
import hesoyam from '../static/imgs/hesoyam.gif'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Spinner from 'react-bootstrap/Spinner'

import { CaretLeftFill } from 'react-bootstrap-icons'

import Reader from '../components/Reader'

import '../static/css/AuthPage.css'
import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import { getTimeGreeting } from '../helpers/funcs'
import { isDesktop } from 'react-device-detect'
import Switch from '../components/Switch'

export const AuthPage = () => {
    const { loading, error, request, clearError } = useHttp()
    const auth = useContext(AuthContext)

    const [scanned, setScanned] = useState(false)
    const [scanCanceled, setScanCanceled] = useState(isDesktop)

    const [getNameFail, setGetNameFail] = useState(false)

    const [showPassword, setShowPassword] = useState(false)

    const [user, setUser] = useState("")
    const [userid, setUserid] = useState("")
    const [password, setPassword] = useState("")

    const [invalidStates, setInvalidStates] = useState({ userid: { value: false, message: null }, password: { value: false, message: null } })

    useEffect(() => {
        if (error) {
            console.log(error.message)
            if (error.errors) {
                error.errors.forEach(element => {
                    console.log("err", element)
                    invalidStates[element.param].value = true;
                    invalidStates[element.param].message = element.msg;
                });
                console.log(invalidStates)
                setInvalidStates(invalidStates)
            }
            clearError()
        }
    }, [error, clearError, invalidStates])

    const handleLogin = async () => {
        try {
            const data = await request('/api/auth/login', 'POST', { userid, password })
            console.log(data.message)
            auth.login(data.token, data.userid)
        } catch (e) { }
    }

    const handleGetName = useCallback(async (id) => {
        try {
            const data = await request('/api/user/get', 'POST', { userid: id })
            if (data && data.user) {
                console.log(data.user)
                setUser(data.user)
                setGetNameFail(false)
                setScanned(true)
                return
            }
        } catch (e) { console.log("err", e) }

        setUser(null)
        setGetNameFail(true)
        setScanned(false);
        setScanCanceled(false);
        setPassword("");
        setUserid("");
    }, [request])

    function onKeyPressed(evt) {
        if (evt.key === 'Enter') {
            handleLogin();
        }
    }

    function BackButton() {
        return <Button
            onClick={() => {
                setScanned(false); setScanCanceled(false); setPassword(""); setUserid("");
                setInvalidStates({ userid: { value: false, message: null }, password: { value: false, message: null } })
            }}
            className="rounded-circle"
            variant="outline"
            size='lg'
        >
            <CaretLeftFill />
        </Button>
    }

    function LoginButtonRow() {
        return (
            <>
                <Row className="justify-content-center">
                    <Col>
                        <Button
                            onClick={handleLogin}
                            className="btn-block mt-3"
                            variant="primary"
                            size='lg'
                        >
                            войти
                        </Button>
                    </Col>
                </Row>
            </>
        )
    }

    function PasswordField(props) {
        return (
            <>
                <Row>
                    <Col>
                        <FloatingLabel
                            controlId="floatingInput1"
                            label="введите пароль"
                            className="mb-3 mx-2 font-light unselectable"
                        >
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                autoComplete="on"
                                onKeyPress={onKeyPressed}
                                placeholder="password"
                                isInvalid={invalidStates.password.value}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); invalidStates.password.value = false; setInvalidStates(invalidStates) }}
                            />
                            {invalidStates.password.value ? <h6 className="mx-3 mt-1 font-light text-danger">{invalidStates.password.message}</h6> : ""}
                        </FloatingLabel>
                    </Col>
                </Row>
                <Row className="justify-content-end">
                    <Col xs={{ offset: 4 }}>
                        <Switch text="показать пароль" className="mx-2" checked={showPassword} onChange={(e) => setShowPassword(e)} />
                        {/* <Form.Check
                            type="switch"
                            id="show-pass-switch"
                            label="показать пароль"
                            className="font-normal unselectable mx-2"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                        /> */}
                    </Col>
                </Row>
            </>
        )
    }

    function ScannerView(props) {
        return (
            <>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <h4 className="font-medium mt-2">Отсканируйте бейдж</h4>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <Reader onReaded={
                            (data) => {
                                handleGetName(userid);
                            }}

                            onPreReaded={
                                (data) => {
                                    try {
                                        setGetNameFail(false)
                                        setScanned(false)
                                        const parsed = JSON.parse(data);
                                        if (parsed && parsed.userid) {
                                            setUserid(parsed.userid);
                                            console.log('preread true')
                                            return true;
                                        }
                                        else {
                                            console.log('preread false')
                                            setUserid("");
                                            return false;
                                        }
                                    }
                                    catch (e) {
                                        console.log('preread err')
                                        setUserid("");
                                        return false;
                                    }
                                }
                            }
                        />
                    </Col>
                </Row>

                {getNameFail ?
                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <h6 className="font-regular mb-3 text-danger">Пользователь не существует</h6>
                        </Col>
                    </Row> : ""
                }

                <Row className="justify-content-center">
                    <Col xs="auto">
                        <h4 className="font-medium mb-3">или</h4>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col>
                        <Button
                            onClick={() => { setScanned(false); setScanCanceled(true) }}
                            className="btn-block"
                            variant="primary"
                            size='lg'
                        >
                            войти по id
                        </Button>
                    </Col>
                </Row>
            </>
        )
    }

    function LoginPassView(props) {
        return (
            <>
                {/* <Row>
                    <Col>
                        <BackButton />
                    </Col>
                </Row> */}

                <Row>
                    <Col>
                        <h4 className="font-medium mt-4 mb-3 mx-2 unselectable">{getTimeGreeting()}</h4>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FloatingLabel
                            controlId="floatingInput"
                            label="введите id"
                            className="mb-3 mx-2 font-light unselectable"
                        >
                            <Form.Control
                                type="text"
                                onKeyPress={onKeyPressed}
                                placeholder="id"
                                autoComplete="on"
                                isInvalid={invalidStates.userid.value}
                                value={userid}
                                onChange={(e) => { setUserid(e.target.value); invalidStates.userid.value = false; setInvalidStates(invalidStates) }} />
                            {invalidStates.userid.value ? <h6 className="mx-3 mt-1 font-light text-danger">{invalidStates.userid.message}</h6> : ""}
                        </FloatingLabel>
                    </Col>
                </Row>

                {PasswordField() }

                <LoginButtonRow />
            </>
        )
    }

    function PassView(props) {
        return (
            <>
                <Row>
                    <Col>
                        <h4 className="font-medium mt-4 mb-2 mx-2 unselectable" >{getTimeGreeting()},</h4>
                        <h4 className="font-regular mt-2 mb-3 mx-2 unselectable" >{user.name}</h4>
                    </Col>
                </Row>

                {PasswordField()}

                <LoginButtonRow />
            </>
        )
    }

    function LoadingView() {
        return (
            <>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <div style={{ height: "300px", display: "flex" }}>
                            <Spinner style={{ height: "70px", width: "70px", margin: "auto 0" }} animation="border" />
                        </div>
                    </Col>
                </Row>
            </>
        )
    }

    const GetView = useCallback((isBackable, props) => {
        return (
            <>
                <Container
                    fluid="sm"
                    className="p-1"
                    style={
                        {
                            backgroundColor: 'white',
                            borderRadius: '35px',
                            minWidth: '300px',
                            boxShadow: "0px 0px 16px 16px rgb(255 255 255 / 7%)"
                        }
                    }>
                    {isBackable ? (<BackButton />) : ""}
                    <div className="px-3 py-3">
                        {props}
                    </div>
                </Container>
            </>
        )
    }, [])

    function NextView(props) {

        console.log('redraw')

        if (props.isLoading) {
            return GetView(false, LoadingView())
        }
        else
            if (props.isScanned)
                return GetView(true, PassView(userid))
            else {
                if (props.scanCanceled)
                    return GetView(true, LoginPassView(null))
                else
                    return GetView(false, ScannerView(null))
            }
    }

    const [clicks, setClicks] = useState(0);

    document.body.style.backgroundColor = "#2D3142"
    document.body.style.color = "black"

    return (
        <div className="vertical-center">
            <Container fluid="sm" style={{ width: '350px' }}>

                <Row className="justify-content-center">
                    <Col xs="auto">
                        <div onClick={() => { setClicks(clicks + 1); }}>
                            <Image className="mb-4 unselectable" style={{ minHeight: "100px", minWidth: "300px" }} src={(clicks === 6 && password === "hesoyam") ? hesoyam : logo} fluid />
                        </div>
                    </Col>
                </Row>

                <Row className="justify-content-center">
                    <Col xs="auto">
                        <div className="moving">
                            {NextView({ isScanned: scanned, isLoading: loading, scanCanceled })}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}