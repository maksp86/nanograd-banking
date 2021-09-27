import React, { useContext, useState, useEffect } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import Button from 'react-bootstrap/Button'
import { CaretLeftFill } from 'react-bootstrap-icons'
import { isDesktop } from 'react-device-detect'
import Fade from 'react-reveal/Fade'

import logo from '../static/imgs/logo-white-yellow.svg'
import hesoyam from '../static/imgs/hesoyam.gif'

import '../static/css/AuthPage.css'

import { RequestContext } from '../context/RequestContext'
import { AuthContext } from '../context/AuthContext'

import PassView from '../components/AuthPage/PassView'
import ScannerView from '../components/AuthPage/ScannerView'
import { useTitle } from '../hooks/title.hook'

export default function AuthPage(props) {

    const [clicks, setClicks] = useState(0);

    const [scanned, setScanned] = useState(isDesktop)
    const [scannerResult, setScannerResult] = useState(null);

    const [logined, setLogined] = useState(false)

    const auth = useContext(AuthContext)
    const http = useContext(RequestContext)
    const title = useTitle()

    useEffect(() => {
        async function func() {
            try {
                const data = await http.request('/api/user/get', 'POST', { userid: auth.lastid })
                if (data) {
                    if (data.user) {
                        setScanned(true);
                        setScannerResult(data.user)
                        return
                    }
                }
            }
            catch (e) {

            }
        }

        if (auth.lastid)
            func();

        title.set("Вход")
    }, [])


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
            <div className={"vertical-center dark-back" + (logined ? " " + (isDesktop ? " logined-pc" : " logined-mobile") + " unclickable" : "")}>
                <Container fluid="sm" style={{ width: '350px' }}>

                    <Row className="justify-content-center">
                        <Col xs="auto">
                            <div onClick={() => { setClicks(clicks + 1); }}>
                                <Fade
                                    when={!logined}
                                    appear={true}
                                    opposite
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
                                appear={true}
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
                                                onLogin={
                                                    (token, userid) => {
                                                        setLogined(true)
                                                        setTimeout(() => {
                                                            auth.login(token, userid)
                                                        }, 1000)
                                                    }
                                                }
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