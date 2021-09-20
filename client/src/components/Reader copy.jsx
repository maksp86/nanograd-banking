import React, { Component } from 'react'

import { Check2, X } from 'react-bootstrap-icons'

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
            scanAccepted: false
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

    handleScan = data => {
        if (data) {
            this.setState({
                result: data,
                visibility: false,
                scanAccepted: this.props.onPreReaded(data)
            })

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
    }

    ShowIcon = (props) => {
        if (props.accepted)
            return (<Check2 className='scalableIcon' color="green" size={90} />);
        else
            return (<X className='scalableIcon' color="red" size={90} />);

    }

    render() {
        //if (this.props.needScan) {
        //console.log('need')
        if (this.state.visibility)
            return (
                <div onClick={this.handleClick}>
                    <QrReader
                        className="mt-2 mb-3 scanner"
                        delay={500}
                        onError={this.handleError}
                        onScan={this.handleScan}
                        style={readerPreviewStyle}
                        facingMode={this.state.facingMode ? "environment" : "user"}
                    />
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
                        <this.ShowIcon accepted={this.state.scanAccepted} />
                    </div>
                </div>
            )
        // } else {
        //     console.log('no need')
        //     return (<> </>)
        // }
    }
}

export default Reader