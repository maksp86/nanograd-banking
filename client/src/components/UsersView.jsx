import React, { useCallback, useContext, useEffect, useState } from 'react'

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
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

import { HouseDoor, ClockHistory, Wallet2, Person, CaretRightFill, CaretLeftFill, UpcScan, X, ArrowClockwise, Cash, Bank, People, Cpu, Trash, Key, FunnelFill, PersonPlus, ArrowLeft } from 'react-bootstrap-icons'

import ClearableInput from "./ClearableInput";

import { accesslevelNames } from '../helpers/funcs'

import GetQR from './GetQR'
import { AuthContext } from '../context/AuthContext'

export default function UsersView(props) {
    const auth = useContext(AuthContext)

    const [users, setUsers] = useState([
        { userid: "38233823", name: "123", surname: "hjmhj", patronymic: "mhj", accesslevel: 0 },
        { userid: "45564556", name: "fddfdg", surname: "hthtrh", patronymic: "uyjyu", accesslevel: 2 },
        { userid: "94209420", name: "dfgfdg", surname: "dgdfg", patronymic: "jmj", accesslevel: 3 },
        { userid: "93019301", name: "dfgfd", surname: "nhnhgn", patronymic: "hjm", accesslevel: 4 },
        { userid: "11131113", name: "sdfsd", surname: "wrert", patronymic: "78jm9", accesslevel: 10 },
        { userid: "20002000", name: "vxcv", surname: "gfgrt", patronymic: "mhjmhj", accesslevel: 0 }
    ])
    const [addState, setAddState] = useState(false)

    function UserCard(props) {
        if (props.user)
            return (
                <Col xs="auto">
                    <Card style={{ width: '200px' }}>
                        <Card.Body>
                            <Card.Title>{props.user.name} {props.user.surname} {props.user.patronymic}</Card.Title>

                            {props.qrsize ? (<>
                                <div className="d-flex flex-column">
                                    <GetQR style={{ margin: "0 auto" }} size={props.qrsize} data={{ userid: props.user.userid }} />
                                </div>
                            </>) : (<> </>)}

                            <p className="unselectable mx-1 my-0 fs-6" style={{ lineHeight: '30px' }}>
                                <Badge pill bg="primary">{accesslevelNames[props.user.accesslevel]}</Badge>
                            </p>
                            {props.actions === true ? (<>
                                <Button
                                    className="rounded-circle p-1 m-1"
                                    style={{ height: "34px", width: "34px" }}
                                    variant="outline-primary"
                                    onClick={(e) => { setUsers(users.filter(user => user !== props.user)); }}>
                                    <Trash />
                                </Button>
                                <Button
                                    className="rounded-circle p-1 m-1"
                                    style={{ height: "34px", width: "34px" }}
                                    variant="outline-primary">
                                    <Key />
                                </Button>
                            </>
                            ) : (<> </>)}
                        </Card.Body>
                    </Card>
                </Col >
            )
        else
            return (
                <Col xs="auto">
                    <Card style={{ width: '200px' }}>
                        <Card.Body>
                            <Card.Title>Ошибка загрузки</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            )
    }

    function UserList(props) {
        const [searchFilter, setSearchFilter] = useState("")
        return (
            <>
                <Row className="justify-content-start align-items-center px-3">
                    <Col xs="auto">
                        <h4
                            className="font-bold m-0 unselectable"
                            style={{ lineHeight: "40px" }}>
                            Пользователи
                        </h4>
                    </Col>

                    <Col xs="auto" className="mx-2 my-2 p-0">
                        <Button
                            variant="outline-primary"
                            className="rounded-circle p-1"
                            style={{ height: "34px", width: "34px" }}
                            onClick={() => { }}>
                            <ArrowClockwise />
                        </Button>
                    </Col>

                    <Col xs="auto" className="mx-2 my-2 p-0">
                        <Button
                            variant="outline-primary"
                            className="rounded-circle p-1"
                            style={{ height: "34px", width: "34px" }}
                            onClick={() => setAddState(true)}>
                            <PersonPlus />
                        </Button>
                    </Col>

                    <Col md="4">
                        <ClearableInput placeholder="фильтр" value={searchFilter} onChange={(data) => setSearchFilter(data)} />
                    </Col>

                </Row>
                <Row className="mt-2 gap-2" style={{ maxHeight: "400px", minHeight: "200px", overflowX: 'hidden', overflowY: 'auto' }}>
                    {users.filter(
                        (element) => (searchFilter.length < 3) || (element && (element.userid + element.name + element.surname + element.patronymic).includes(searchFilter))).map(user => <UserCard key={user.userid} user={user} actions={true} />)}
                </Row>
            </>
        )
    }

    function AddUser(props) {
        const [name, setName] = useState("")
        const [surname, setSurname] = useState("")
        const [patronymic, setPatronymic] = useState("")
        const [accesslevel, setAccesslevel] = useState(0)

        const [userid, setUserid] = useState("")

        const registerUser = useCallback(
            async () => {
                try {
                    const data = await props.request('/api/user/register', 'POST', { token: auth.token, name, surname, patronymic, accesslevel })
                    console.log(data);
                }
                catch (e) {

                }
            },
            [name, surname, patronymic, accesslevel])

        useEffect(() => { if (props.error) console.log(props.error); }, [props.error])

        return (
            <>
                <div className="px-3">
                    <Row className="justify-content-start align-items-center">
                        <Col xs="auto" className="p-0">
                            <Button
                                variant="outline"
                                className="rounded-circle p-0"
                                size="lg"
                                style={{ height: "48px", width: "48px" }}
                                onClick={() => { setAddState(false) }}>
                                <CaretLeftFill />
                            </Button>
                        </Col>

                        <Col xs="auto">
                            <h4
                                className="font-bold m-0 unselectable"
                                style={{ lineHeight: "40px" }}>
                                Добавить пользователя
                            </h4>
                        </Col>
                    </Row>

                    <Row className="align-items-center justify-content-between my-2">
                        <Col xs={12} md={6}>
                            <Row className="align-items-center my-2">
                                <Col md='auto'>
                                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                                        Фамилия:
                                    </h4>
                                </Col>
                                <Col>
                                    <ClearableInput placeholder="фамилия" value={surname} onChange={(data) => setSurname(data)} />
                                </Col>
                            </Row>
                            <Row className="align-items-center my-2">
                                <Col md='auto'>
                                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                                        Имя:
                                    </h4>
                                </Col>
                                <Col>
                                    <ClearableInput placeholder="имя" value={name} onChange={(data) => setName(data)} />
                                </Col>
                            </Row>
                            <Row className="align-items-center my-2">
                                <Col md='auto'>
                                    <h4 className="m-0 font-regular" style={{ lineHeight: '50px', wordBreak: 'keep-all' }}>
                                        Отчество:
                                    </h4>
                                </Col>
                                <Col>
                                    <ClearableInput placeholder="отчество" value={patronymic} onChange={(data) => setPatronymic(data)} />
                                </Col>
                            </Row>

                            <Row className="align-items-center my-2">
                                <Col>
                                    <Form.Select
                                        className="rounded-pill"
                                        value={accesslevel}
                                        onChange={(e) => setAccesslevel(e.target.value)}>
                                        {
                                            Object.entries(accesslevelNames).map(([level, name]) => (<option key={level} value={level}>{name}</option>))
                                        }
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={12} md={6}>
                            <Row className="justify-content-center align-items-center my-3">
                                {/* <Card className="unselectable" style={{ width: '300px' }}>
                                    <Card.Body>
                                        <Card.Title>{surname || "Фамилия"} {name || "Имя"} {patronymic || "Отчество"}</Card.Title>

                                        <div className="d-flex flex-column">
                                            <GetQR style={{ margin: "0 auto" }} size={200} value={{ userid }} />

                                            <p className="mx-1 my-0 fs-6" style={{ lineHeight: '30px' }}>
                                                <Badge pill bg="primary">{accesslevelNames[accesslevel]}</Badge>
                                            </p>
                                        </div>
                                    </Card.Body>
                                </Card> */}
                                <UserCard
                                    user={{
                                        name,
                                        surname,
                                        patronymic,
                                        accesslevel,
                                        userid
                                    }}
                                    qrsize={160}
                                    actions={false}
                                />
                            </Row>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col md={{ span: 4 }}>
                            <Button
                                size='lg'
                                variant="outline-primary"
                                className="btn-block mt-2 fs-6"
                                onClick={() => registerUser()}
                            >Готово</Button></Col>
                    </Row>
                </div>
            </>
        )
    }

    if (addState)
        return <AddUser request={props.request} error={props.error} />
    else
        return <UserList />
}