import React, {useContext, useEffect, useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import {ArrowClockwise, PersonPlus } from 'react-bootstrap-icons'

import ClearableInput from "../components/ClearableInput";

import { AuthContext } from '../context/AuthContext'
import UserCard from '../components/UserCard'
import { ModalContext } from '../context/ModalContext'
import PasswordChangeModal from '../components/PasswordChangeModal'
import { generatePath, useHistory } from 'react-router-dom'
import { RequestContext } from '../context/RequestContext'
import ErrorModal from '../components/ErrorModal'
import DialogModal from '../components/DialogModal'

export default function UsersView(props) {
    const history = useHistory()

    const auth = useContext(AuthContext)
    const modal = useContext(ModalContext)
    const http = useContext(RequestContext)

    const [users, setUsers] = useState([])
    const [usersUpdateTimeout, setUsersUpdateTimeout] = useState(undefined);

    useEffect(() => {
        if (http.error) {
            console.log(http.error);
            modal.show(<ErrorModal context={modal} error={{ message: http.error.message || "Ошибка" }} />)
            http.clearError()
        }
    }, [http.error])

    async function usersReload() {
        try {
            const data = await http.request('/api/user/list', 'POST', { token: auth.token });
            console.log("usersReload")
            if (data && data.users) {
                setUsers(data.users)
            }
        }
        catch (e) {

        }
    }

    async function deleteUser(userid) {
        try {
            const data = await http.request('/api/user/delete', 'POST', { token: auth.token, userid });
            if (data) {
                modal.show(<ErrorModal context={modal} error={{ message: data.message }} />)
                setUsers(users.filter(user => user.userid !== userid));
            }
        }
        catch (e) {

        }
    }

    useEffect(() => {
        if (!users || users.length === 0)
            usersReload()
    }, [])

    function resetUsersUpdateTimeout() {
        if (usersUpdateTimeout)
            clearTimeout(usersUpdateTimeout)

        setUsersUpdateTimeout(setTimeout(usersReload, 1000))
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
                            onClick={() => { usersReload() }}>
                            <ArrowClockwise />
                        </Button>
                    </Col>

                    <Col xs="auto" className="mx-2 my-2 p-0">
                        <Button
                            variant="outline-primary"
                            className="rounded-circle p-1"
                            style={{ height: "34px", width: "34px" }}
                            onClick={() => history.push('/users/add')}>
                            <PersonPlus />
                        </Button>
                    </Col>

                    <Col md="4">
                        <ClearableInput placeholder="фильтр" value={searchFilter} onChange={(data) => setSearchFilter(data)} />
                    </Col>

                </Row>
                <Row className="mt-2 gap-1" style={{ maxHeight: "400px", minHeight: "300px", overflowX: 'hidden', overflowY: 'auto' }}>
                    {users.filter(
                        (element) => (searchFilter.length < 3) || (element && (element.userid + element.name + element.surname + element.patronymic).includes(searchFilter))).map(
                            user =>
                                <Col key={user.userid} xs="auto" className="px-1 py-2">
                                    <UserCard
                                        user={user}
                                        actions={true}
                                        onClick={() => { history.push(generatePath("/users/id:userid", { userid: user.userid })) }}
                                        onRemove={
                                            (e) => {
                                                modal.show(<DialogModal
                                                    message={"Удалить пользователя " + e.userid + "?"}
                                                    buttons={[
                                                        { text: "Нет", primary: false, action: () => { modal.close() } },
                                                        { text: "Да", primary: true, action: () => { deleteUser(e.userid); modal.close() } }
                                                    ]}
                                                />)
                                            }
                                        }
                                        onPassChange={
                                            (user) => {
                                                modal.show(<PasswordChangeModal userid={user.userid} />)
                                            }
                                        }
                                    />
                                </Col>)}
                </Row>
            </>
        )
    }

    return <UserList />
}