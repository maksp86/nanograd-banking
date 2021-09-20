import React, { useContext, useState, useCallback, useEffect, useRef } from 'react'

import logo from '../../static/imgs/logo-white-yellow.svg'
import hesoyam from '../../static/imgs/hesoyam.gif'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Spinner from 'react-bootstrap/Spinner'
import Fade from 'react-reveal/Fade'

import { CaretLeftFill } from 'react-bootstrap-icons'

import Reader from '../Reader'

import '../../static/css/AuthPage.css'
import { useHttp } from '../../hooks/http.hook'
import { useValidation } from '../../hooks/validation.hook'
import { AuthContext } from '../../context/AuthContext'
import { getTimeGreeting } from '../../helpers/funcs'
import { isDesktop } from 'react-device-detect'
import Switch from '../Switch'
import { RequestContext } from '../../context/RequestContext'
import { ModalContext } from '../../context/ModalContext'

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

    // const getName = useCallback(async (userid) => {
    //     try {
    //         const data = await http.request('/api/user/get', 'POST', { userid })

    //         if (data && data.user) {
    //             return data.user
    //         }
    //     } catch (e) { console.log("err", e) }

    //     setGetNameFail(true)
    //     return null
    // })

    useEffect(() => {
        if (http.error && http.error.errors && http.error.errors.some(e => e.param === "userid")) {
            setGetNameFailMessage("Пользователь не существует")
        }
        http.clearError()
    }, [http.error])

    async function onPreReaded(data) {
        try {
            setGetNameFail(false)
            const parsed = JSON.parse(data);

            if (parsed && parsed.userid) {
                const data = await http.request('/api/user/get', 'POST', { userid: parsed.userid })

                if (data) {
                    if (data.user) {
                        setUser(data.user);
                        return true;
                    }

                }
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