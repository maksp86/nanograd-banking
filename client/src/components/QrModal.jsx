import Button from 'react-bootstrap/Button'

import GetQR from '../components/GetQR'

export default function QrModal(props) {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <GetQR
                style={{ margin: "0 auto" }}
                size={300}
                data={props.data}
            />
            <Button
                size='lg'
                variant="outline-primary"
                className="btn-block mt-2 mx-auto"
                onClick={() => { props.context.close() }}
            >закрыть</Button>
        </div>
    )
}