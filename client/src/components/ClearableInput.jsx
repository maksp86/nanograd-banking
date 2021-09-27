import React from 'react'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'

import { X } from 'react-bootstrap-icons'


export default function ClearableInput(props) {
    var { value, placeholder, type, children, className, onChange, ...other } = props;
    return (
        <InputGroup
            className={"m-0 " + className}>
            <FormControl
                value={value}
                onChange={(e) => { onChange(props.type === "number" ? e.target.valueAsNumber : e.target.value) }}
                placeholder={placeholder}
                className="unselectable"
                aria-label={placeholder}
                type={type || "text"}
                {...other}
            />
            <Button
                variant="outline-primary"
                onClick={() => {
                    onChange("")
                }}
            >
                <X size={20} />
            </Button>
            {children}
        </InputGroup >
    )
}