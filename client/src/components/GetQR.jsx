import { QRCode } from 'react-qrcode-logo';

import logoqr from '../static/imgs/logo-qr.svg'

export default function GetQR(props) {
    return (<div onClick={props.onClick} style={props.style}>
        <QRCode
            size={props.size - 20}
            value={JSON.stringify(props.data)}
            logoImage={logoqr}
            logoWidth={(props.size - 20) * 0.28}
            logoHeight={(props.size - 20) * 0.28}
            ecLevel="Q"
            eyeRadius={[
                [10, 0, 0, 0], // top/left eye
                [0, 10, 0, 0], // top/right eye
                [0, 0, 0, 10], // bottom/left
            ]}
        /></div>)
}