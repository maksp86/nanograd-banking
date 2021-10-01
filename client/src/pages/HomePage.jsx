import React, { useContext, useEffect } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import '../static/css/CabinetPage.css'
import 'moment/locale/ru'

import GetQR from '../components/GetQR'
import QrModal from '../components/QrModal'
import { AuthContext } from '../context/AuthContext'
import { getTimeGreeting } from '../helpers/funcs'
import { ModalContext } from '../context/ModalContext'
import { useTitle } from '../hooks/title.hook'

export default function HomePage(props) {
    const { currUser } = useContext(AuthContext)
    const modal = useContext(ModalContext)
    const title = useTitle()

    useEffect(() => {
        title.set("Главная")
    }, [])

    return (
        <>
            <Row className="align-items-center">
                <Col md="6" lg="4">
                    <div>
                        <h2 className="font-medium mt-4 mb-2 mx-2 unselectable" >{getTimeGreeting()},</h2>
                        <h2 className="font-regular mt-2 mb-3 mx-2">{currUser.name}</h2>
                    </div>
                </Col>

                <Col md="6" lg="5">
                    <h3 className="mx-2 font-light my-0">
                        <span className="unselectable">баланс: </span>
                        {currUser.balance}
                        <span className="unselectable"> нанолисиков</span>
                    </h3>
                </Col>

                <Col md="12" lg="3">
                    <div
                        style={{ width: 'fit-content', margin: '0 auto' }}
                    >
                        <div className="my-4">
                            <GetQR
                                data={{ userid: currUser.userid }}
                                onClick=
                                {
                                    () => {
                                        modal.show(<QrModal context={modal} data={{ userid: currUser.userid }} />)
                                    }
                                } size={200} />
                        </div>
                    </div>
                </Col>
            </Row>
        </>
    )

}
