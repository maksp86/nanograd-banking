import Button from "react-bootstrap/esm/Button";
import Reader from "./Reader";

export default function ScannerModal(props) {
    return (
        <div className="mx-2" style={{ display: "flex", flexDirection: "column" }}>
            <h4 className="mx-auto my-2 unselectable">
                Отсканируйте бейдж
            </h4>
            <div style={{ margin: "0 auto" }}>
                <Reader onReaded={
                    (data) => {
                        props.context.close()
                    }}

                    onPreReaded={
                        (data) => {
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed && parsed.userid) {
                                    props.onSuccessfulScan(parsed);
                                    return true;
                                }
                                else
                                    return false;

                            }
                            catch (e) { return false; }
                        }
                    }
                />
            </div>
            <Button
                size='lg'
                variant="outline-primary"
                className="btn-block mt-2 mx-auto"
                onClick={() => { props.context.close() }}
            >отмена</Button>
        </div>
    )
}