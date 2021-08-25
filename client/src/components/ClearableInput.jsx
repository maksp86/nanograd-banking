import React, { useCallback, useContext, useEffect, useState } from 'react'

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
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import InputGroup from 'react-bootstrap/InputGroup'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'

import Moment from 'react-moment';

import Reader from '../components/Reader'

import { QRCode } from 'react-qrcode-logo';

import { HouseDoor, ClockHistory, Wallet2, Person, CaretRightFill, UpcScan, X, ArrowClockwise, Cash, Bank, People, Cpu } from 'react-bootstrap-icons'


export default function ClearableInput(props) {
    return (
        <InputGroup
            className={"m-0 " + props.className }>
            <FormControl
                value={props.value}
                onChange={(e) => { props.onChange(e.target.value) }}
                placeholder={props.placeholder}
                aria-label={props.placeholder}
            />
            <Button
                variant="outline-primary"
                onClick={() => {
                    props.onChange("")
                }}
            >
                <X size={20} />
            </Button>
            {props.children}
        </InputGroup >
    )
}