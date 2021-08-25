import React, { Component } from 'react'

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Badge from 'react-bootstrap/Badge'
import Modal from 'react-bootstrap/Modal'
import FormControl from 'react-bootstrap/FormControl'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Reader from './Reader'
import { X } from 'react-bootstrap-icons'

export default function PayForm(props) {
    return (
        <div className="m-3">
            <Row className="align-items-center">
                <Col md={4} lg={2}>
                    <h3 className="m-0" style={{ lineHeight: '60px', wordBreak: 'keep-all' }}>
                        Действия
                    </h3>
                </Col>
                <Col md={{ span: 8 }} lg={4}>
                    <Button
                        size='lg'
                        variant="outline-primary"
                        className="btn-block fs-6"
                        onClick={loadPaymentToken}
                    >Получить QR-код для оплаты</Button>
                </Col>
            </Row>

            <Row className="align-items-center my-2 mt-4">
                <Col md='auto'>
                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                        Перевод:
                    </h4>
                </Col>
                <Col>
                    {IdField({ value: payUserid, onChange: (val) => { setPayUserid(val) } })}
                </Col>
            </Row>

            <Row className="align-items-center my-2">
                <Col md='auto'>
                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                        Сумма:
                    </h4>
                </Col>
                <Col>
                    <InputGroup
                        className="m-0">
                        <FormControl
                            value={payAmount}
                            onChange={(e) => { setPayAmount(e.target.value) }}
                            placeholder="сумма"
                            aria-label="сумма"
                            type="number"
                        />
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                setPayAmount(0)
                            }}
                        >
                            <X size={20} />
                        </Button>
                    </InputGroup>
                </Col>
            </Row>

            <Row className="align-items-center my-2">
                <Col md='auto'>
                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                        Сообщение:
                    </h4>
                </Col>
                <Col>
                    <InputGroup
                        className="m-0">
                        <FormControl
                            value={payMessage}
                            onChange={(e) => { setPayMessage(e.target.value) }}
                            placeholder="сообщение"
                            aria-label="сообщение"
                        />
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                setPayMessage("")
                            }}
                        >
                            <X size={20} />
                        </Button>
                    </InputGroup>
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col md={{ span: 4 }}>
                    <Button
                        size='lg'
                        variant="outline-primary"
                        className="btn-block mt-2 fs-6"
                        onClick={makeTransaction}
                    >Перевести</Button></Col>
            </Row>
        </div>
    )
}