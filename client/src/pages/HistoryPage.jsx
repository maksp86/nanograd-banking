import React, { useContext, useEffect, useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

import { ArrowClockwise } from 'react-bootstrap-icons'

import '../static/css/CabinetPage.css'
import 'moment/locale/ru'

import IdField from '../components/IdField'
import Switch from '../components/Switch'

import { AuthContext } from '../context/AuthContext'
import { RequestContext } from '../context/RequestContext'
import TransactionHistoryLine from '../components/TransactionHistoryLine'
import { NotShowFor } from '../components/ShowFor'
import { useTitle } from '../hooks/title.hook'

export default function HistoryPage(props) {
    const auth = useContext(AuthContext)
    const { request } = useContext(RequestContext)
    const title = useTitle()

    const [transactions, setTransactions] = useState(null);
    const [transactionParamShowAll, setTransactionParamShowAll] = useState(false);
    const [transactionParamUserid, setTransactionParamUserid] = useState("");

    const [transactionsUpdateTimeout, setTransactionsUpdateTimeout] = useState(undefined);

    async function transactionsReload() {
        const data = await request('/api/pay/listtransact', 'POST', { token: auth.token, showAll: transactionParamShowAll, userid: transactionParamUserid });

        if (data && data.transactions) {
            setTransactions(data.transactions.sort((a, b) => {
                if (a.date === b.date)
                    return 0;
                else if (a.date < b.date)
                    return 1
                else
                    return -1
            }))
        }
    }

    useEffect(() => {
        title.set("История")
    }, [])

    function resetTransactionsUpdateTimeout() {
        if (transactionsUpdateTimeout)
            clearTimeout(transactionsUpdateTimeout)

        setTransactionsUpdateTimeout(setTimeout(transactionsReload, 1000))
    }

    useEffect(() => {
        resetTransactionsUpdateTimeout()
    }, [transactionParamShowAll, transactionParamUserid])

    function GetContainer(props) {
        if (props.transactions && props.transactions.length > 0) {
            return (
                <div className="thl-cont mt-2">
                    {transactions.map(transaction => (<TransactionHistoryLine key={transaction._id} info={transaction} />))}
                </div>
            )
        }
        else
            return (
                <Row className="thl-cont justify-content-center align-items-center">
                    <Col xs="auto">
                        {
                            props.transactions ?
                                <h5 className="font-regular m-0 unselectable">транзакции не найдены</h5> :
                                <Spinner style={{ height: "70px", width: "70px", margin: "auto 0" }} animation="border" />
                        }
                    </Col>
                </Row>)
    }

    return (
        <>
            <Row className="justify-content-start align-items-center px-3">
                <Col xs="auto" className="ml-1">
                    <h4
                        className="font-bold m-0 unselectable"
                        style={{ lineHeight: "40px" }}>
                        Последние транзакции
                    </h4>
                </Col>

                <Col xs="auto" className="ml-3 my-2 p-0">
                    <Button
                        variant="outline-primary"
                        className="rounded-circle p-1"
                        style={{ height: "34px", width: "34px" }}
                        onClick={() => transactionsReload()}><ArrowClockwise /></Button>
                </Col>

                <NotShowFor user={auth.currUser} level={1}>
                    <>
                        <Col className="ml-4 my-2" xs="auto">
                            <Switch text="показать все" value={transactionParamShowAll} onChange={(e) => { setTransactionParamShowAll(e); }} />
                        </Col>
                        <Col md="12" lg="auto">
                            <IdField onChange={(val) => { setTransactionParamUserid((typeof val === "string") ? val : val.userid); }} value={transactionParamUserid} />
                        </Col>
                    </>
                </NotShowFor>
            </Row>
            <GetContainer transactions={transactions} />
        </>
    )
}