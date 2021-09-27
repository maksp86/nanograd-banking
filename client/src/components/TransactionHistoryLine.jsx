import { useContext } from "react";
import { CaretRightFill, ClockFill } from "react-bootstrap-icons";
import { generatePath, useHistory } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { paymentTypes } from "../helpers/funcs";

export default function TransactionHistoryLine(props) {
    const auth = useContext(AuthContext)
    const transaction = props.info;

    const history = useHistory();

    const direction = (transaction.target === auth.currUser.userid) || (transaction.type === 2);
    const userAffected = (transaction.target === auth.currUser.userid) || (transaction.sender === auth.currUser.userid)

    let transactionText = paymentTypes[transaction.type]

    if (transaction.type === 1) {
        if (direction)
            transactionText += " от пользователя "
        else
            transactionText += " пользователю "
    }

    return (
        <div className={"thl unselectable align-items-center px-2" + (transaction.state === -1 ? " text-decoration-line-through" : "")}
            onClick={() => { history.push(generatePath("/history/:id", { id: props.info._id })) }}
        >
            <div>
                <p
                    className="font-bold unselectable m-0 fs-5"
                    style={
                        {
                            lineHeight: '30px',
                            color: (userAffected) && (direction ? "#00AF54" : "#F08282")
                        }
                    }
                >
                    {userAffected ? (direction ? "+" : "-") : ""}{transaction.amount}
                </p>
            </div>
            <div className="fs-5 font-regular" style={{ lineHeight: '30px' }}>
                {transactionText}
                {transaction.state === 0 && <ClockFill className="ml-1" opacity={0.5} />}
            </div>
            <div className="p-0">
                <CaretRightFill />
            </div>
        </div >
    )
}