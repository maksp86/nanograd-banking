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
import Field from './Field'

import '../../static/css/AuthPage.css'
import { useHttp } from '../../hooks/http.hook'
import { useValidation } from '../../hooks/validation.hook'
import { AuthContext } from '../../context/AuthContext'
import { getTimeGreeting } from '../../helpers/funcs'
import { isDesktop } from 'react-device-detect'
import Switch from '../Switch'
import { RequestContext } from '../../context/RequestContext'

export default function PasswordField(props) {
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