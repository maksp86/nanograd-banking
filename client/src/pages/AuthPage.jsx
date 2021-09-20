import React, { useContext, useState, useCallback, useEffect, useRef } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Spinner from 'react-bootstrap/Spinner'
import { Switch, Route, Redirect } from 'react-router-dom'
import { CaretLeftFill } from 'react-bootstrap-icons'
import { isDesktop } from 'react-device-detect'
import Fade from 'react-reveal/Fade'

import logo from '../static/imgs/logo-white-yellow.svg'
import hesoyam from '../static/imgs/hesoyam.gif'

import '../static/css/AuthPage.css'

import { getTimeGreeting } from '../helpers/funcs'

import { useHttp } from '../hooks/http.hook'
import { useValidation } from '../hooks/validation.hook'

import { RequestContext } from '../context/RequestContext'
import { AuthContext } from '../context/AuthContext'

import ToggleSwitch from '../components/Switch'
import PassView from '../components/AuthPage/PassView'
import ScannerView from '../components/AuthPage/ScannerView'
import Reader from '../components/Reader'

export default function AuthPage(props) {
    document.body.style.backgroundColor = "#2D3142"
    document.body.style.color = "black"

    const [clicks, setClicks] = useState(0);
    const [currPage, setCurrPage] = useState(null);

    const [scanned, setScanned] = useState(isDesktop)
    const [scannerResult, setScannerResult] = useState(null);

    // useEffect(() => {
    //     console.log("scanned, scannerResult")
    //     setCurrPage(scanned ?
    //         <PassView
    //             user={scannerResult}
    //         />
    //         :
    //         <ScannerView onResult={
    //             (e) => {
    //                 setScanned(true);
    //                 setScannerResult(e);
    //             }
    //         }
    //         />)
    // }, [scanned, scannerResult])


    function BackButton() {
        return <Button
            onClick={() => {
                setScanned(false);
                // validation.unsetAll();
            }}
            className="rounded-circle"
            variant="outline"
            size='lg'
        >
            <CaretLeftFill />
        </Button>
    }

    return (
        <div>
            <div className="vertical-center">
                <Container fluid="sm" style={{ width: '350px' }}>

                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <div onClick={() => { setClicks(clicks + 1); }}>
                                <Fade
                                    bottom
                                    distance="5%">
                                    <Image className="mb-4 unselectable" style={{ minHeight: "100px", minWidth: "300px" }} src={(clicks === 6) ? hesoyam : logo} fluid />
                                </Fade>
                            </div>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <Fade
                                duration={500}
                                delay={100}
                                right={scanned}
                                left={!scanned}
                                spy={scanned}
                                exit={false}
                                distance="3%">
                                <Container
                                    fluid="sm"
                                    className="p-1"
                                    style={
                                        {
                                            backgroundColor: 'white',
                                            borderRadius: '35px',
                                            minWidth: '300px',
                                            boxShadow: "0px 0px 16px 16px rgb(255 255 255 / 7%)"
                                        }
                                    }>
                                    {scanned && (<BackButton />)}
                                    <div className="px-3 py-3">
                                        {scanned ?
                                            <PassView
                                                user={scannerResult}
                                            />
                                            :
                                            <ScannerView onResult={
                                                (e) => {
                                                    console.log(e)
                                                    setScanned(true);
                                                    setScannerResult(e);
                                                }
                                            }
                                            />}
                                    </div>
                                </Container>
                            </Fade>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    )
}