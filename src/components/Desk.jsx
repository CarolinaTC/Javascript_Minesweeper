import React from 'react'
import styled from 'styled-components'

export const Desk = styled.div`
    margin: 32px;
    width: ${(props) => `${props.boardSize * 40 + 2}px`};
    height: 402px;
    border: 1px solid black;
    display: flex;
    flex-wrap: wrap;
`
