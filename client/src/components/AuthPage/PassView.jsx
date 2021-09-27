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
import Field from './Field'
import PasswordField from './PasswordField'
import LoadingButton from '../LoadingButton'

export default function PassView(props) {

    const hasUser = props.user ? true : false;
    const [userid, setUserid] = useState(hasUser ? props.user.userid : "")
    const [password, setPassword] = useState("")
    const validation = useValidation();

    const http = useContext(RequestContext)

    useEffect(() => {
        if (http.error) {
            if (http.error.errors) {
                validation.importStates(http.error.errors)
            }
            http.clearError()
        }
    }, [http.error, http.clearError])

    const handleLogin = async () => {
        try {
            const data = await http.request('/api/auth/login', 'POST', { userid, password })
            props.onLogin(data.token, data.userid)
        } catch (e) { }
    }

    function onKeyPressed(evt) {
        if (evt.key === 'Enter') {
            handleLogin();
        }
    }

    return (
        <>
            <Row>
                <Col>
                    <h4
                        className="font-medium mt-4 mb-2 mx-2 unselectable"
                    >
                        {getTimeGreeting()}{hasUser && ','}
                    </h4>

                    {
                        hasUser &&
                        <h4
                            className="font-regular mt-2 mb-3 mx-2 unselectable"
                        >
                            {props.user.name}
                        </h4>
                    }
                </Col>
            </Row>

            {
                !hasUser && <Field
                    placeholder="введите id"
                    name="userid"
                    value={userid}
                    onChange={(e) => { setUserid(e); validation.unsetState("userid") }}
                    onKeyPress={onKeyPressed}
                    disabled={http.loading}
                    validation={validation.states["userid"]}
                />
            }

            <PasswordField
                value={password}
                onChange={(e) => { setPassword(e); validation.unsetState("password") }}
                onKeyPress={onKeyPressed}
                disabled={http.loading}
                validation={validation.states["password"]}
            />

            <Row className="justify-content-center">
                <Col>
                    {/* <Button
                        onClick={handleLogin}
                        // onClick={(e) => { props.onLogin("", "") }}
                        disabled={http.loading}
                        className="btn-block mt-3"
                        variant="primary"
                        size='lg'
                    >
                        {http.loading ?
                            <Spinner
                                as="span"
                                animation="border"
                            />
                            :
                            "войти"}
                    </Button> */}
                    <LoadingButton
                        onClick={handleLogin}
                        loading={http.loading}
                        className="btn-block mt-3"
                        variant="primary"
                        size='lg'
                    >войти</LoadingButton>
                </Col>
            </Row>
        </>
    )
}