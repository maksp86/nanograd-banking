import Button from 'react-bootstrap/Button'

export default function ErrorModal(props) {
    return (
        <div className="m-3" style={{ display: "flex", flexDirection: "column" }}>
            <h5>
                {props.error.message}
            </h5>
            <Button
                size='lg'
                variant="outline-primary"
                className="btn-block mt-2 mx-auto"
                onClick={props.onClose || (() => { props.context.close(); })}
            >закрыть</Button>
        </div >
    )
}