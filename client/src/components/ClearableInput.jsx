import React from 'react'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'

import { X } from 'react-bootstrap-icons'


export default function ClearableInput(props) {
    return (
        <InputGroup
            className={"m-0 " + props.className }>
            <FormControl
                value={props.value}
                onChange={(e) => { props.onChange(props.type === "number" ? e.target.valueAsNumber : e.target.value) }}
                placeholder={props.placeholder}
                className="unselectable"
                aria-label={props.placeholder}
                type={ props.type || "text" }
            />
            <Button
                variant="outline-primary"
                onClick={() => {
                    props.onChange("")
                }}
            >
                <X size={20} />
            </Button>
            {props.children}
        </InputGroup >
    )
}