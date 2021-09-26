import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'

export default function LoadingButton(props) {
    var { loading, children, ...other } = props;

    return (
        <Button {...other} disabled={loading}>
            {loading ?
                <Spinner
                    as="span"
                    animation="border"
                />
                :
                children}
        </Button>
    )
}