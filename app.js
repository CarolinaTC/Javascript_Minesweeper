document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let width = 10 // 10 squares width
    let amountOfBombs = 20
    let squares = []

// create Board
function createBoard(){

    // get random bombs
    const arrayOfBombs =  Array(amountOfBombs).fill('bomb')
    const emptyArray = Array(width*width - amountOfBombs).fill('valid')
    const gameArray = emptyArray.concat(arrayOfBombs)
    const shuffleArray = gameArray.sort(() => Math.random()-0.5) // shuffle bombs and empty squares randomly
 


    for(let i = 0; i < width*width; i++) {
        // create 100 divs with unique id
        const square = document.createElement('div')
        square.setAttribute('id', i)
        square.classList.add(shuflledArray[i])
        grid.appendChild(square)
        squares.push(square)

    }

}


createBoard()

})