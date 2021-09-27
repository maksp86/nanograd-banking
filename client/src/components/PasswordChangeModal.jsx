import { useContext, useState, useEffect } from "react"

import Button from "react-bootstrap/Button"

import { AuthContext } from "../context/AuthContext"
import { ModalContext } from "../context/ModalContext"
import ErrorModal from "./ErrorModal"
import { useValidation } from "../hooks/validation.hook"
import Field from "./AuthPage/Field"
import { useHttp } from "../hooks/http.hook"


export default function PasswordChangeModal(props) {
    const validation = useValidation()
    const auth = useContext(AuthContext)
    const { request, error, clearError, loading } = useHttp()
    const modal = useContext(ModalContext)

    const [password, setPassword] = useState("")

    async function changePass() {
        try {
            const data = await request('/api/user/edit', 'POST', { token: auth.token, userid: props.userid, password })
            if (data) {
                modal.setContent(<ErrorModal context={modal} error={{ message: data.message }} />)
                return
            }
        }
        catch (e) {
        }
    }

    function onKeyPressed(evt) {
        if (evt.key === 'Enter') {
            changePass();
        }
    }

    useEffect(() => {
        if (error) {
            if (error.errors) {
                validation.importStates(error.errors)
            }
            else
                modal.setContent(<ErrorModal context={modal} error={{ message: error.message || "Ошибка смены пароля" }} />)
            clearError()
        }
    }, [error])

    return (
        <div className="m-3" style={{ display: "flex", flexDirection: "column" }}>
            {props.userid && (<h5 className="mb-2 font-medium"><span className="unselectable font-regular">Изменение пароля для </span>{props.userid}</h5>)}

            {/* <FloatingLabel
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
            </FloatingLabel> */}

            <Field
                placeholder="введите новый пароль"
                name="password"
                value={password}
                onChange={(e) => { setPassword(e); validation.unsetState("password") }}
                onKeyPress={onKeyPressed}
                disabled={loading}
                validation={validation.states["password"]}
            />

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