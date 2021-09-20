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

function Field(props) {
    const [needMessage, setneedMessage] = useState(false)
    useEffect(() => {
        setneedMessage(props.validation && props.validation.value)
    }, [props, props.validation])

    return (
        <>
            <Row>
                <Col>
                    <FloatingLabel
                        controlId={props.name + "Input"}
                        label={props.placeholder}
                        className="mb-3 mx-2 font-light unselectable"
                    >
                        <Form.Control
                            type={props.type || "text"}
                            autoComplete="on"
                            onKeyPress={props.onKeyPress}
                            placeholder={props.placeholder}
                            isInvalid={needMessage}
                            value={props.value}
                            disabled={props.disabled}
                            onChange={(e) => { props.onChange(e.target.value); }}
                        />

                        <Fade
                            left
                            duration={300}
                            distance="5%"
                            opposite
                            when={needMessage}
                            unmountOnExit={true}
                            mountOnEnter={true}
                            appear={false}
                        >
                            <h6 className="mx-3 mt-1 font-light text-danger">
                                {needMessage && props.validation.message}
                            </h6>
                        </Fade>
                    </FloatingLabel>
                </Col>
            </Row>
        </>
    )
}

function PasswordField(props) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <>
            <Field
                type={showPassword ? "text" : "password"}
                placeholder="введите пароль"
                value={props.value}
                onChange={props.onChange}
                onKeyPress={props.onKeyPress}
                validation={props.validation}
                disabled={props.disabled}
                name="password"
            />
            <Row className="justify-content-end">
                <Col xs={{ offset: 4 }}>
                    <Switch
                        text="показать пароль"
                        className="mx-2"
                        checked={showPassword}
                        onChange={
                            (e) => setShowPassword(e)
                        }
                    />
                </Col>
            </Row>
        </>
    )
}

export default function PassView(props) {

    const hasUser = props.user ? true : false;
    const [userid, setUserid] = useState(hasUser ? props.user.userid : "")
    const [password, setPassword] = useState("")

    const auth = useContext(AuthContext)
    const validation = useValidation();

    const http = useHttp()

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
            auth.login(data.token, data.userid)
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
                    <Button
                        onClick={handleLogin}
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
                    </Button>
                </Col>
            </Row>
        </>
    )
}