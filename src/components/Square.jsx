import React from 'react'
import styled from 'styled-components'

export const Square = styled.div`
    width: 40px;
    height: 40px;
    padding: 10px;
    cursor: ${(props) => (props.disabled ? 'initial' : 'pointer')};
    background-color: ${(props) => (props.disabled ? '#CCC' : '#FFF')};
    border: 1px solid black;
    line-height: 1;
    text-align: center;
    font-size: 18px;
`
