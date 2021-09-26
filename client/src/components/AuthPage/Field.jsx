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

export default function Field(props) {
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