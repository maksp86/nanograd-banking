import React, { useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Field from './Field'

import '../../static/css/AuthPage.css'
import Switch from '../Switch'

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