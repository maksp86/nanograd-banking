import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/esm/Spinner";
import Row from "react-bootstrap/Row";

export default function LoadingModal(props) {
    return (
        <>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <div style={{ height: "300px", display: "flex" }}>
                        <Spinner style={{ height: "70px", width: "70px", margin: "auto 0" }} animation="border" />
                    </div>
                </Col>
            </Row>
        </>
    )
}