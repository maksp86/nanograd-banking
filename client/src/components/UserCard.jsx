import React from 'react'

import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'

import { Trash, Key } from 'react-bootstrap-icons'

import { accesslevelNames } from '../helpers/funcs'

import GetQR from '../components/GetQR'

export default function UserCard(props) {
    if (props.user)
        return (
            <Card onClick={(e) => { console.log(e); props.onClick(); }} style={{ width: props.width || '200px' }}>
                <Card.Body>
                    <Card.Title className="break-word">{props.user.surname} {props.user.name} {props.user.patronymic}</Card.Title>

                    {props.qrsize ? (<div className="d-flex flex-column">
                        <GetQR style={{ margin: "0 auto" }} size={props.qrsize} data={{ userid: props.user.userid }} />
                        <h5 style={{ margin: "0 auto" }}>{props.user.userid}</h5>
                    </div>) : (<h6 className="unselectable font-regular">{props.user.userid}</h6>)}

                    {props.showlevel === true && (<p className="unselectable mx-1 my-0 fs-5" style={{ lineHeight: '30px' }}>
                        <Badge pill bg="primary">{accesslevelNames[props.user.accesslevel]}</Badge>
                    </p>)}
                    {props.actions === true && (<>
                        <Button
                            className="rounded-circle p-1 m-1"
                            style={{ height: "34px", width: "34px" }}
                            variant="outline-primary"
                            onClick={(e) => { e.stopPropagation(); props.onRemove(props.user) }}>
                            <Trash />
                        </Button>
                        <Button
                            className="rounded-circle p-1 m-1"
                            style={{ height: "34px", width: "34px" }}
                            variant="outline-primary"
                            onClick={(e) => { e.stopPropagation(); props.onPassChange(props.user) }}>
                            <Key />
                        </Button>
                    </>
                    )}
                </Card.Body>
            </Card>
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