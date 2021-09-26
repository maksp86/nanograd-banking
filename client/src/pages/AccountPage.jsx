import React, { useContext, useEffect } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'

import { useTitle } from '../hooks/title.hook'
import { AuthContext } from '../context/AuthContext'
import PasswordChangeModal from '../components/PasswordChangeModal'
import { ModalContext } from '../context/ModalContext'

export default function AccountPage(props) {
    const { currUser, logout } = useContext(AuthContext)
    const modal = useContext(ModalContext)
    const title = useTitle()

    useEffect(() => {
        title.set("Аккаунт")
    }, [])

    return (
        <>
            <Row className="align-items-center">
                <Col xs="auto">
                    <h1 className="m-0" style={{ lineHeight: '50px' }}>
                        {currUser.surname} {currUser.name} {currUser.patronymic}
                    </h1>
                </Col>
                <Col xl={4}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <h4 className="m-0" style={{ lineHeight: '30px' }}>
                            <span className="unselectable font-regular">id: </span>
                            <span>{currUser.userid}</span>
                        </h4>
                        <p className="unselectable m-0 ml-2 fs-6" style={{ lineHeight: '30px' }}>
                            <Badge pill bg="primary">{currUser.accesslevelText}</Badge>
                        </p>
                    </div>
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col md={4}>
                    <Button
                        size='lg'
                        variant="outline-primary"
                        className="btn-block mt-4"
                        onClick={() => { modal.show(<PasswordChangeModal />); }}
                    >сменить пароль</Button>
                </Col>
                <Col md={6}>
                    <Button
                        size='lg'
                        variant="primary"
                        className="btn-block mt-4"
                        onClick={() => { logout(true) }}
                    >выйти</Button>
                </Col>
            </Row>
        </>
    )
}