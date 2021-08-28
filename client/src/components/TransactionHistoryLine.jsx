import { useContext } from "react";
import { CaretRightFill } from "react-bootstrap-icons";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { generatePath, useHistory } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { paymentTypes } from "../helpers/funcs";

export default function TransactionHistoryLine(props) {
    const auth = useContext(AuthContext)
    const transaction = props.info;

    const history = useHistory();

    const direction = (transaction.target === auth.currUser.userid) || (transaction.type === 2);

    let transactionText = paymentTypes[transaction.type]

    if (transaction.type === 1) {
        if (direction)
            transactionText += " от пользователя "
        else
            transactionText += " пользователю "
    }

    return (
        <div className="thl unselectable"
            onClick={() => { history.push(generatePath("/history/:id", { id: props.info._id })) }}
        >
            <Row className="align-items-center h-100 pl-2">
                <Col xs={3} md={2} lg={2} xl={1} className="align-self-center">
                    <p
                        className="font-bold unselectable m-0 fs-5"
                        style={
                            {
                                lineHeight: '30px',
                                color: direction ? "#00AF54" : "#F08282"
                            }
                        }
                    >
                        {direction ? "+" : "-"}{transaction.amount}
                    </p>
                </Col>

                <Col xs={7} md={9} lg={9} xl={10} className="align-self-center text-truncate fs-5 font-regular" style={{ lineHeight: '30px' }}>
                    {/* <p
                                className="font-regular m-0 fs-5 float-start  d-block"
                                style={{ lineHeight: '30px' }}
                            >
                            </p> */}
                    {transactionText}
                </Col>

                <Col xs={2} md={1} lg={1} xl={1} className="p-0">
                    <CaretRightFill />
                </Col>
            </Row>
        </div>
    )
}