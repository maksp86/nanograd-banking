import React, { Component } from 'react'

import { Check2, X } from 'react-bootstrap-icons'
import Spinner from 'react-bootstrap/esm/Spinner'
import Fade from 'react-reveal/Fade'

import QrReader from 'react-qr-reader'

import '../static/css/Reader.css'

const readerPreviewStyle = {
    height: 250,
    width: 250,
    display: 'flex'
}

class Reader extends Component {
    constructor(props) {
        super(props)
        this.state = {
            result: null,
            visibility: true,
            facingMode: true,
            scanAccepted: false,
            loading: false
        }

    }

    onTimer = () => {
        clearInterval(this.sendTimer)

        if (this.state.scanAccepted) {
            if (this.props.onReaded)
                this.props.onReaded({ result: this.state.result, })
        }
        else
            this.setState({
                result: null,
                visibility: true,
                scanAccepted: false
            })
    }

    handleScan = async (data) => {
        if (data) {
            if (this.state.loading)
                return

            this.setState({ loading: true })

            this.setState({
                result: data,
                visibility: false
            })

            var accepted = await this.props.onPreReaded(data)
            this.setState({ loading: false, scanAccepted: accepted })

            this.sendTimer = setTimeout(this.onTimer, 1000)
        }
    }
    handleError = err => {
        if (err.name === "NotAllowedError") {
            alert("Для работы сканера необходим доступ к камере")
        }
        else
            console.log("READER ERROR", err)
    }

    handleClick = () => {
        this.setState({ facingMode: !this.state.facingMode })
        // this.handleScan("{\"userid\": 12345678}")
    }

    ShowIcon = (props) => {
        if (props.accepted)
            return (<Check2 className='scalableIcon' color="green" size={90} />);
        else
            return (<X className='scalableIcon' color="red" size={90} />);

    }

    render() {
        if (this.state.visibility)
            return (
                <div onClick={this.handleClick}>
                    <Fade
                        delay={500}
                        duration={300}
                        spy={this.state.facingMode}
                        appear={true}
                    >
                        <QrReader
                            className="mt-2 mb-3 scanner"
                            delay={500}
                            onError={this.handleError}
                            onScan={this.handleScan}
                            style={readerPreviewStyle}
                            facingMode={this.state.facingMode ? "environment" : "user"}
                        />
                    </Fade>
                </div>
            )
        else
            return (
                <div
                    className="mt-2 mb-3"
                    style={readerPreviewStyle}
                >

                    <div
                        style={{ width: 'fit-content', margin: 'auto' }}
                    >
                        {
                            this.state.loading ?
                                <Spinner style={{ height: "70px", width: "70px", margin: "auto 0" }} animation="border" />
                                :
                                <this.ShowIcon accepted={this.state.scanAccepted} />
                        }
                    </div>
                </div>
            )
    }
}

// function Reader(props) {
//     const [result, setResult] = useState(null);
//     const resultRef = useRef();
//     resultRef.current = result;

//     const [visibility, setVisibility] = useState(true);
//     const [facingMode, setFacingMode] = useState(true);

//     const [scanAccepted, setScanAccepted] = useState(false);
//     const scanAcceptedRef = useRef();
//     scanAcceptedRef.current = scanAccepted;

//     const [sendTimer, setSendTimer] = useState();

//     function onTimer() {
//         console.log("onTimer")
//         clearTimeout(sendTimer)
//         setSendTimer(null)

//         if (scanAcceptedRef.current) {
//             console.log("scanAccepted", scanAcceptedRef.current)
//             console.log("result", resultRef.current)
//             if (props.onReaded)
//                 props.onReaded({ result: resultRef.current })
//         }
//         else {
//             setResult(null)
//             setVisibility(true)
//             setScanAccepted(false)
//         }
//     }

//     function ShowIcon(props) {
//         if (props.accepted)
//             return (<Check2 className='scalableIcon' color="green" size={90} />);
//         else
//             return (<X className='scalableIcon' color="red" size={90} />);

//     }

//     function handleScan(data) {
//         if (data) {
//             setResult(data)
//             setVisibility(false)
//             const accepted = props.onPreReaded(data);
//             setScanAccepted(accepted)
//             console.log("handleScan onPreReaded", accepted)

//             setSendTimer(setTimeout(onTimer, 1000))
//         }
//     }
//     function handleError(err) {
//         if (err.name === "NotAllowedError") {
//             alert("Для работы сканера необходим доступ к камере")
//         }
//         else
//             console.log("READER ERROR", err)
//     }

//     if (visibility)
//         return (
//             <div onClick={() => setFacingMode(!facingMode)}>
//                 <QrReader
//                     className="mt-2 mb-3 scanner"
//                     delay={500}
//                     onError={handleError}
//                     onScan={handleScan}
//                     style={readerPreviewStyle}
//                     facingMode={facingMode ? "environment" : "user"}
//                 />
//             </div>
//         )
//     else
//         return (
//             <div
//                 className="mt-2 mb-3"
//                 style={readerPreviewStyle}
//             >

//                 <div
//                     style={{ width: 'fit-content', margin: 'auto' }}
//                 >
//                     <ShowIcon accepted={scanAccepted} />
//                 </div>
//             </div>
//         )
// }

export default Reader