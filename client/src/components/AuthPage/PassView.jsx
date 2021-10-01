import React, { useContext, useState, useEffect } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import '../../static/css/AuthPage.css'
import { useValidation } from '../../hooks/validation.hook'
import { getTimeGreeting } from '../../helpers/funcs'
import { RequestContext } from '../../context/RequestContext'
import Field from './Field'
import PasswordField from './PasswordField'
import LoadingButton from '../LoadingButton'

export default function PassView(props) {
    const [hasUser, setHasUser] = useState(false)
    const [userid, setUserid] = useState("")
    const [password, setPassword] = useState("")
    const validation = useValidation();

    const http = useContext(RequestContext)

    useEffect(() => {
        if (props.user) {
            setHasUser(true);
            setUserid(props.user.userid)
        }
    }, [props.user])

    useEffect(() => {
        if (http.error) {
            if (http.error.errors) {
                validation.importStates(http.error.errors)
            }
            http.clearError()
        }
    }, [http.error, http.clearError])

    useEffect(() => {
        console.log(validation.states)
    }, [validation.states])

    const handleLogin = async () => {
        try {
            const data = await http.request('/api/auth/login', 'POST', { userid, password })
            if (data)
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
                onChange={(e) => {
                    setPassword(e);
                    validation.unsetState("password")
                }
                }
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