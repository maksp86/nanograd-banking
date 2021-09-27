import React, { useContext, useState, useEffect } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Fade from 'react-reveal/Fade'

import Reader from '../Reader'

import '../../static/css/AuthPage.css'
import { RequestContext } from '../../context/RequestContext'

export default function ScannerView({ onResult = (data) => { } }) {
    const [user, setUser] = useState(null)

    const [getNameFail, setGetNameFail] = useState(false)
    const [getNameFailMessage, setGetNameFailMessage] = useState("Пользователь не существует")

    const [hideErrorTimeout, setHideErrorTimeout] = useState()

    const http = useContext(RequestContext)

    function removeTimeout() {
        if (hideErrorTimeout) {
            clearTimeout(hideErrorTimeout)
            setHideErrorTimeout(null)
        }
    }

    useEffect(() => {
        removeTimeout()
        setHideErrorTimeout(setTimeout(() => { setGetNameFail(false) }, 2000))

        return () => {
            removeTimeout()
        }
    }, [getNameFail])

    useEffect(() => {
        if (http.error && http.error.errors && http.error.errors.some(e => e.param === "userid")) {
            setGetNameFailMessage("Пользователь не существует")
        }
        http.clearError()
    }, [http.error])

    async function getUser(userid) {
        console.log("getUser", userid)
        try {
            const data = await http.request('/api/user/get', 'POST', { userid })

            if (data) {
                if (data.user) {
                    setUser(data.user);
                    return true;
                }

            }
        }
        catch (e) {

        }
        return false;
    }

    async function onPreReaded(data) {
        try {
            setGetNameFail(false)
            const parsed = JSON.parse(data);

            if (parsed && parsed.userid) {
                return getUser(parsed.userid)
            }
        }
        catch (e) {
            if (e instanceof SyntaxError)
                setGetNameFailMessage("Неверный QR-код")
        }
        console.log('preread false')
        setUser(null);
        setGetNameFail(true)
        return false;
    }


    return (
        <>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <h4 className="font-medium mt-2 unselectable">Отсканируйте бейдж</h4>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Reader onReaded={
                        (data) => {
                            onResult(user)
                        }}
                        loading={true}
                        onPreReaded={onPreReaded}
                    />
                </Col>
            </Row>

            <Fade
                duration={500}
                when={getNameFail}
                unmountOnExit={true}
                mountOnEnter={true}
            >
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <h6 className="font-regular mb-3 text-danger unselectable">{getNameFailMessage}</h6>
                    </Col>
                </Row>
            </Fade>

            <Row className="justify-content-center">
                <Col xs="auto">
                    <h4 className="font-medium mb-3 unselectable">или</h4>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <Button
                        onClick={() => onResult(null)}
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