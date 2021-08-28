export default function AddValidationMsg(props) {
    return (
        <div className="d-flex" style={{ flexDirection: 'column' }}>
            {props.children}
            {(props.err && props.err.value) && <h6 className="my-1 text-danger">{props.err.message}</h6>}
        </div>
    )
}