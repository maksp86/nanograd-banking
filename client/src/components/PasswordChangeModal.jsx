import { useContext, useState, useCallback, useEffect } from "react"

import FloatingLabel from "react-bootstrap/FloatingLabel"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"

import { AuthContext } from "../context/AuthContext"
import { RequestContext } from "../context/RequestContext"
import { ModalContext } from "../context/ModalContext"
import ErrorModal from "./ErrorModal"


export default function PasswordChangeModal(props) {
    const auth = useContext(AuthContext)
    const { request, error, clearError, loading } = useContext(RequestContext)
    const modal = useContext(ModalContext)

    const [password, setPassword] = useState("")

    async function changePass() {
        try {
            const data = await request('/api/user/edit', 'POST', { token: auth.token, userid: props.userid, password })
            modal.setContent(<ErrorModal context={modal} error={{ message: data.message }} />)
        }
        catch (e) {

        }
    }

    useEffect(() => {
        if (error) {
            modal.setContent(<ErrorModal context={modal} error={{ message: error.message || "Ошибка смены пароля" }} />)
            clearError()
        }
    }, [error])

    return (
        <div className="m-3" style={{ display: "flex", flexDirection: "column" }}>
            {props.userid && (<h5 className="mb-2 font-medium"><span className="unselectable font-regular">Изменение пароля для </span>{props.userid}</h5>)}

            <FloatingLabel
                controlId="floatingInput"
                label="введите новый пароль"
                className="mb-3 font-light unselectable"
            >
                <Form.Control
                    type="text"
                    placeholder="id"
                    autoComplete="on"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value) }} />
            </FloatingLabel>

            <Button
                size='lg'
                variant="outline-primary"
                className="mt-2 mx-auto"
                active={!loading}
                onClick={() => changePass()}
            >сохранить</Button>
        </div >
    )
}