import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { Desk } from '../src/components/desk'
import { Square } from '../src/components/square'
import { Mine } from '../src/components/mine'
import { Flag } from '../src/components/flag'

const Title = styled.h1`
    margin: 32px;
`

const App = () => (
    <>
        <Title>Minesweeper</Title>
        <Desk boardSize={10}>
            {[...Array(100).keys()].map((i) => (
                <Square key={i} disabled={i === 55 || i === 10}>
                    {i === 10 && <Mine />}
                    {i === 25 && <Flag />}
                    {i === 77 ? '4' : ''}
                </Square>
            ))}
        </Desk>
    </>
)

ReactDOM.render(<App />, document.getElementById('root'))
