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
import InputGroup from 'react-bootstrap/InputGroup'

import Moment from 'react-moment';

import Reader from '../components/Reader'

import { QRCode } from 'react-qrcode-logo';

import { HouseDoor, ClockHistory, Wallet2, Person, CaretRightFill, UpcScan, X } from 'react-bootstrap-icons'

import '../static/css/CabinetPage.css'
import 'moment/locale/ru'

import logoqr from '../static/imgs/logo-qr.svg'

import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import { getTimeGreeting, accesslevelNames, paymentTypes } from '../helpers/funcs'

export const CabinetPage = () => {
    const { loading, error, request, clearError } = useHttp()
    const auth = useContext(AuthContext)

    const [pageNumber, setPageNumber] = useState(0)
    const [currUser, setCurrUser] = useState(null)

    const [modalShow, setModalShow] = useState(false)
    const [modalClosable, setModalClosable] = useState(true)
    const [modalContent, setModalContent] = useState(null)

    const loadUser = async () => {
        const data = await request('/api/user/get', 'POST', { token: auth.token, userid: auth.userid });
        console.log(data)

        if (data && data.user) {
            data.user.accesslevelText = accesslevelNames[data.user.accesslevel]
            setCurrUser(data.user)
        }
    }

    useEffect(() => {
        if (auth.token && auth.userid)
            loadUser()
    }, [auth.token, auth.userid])

    function ErrorModal(props) {
        return (
            <div className="m-3" style={{ display: "flex", flexDirection: "column" }}>
                <h5>
                    {props.error.message}
                </h5>
                <Button
                    size='lg'
                    variant="outline-primary"
                    className="btn-block mt-2 mx-auto"
                    onClick={() => { setModalShow(false); }}
                >закрыть</Button>
            </div>
        )
    }

    useEffect(() => {
        if (error && !error.errors) {
            console.log("err", error)
            setModalContent(<ErrorModal error={error} />)
            setModalShow(true);
            setModalClosable(true);
        }
    }, [error, clearError])

    useEffect(() => {
        if (modalShow && error) {
            if (error.message === "Token expired") { auth.logout("") }
            clearError()
        }
    }, [modalShow, error])


    function GetQR(props) {
        return (<div onClick={props.onClick} style={props.style}><QRCode
            size={props.size}
            value={JSON.stringify(props.data)}
            logoImage={logoqr}
            logoWidth={props.size * 0.28}
            logoHeight={props.size * 0.28}
            ecLevel="Q"
            eyeRadius={[
                [10, 0, 0, 0], // top/left eye
                [0, 10, 0, 0], // top/right eye
                [0, 0, 0, 10], // bottom/left
            ]}
        /></div>)
    }

    function QrModal(props) {
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <GetQR
                    style={{ margin: "0 auto" }}
                    size={300}
                    data={props.data}
                />
                <Button
                    size='lg'
                    variant="outline-primary"
                    className="btn-block mt-2 mx-auto"
                    onClick={() => { setModalShow(false) }}
                >закрыть</Button>
            </div>
        )
    }

    function HomeView(props) {
        return (
            <>
                <Row className="align-items-center">
                    <Col xs="auto">
                        <div>
                            <h2 className="font-medium mt-4 mb-2 mx-2 unselectable" >{getTimeGreeting()},</h2>
                            <h2 className="font-regular mt-2 mb-3 mx-2 unselectable">{currUser.name}</h2>
                        </div>
                    </Col>

                    <Col lg="auto">
                        <h3 className="mx-2 font-light my-0">
                            <span className="unselectable">баланс: </span>
                            {currUser.balance}
                            <span className="unselectable"> нанолисиков</span>
                        </h3>
                    </Col>

                    <Col>
                        <div
                            style={{ width: 'fit-content', margin: '0 auto' }}
                        >
                            <div className="my-4">
                                <GetQR onClick=
                                    {
                                        () => {
                                            setModalShow(true)
                                            setModalClosable(true)
                                            setModalContent(<QrModal data={{ userid: currUser.userid }} />)
                                        }
                                    } size={200} />
                            </div>
                        </div>
                    </Col>

                </Row>
            </>
        )

    }

    // const [transactionParam, setTransactionParams] = useState({ showAll: false, userid: null });
    const [transactionParamShowAll, setTransactionParamShowAll] = useState(false);
    const [transactionParamUserid, setTransactionParamUserid] = useState("");

    const [transactions, setTransactions] = useState(null);

    const [currTransaction, setCurrTransaction] = useState(null);
    const [currTransactionUsers, setCurrTransactionUsers] = useState({ sender: null, target: null });

    const [transactionsUpdateTimeout, setTransactionsUpdateTimeout] = useState(undefined);

    async function transactionsReload() {
        const data = await request('/api/pay/listtransact', 'POST', { token: auth.token, showAll: transactionParamShowAll, userid: transactionParamUserid });

        if (data && data.transactions) {
            setTransactions(data.transactions)
        }
    }

    useEffect(() => {
        if (pageNumber === 1) {
            transactionsReload()
        }
    }, [pageNumber])

    function resetTransactionsUpdateTimeout() {
        if (transactionsUpdateTimeout)
            clearTimeout(transactionsUpdateTimeout)

        setTransactionsUpdateTimeout(setTimeout(transactionsReload, 1000))
    }

    useEffect(resetTransactionsUpdateTimeout, [transactionParamShowAll])

    useEffect(() => {
        if (transactionParamUserid.length > 3 || transactionParamUserid.length == 0)
            resetTransactionsUpdateTimeout()
    }, [transactionParamUserid])

    useEffect(() => {
        async function func() {
            if (currTransaction) {
                const sender = (currTransaction.sender === currUser.userid) ? { user: currUser } : await request('/api/user/get', 'POST', { token: auth.token, userid: currTransaction.sender });
                console.log("sender", sender)

                const target = (currTransaction.target === currUser.userid) ? { user: currUser } : await request('/api/user/get', 'POST', { token: auth.token, userid: currTransaction.target });
                console.log("target", target)

                if ((target && target.user) &&
                    (sender && sender.user)) {
                    setCurrTransactionUsers({ sender: sender.user, target: target.user })
                }
            }
        }
        func()
    }, [currTransaction])

    function ScannerModal(props) {
        return (
            <div className="mx-2" style={{ display: "flex", flexDirection: "column" }}>
                <h4 className="mx-auto my-2 unselectable">
                    Отсканируйте бейдж
                </h4>
                <div style={{ margin: "0 auto" }}>
                    <Reader onReaded={
                        (data) => {
                            setModalShow(false);
                            //setModalContent(null);
                        }}

                        onPreReaded={
                            (data) => {
                                try {
                                    const parsed = JSON.parse(data);
                                    if (parsed && parsed.userid) {
                                        props.onSuccessfulScan(parsed.userid);
                                        console.log("preread", parsed.userid)
                                        return true;
                                    }
                                    else {
                                        console.log('preread false')
                                        return false;
                                    }
                                }
                                catch (e) {
                                    console.log('preread err')
                                    return false;
                                }
                            }
                        }
                    />
                </div>
                <Button
                    size='lg'
                    variant="outline-primary"
                    className="btn-block mt-2 mx-auto"
                    onClick={() => { setModalShow(false) }}
                >отмена</Button>
            </div>
        )
    }

    const IdField = useCallback(
        (props) => {
            return (
                <InputGroup
                    className="m-0">
                    <FormControl
                        value={props.value}
                        onChange={(e) => { props.onChange(e.target.value) }}
                        placeholder="id получателя"
                        aria-label="id получателя"
                    />
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            props.onChange("")
                        }}
                    >
                        <X size={20} />
                    </Button>

                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            setModalContent(<ScannerModal onSuccessfulScan={(data) => props.onChange(data)} />)
                            setModalShow(true)
                            setModalClosable(true)
                        }}
                    >
                        <UpcScan className="mx-2" size={20} />
                    </Button>
                </InputGroup>
            )
        }
    )

    function TransactionHistoryLine(props) {
        const transaction = props.info;

        const direction = (transaction.target === currUser.userid) || (transaction.type === 2);

        let transactionText = paymentTypes[transaction.type]

        if (transaction.type === 1) {
            if (direction)
                transactionText += " от пользователя "
            else
                transactionText += " пользователю "
        }

        return (
            <div className="thl unselectable"
                onClick={() => { setCurrTransaction(transaction) }}
            >
                <Row className="align-items-center h-100 pl-2">
                    <Col xs={3} md={2} lg={2} xl={1} className="align-self-center">
                        <p
                            className="font-bold unselectable m-0 fs-5"
                            style={
                                {
                                    lineHeight: '30px',
                                    color: direction ? "#00AF54" : "#F08282"
                                }
                            }
                        >
                            {direction ? "+" : "-"}{transaction.amount}
                        </p>
                    </Col>

                    <Col xs={7} md={9} lg={9} xl={10} className="align-self-center text-truncate fs-5 font-regular" style={{ lineHeight: '30px' }}>
                        {/* <p
                                className="font-regular m-0 fs-5 float-start  d-block"
                                style={{ lineHeight: '30px' }}
                            >
                            </p> */}
                        {transactionText}
                    </Col>

                    <Col xs={2} md={1} lg={1} xl={1} className="p-0">
                        <CaretRightFill />
                    </Col>
                </Row>
            </div>
        )
    }

    // const ShowAllSwitch = useCallback(() => {
    //     console.log("ShowAllSwitch redraw")
    //     return (<Form.Check
    //         type="switch"
    //         id="show-all-switch"
    //         label="показать все"
    //         className="font-normal unselectable my-2"
    //         checked={transactionParamShowAll}
    //         onChange={(e) => { setTransactionParamShowAll(e.target.checked) }}
    //     />)
    // }, [transactionParamShowAll])

    function ShowAllSwitch() {
        return (<Form.Check
            type="switch"
            id="show-all-switch"
            label="показать все"
            className="font-normal unselectable my-2"
            checked={transactionParamShowAll}
            onChange={(e) => { setTransactionParamShowAll(e.target.checked) }}
        />)
    }

    function PaymentHistoryView(props) {
        if (currTransaction && currTransactionUsers) {
            if (currTransactionUsers.sender && currTransactionUsers.target) {
                return (
                    <>
                        <div className="m-3">
                            <Row className="justify-content-center">
                                <Col>
                                    <h3>Транзакция №{currTransaction._id.slice(0, 6)}</h3>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">Тип: <span className="font-regular">{paymentTypes[currTransaction.type].toLowerCase()}</span></h5>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">Отправитель: <span className="font-regular">
                                        {currTransaction.sender === currUser.userid ? "вы" : currTransactionUsers.sender.name + " " + currTransactionUsers.sender.surname + " " + currTransactionUsers.sender.patronymic + " (" + currTransactionUsers.sender.userid + ")"}
                                    </span></h5>
                                </Col>
                            </Row>

                            <Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">Получатель: <span className="font-regular">
                                        {currTransaction.target === currUser.userid ? "вы" : currTransactionUsers.target.name + " " + currTransactionUsers.target.surname + " " + currTransactionUsers.target.patronymic + " (" + currTransactionUsers.target.userid + ")"}
                                    </span></h5>
                                </Col>
                            </Row>

                            {currTransaction.message ? (<Row className="justify-content-center">
                                <Col>
                                    <h5 className="font-normal">Сообщение: <span className="font-regular">
                                        {currTransaction.message}
                                    </span></h5>
                                </Col>
                            </Row>) : ""}

                            <Row>
                                <Col>
                                    <Row className="justify-content-center">
                                        <Col md={{ span: 3 }}>
                                            <Button
                                                size='lg'
                                                variant="outline-primary"
                                                className="btn-block mt-4"
                                                onClick={() => { setCurrTransaction(null); setCurrTransactionUsers(null) }}
                                            >назад</Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </>
                )
            }
        }
        else if (transactions)
            return (
                <>
                    <Row className="justify-content-start align-items-center">
                        <Col xs="auto">
                            <h3 className="font-bold m-0 unselectable">
                                Последние транзакции
                            </h3>
                        </Col>
                        <Col className="ml-4" xs="auto">
                            <ShowAllSwitch />
                        </Col>
                        <Col xs="auto">
                            {IdField({ onChange: (val) => { setTransactionParamUserid(val) }, value: transactionParamUserid })}
                            {/* <IdField onChange={(val) => { setTransactionParamUserid(val) }} value={transactionParamUserid} /> */}
                        </Col>
                    </Row>

                    {
                        (transactions && transactions.length > 0) ?
                            <div className="thl-cont mt-2">
                                {transactions.map(transaction => (<TransactionHistoryLine key={transaction._id} info={transaction} />))}
                            </div>
                            : (<Row className="thl-cont align-items-center">
                                <Col>
                                    <h5 className="font-regular text-center m-0 unselectable">транзакции не найдены</h5>
                                </Col>
                            </Row>)
                    }


                </>
            )

        return (<></>)
    }

    const loadPaymentToken = useCallback(async () => {
        try {
            const data = await request('/api/pay/gentoken', "POST", { token: auth.token })

            if (data && data.paymentToken) {
                setModalContent(<QrModal data={{ userid: auth.userid, paytoken: data.paymentToken._id }} />)
                setModalClosable(true)
                setModalShow(true)
            }
        }
        catch (e) {

        }
    })

    const [payUserid, setPayUserid] = useState("");
    const [payAmount, setPayAmount] = useState(0);
    const [payMessage, setPayMessage] = useState("");

    const makeTransaction = useCallback(async () => {
        try {
            const data = await request('/api/pay/send', "POST",
                {
                    token: auth.token,
                    sender: auth.userid,
                    target: payUserid,
                    amount: payAmount,
                    type: 1
                })
            console.log("DATA", data)

            if (data && data.paymentToken) {
                setModalContent(<ErrorModal error={{ message: data.message }} />)
                setModalClosable(true)
                setModalShow(true)
            }
        }
        catch (e) {
            clearError()
        }
    });

    function PayView(props) {
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

    function AccountView(props) {
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
                    <Col md={{ span: 6 }}>
                        <Button
                            size='lg'
                            variant="primary"
                            className="btn-block mt-4"
                            onClick={() => { auth.logout() }}
                        >выйти</Button>
                    </Col>
                </Row>
            </>
        )
    }

    function NavButton(props) {
        return (
            <Button
                variant="dark"
                className={pageNumber === props.number ? "button-active" : ""}
                onClick={() => { setPageNumber(props.number) }}
            >
                {props.children}
            </Button>
        )
    }

    function LoadingView() {
        return (
            <>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <div style={{ height: "300px", display: "flex" }}>
                            <Spinner style={{ height: "70px", width: "70px", margin: "auto 0" }} animation="border" />
                        </div>
                    </Col>
                </Row>
            </>
        )
    }

    function Navigation() {
        return (
            <Navbar
                bg="dark"
                variant="dark"
                fixed="bottom"
                className="p-0"
                style={{ borderRadius: "35px 35px 0px 0px", height: "80px" }}>

                <ButtonGroup className="selectors">

                    <NavButton number={0}>
                        <div className="selector-holder">
                            <HouseDoor size={30} />
                            <span>Главная</span>
                        </div>
                    </NavButton>

                    <NavButton number={1}>
                        <div className="selector-holder">
                            <ClockHistory size={30} />
                            <span>История</span>
                        </div>
                    </NavButton>

                    <NavButton number={2}>
                        <div className="selector-holder">
                            <Wallet2 size={30} />
                            <span>Оплата</span>
                        </div>
                    </NavButton>

                    <NavButton number={3}>
                        <div className="selector-holder">
                            <Person size={30} />
                            <span>Аккаунт</span>
                        </div>
                    </NavButton>
                </ButtonGroup>
            </Navbar >
        )
    }

    document.body.style.backgroundColor = "white";
    document.body.style.color = "#2D3142";

    const GetActivePage = (props) => {

        let page;
        if (props.isLoading || !currUser) {
            page = <LoadingView />
        }
        else {

            switch (props.number) {
                default:
                case 0:
                    page = <HomeView />;
                    break;
                case 1:
                    // page = <PaymentHistoryView />;
                    page = PaymentHistoryView()
                    break;
                case 2:
                    page = PayView();
                    break;
                case 3:
                    page = <AccountView />;
                    break;
            }
        }
        return page;
    }

    return (
        <>
            <div>
                <div className="vertical-center px-4 pt-4" style={{ paddingBottom: "calc(80px + 1.5rem)" }}>
                    <Container fluid="sm" className="p-3" style={{ borderRadius: '35px', boxShadow: "0px 0px 16px 16px rgb(45 49 66 / 3%)" }}>
                        <div className="px-3 py-3">
                            {/* <GetActivePage number={pageNumber} isLoading={loading} /> */}
                            {GetActivePage({ number: pageNumber, isLoading: loading })}
                        </div>
                    </Container>
                </div>

                {Navigation()}
            </div>

            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                backdrop={modalClosable ? true : "static"}
                keyboard={modalClosable}
            >
                <Modal.Body>
                    {modalContent}
                </Modal.Body>
            </Modal>
        </>
    )
}