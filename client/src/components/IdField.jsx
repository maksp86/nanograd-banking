import { useContext } from 'react'
import Button from 'react-bootstrap/Button'

import { UpcScan } from 'react-bootstrap-icons'
import ScannerModal from './ScannerModal'
import { ModalContext } from '../context/ModalContext'
import ClearableInput from './ClearableInput'

export default function IdField(props) {
    const modal = useContext(ModalContext)

    return (
        <ClearableInput
            placeholder={props.placeholder || "id получателя"}
            value={props.value}
            onChange={(e) => {
                props.onChange(e)
            }}>
            <Button
                variant="outline-primary"
                onClick={() => {
                    modal.show(<ScannerModal
                        context={modal}
                        validator={props.validator}
                        onSuccessfulScan={
                            (data) => {
                                props.onChange(data);
                                console.log(data)
                            }} />)
                }}
            >
                <UpcScan className="mx-2" size={20} />
            </Button>
        </ClearableInput>
    )
}