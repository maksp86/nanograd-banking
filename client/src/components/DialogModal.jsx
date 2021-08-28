import Button from 'react-bootstrap/Button'

export default function DialogModal(props) {
    return (
        <div className="m-3" style={{ display: "flex", flexDirection: "column" }}>
            <h5>
                {props.message}
            </h5>
            <div className="d-flex flex-row mt-2">
                {props.buttons && props.buttons.map(
                    (val) =>
                    (<Button
                        key={val.text}
                        size='lg'
                        variant={val.primary === true ? "primary" : "outline-primary"}
                        className="mx-2 flex-fill"
                        onClick={val.action}
                    >{val.text}</Button>)
                )}
            </div>
        </div >
    )
}