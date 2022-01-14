document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    const flagsLeft = document.querySelector('#flags-left')
    const result = document.querySelector('#result')
    let width = 10 // 10 squares width
    let amountOfBombs = 20
    let squares = []
    let gameOver = false  // boolean flag
    let totalFlags = 0

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
        square.classList.add(shuffleArray[i])
        grid.appendChild(square)
        squares.push(square)

        // normal click
        square.addEventListener('click', function(e){
           click(square)
        })

        // left click
        square.oncontextmenu = function(e){
            e.preventDefault()
            addFlag(square)
        }

    }
    // add numbers to the board
    for(let i = 0; i < squares.length; i++){
        // different ways to check the squares
        let countTotal = 0
        const isLeftEdge = (i % width === 0)
        const isRightEdge = (i === width - 1)

        if (squares[i].classList.contains('valid')){
            if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) countTotal ++
            if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) countTotal ++
            if (i > 10 && squares[i - width].classList.contains('bomb')) countTotal ++
            if (i > 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) countTotal ++
            if (i < 98 && !isRightEdge && squares[i + 1].classList.contains('bomb')) countTotal ++
            if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) countTotal ++ 
            if (i < 88 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) countTotal ++ 
            if (i < 89 && squares[i + width].classList.contains('bomb')) countTotal ++ 
            squares[i].setAttribute('data', countTotal)
 
        }

    }

}


createBoard()

// add totalFlags ---- > right click
function addFlag(square){
    if(gameOver) return
    if (!square.classList.contains('checked') && (totalFlags < amountOfBombs)){
        if(!square.classList.contains('flag')){
            square,classList.add('flag')
            square.innerHTML = '🚩' // image
            totalFlags++
            winnerCheck()
        } else{
            square.classList.remove('flag')
            square.innerHTML = ''
            totalFlags--
        }

    }
}

// define click on squares func
function click(square){
    let currentId = square.id
    // flag implementation
    if (gameOver) return
    if ( square.classList.contains('checked') || square.classList.contains('flag')) return


    if (square.classList.contains('bomb')){
        isGameOver(square) // or a alert or pop-up
    } else {
        let countTotal = square.getAttribute('data') // in case that you click on a number instead of a bomb
        if(countTotal !=0){
            square.classList.add('checked')
            if (countTotal == 1) square.classList.add('one')
            if (countTotal == 2) square.classList.add('two')
            if (countTotal == 3) square.classList.add('three')
            if (countTotal == 4) square.classList.add('four')
            //square.classList.add('checked')
            square.innerHTML = countTotal
            return
        }
        checkSquare(square, currentId)
        
    }
    square.classList.add('checked') // check  after if its not equals to 0 and if its not contain a bomb
}

// check the neighbor squares after square is clicked
function checkSquare(square, currentId){
    const isLeftEdge = (currentId % width === 0)
    const isRightEdge = (currentId % width === width-1)

    setTimeout(() =>{

        if (currentId > 0 && !isLeftEdge) {
            const newId = squares[parseInt(currentId) -1].id
       
            const newSquare = document.getElementById(newId)
            click(newSquare)
          }
          if (currentId > 9 && !isRightEdge) {
            const newId = squares[parseInt(currentId) +1 -width].id
       
            const newSquare = document.getElementById(newId)
            click(newSquare)
          }
          if (currentId > 10) {
            const newId = squares[parseInt(currentId -width)].id
   
            const newSquare = document.getElementById(newId)
            click(newSquare)
          }
          if (currentId > 11 && !isLeftEdge) {
            const newId = squares[parseInt(currentId) -1 -width].id

            const newSquare = document.getElementById(newId)
            click(newSquare)
          }
          if (currentId < 98 && !isRightEdge) {
            const newId = squares[parseInt(currentId) +1].id
         
            const newSquare = document.getElementById(newId)
            click(newSquare)
          }
          if (currentId < 90 && !isLeftEdge) {
            const newId = squares[parseInt(currentId) -1 +width].id

            const newSquare = document.getElementById(newId)
            click(newSquare)
          }
          if (currentId < 88 && !isRightEdge) {
            const newId = squares[parseInt(currentId) +1 +width].id

            const newSquare = document.getElementById(newId)
            click(newSquare)
          }
          if (currentId < 89) {
            const newId = squares[parseInt(currentId) +width].id
 
            const newSquare = document.getElementById(newId)
            click(newSquare)
          }

    }, 10)
}



// GAME OVER
function isGameOver(square){
    alert('BOOOOOOM 💥💥💥💥')
    gameOver = true 

    // show all bombs after game over
    squares.forEach(square => {
        if (square.classList.contains('bomb')){
            square.innerHTML = '💣'
            square.classList.remove('bomb')
            square.classList.add('checked')
        }
    })
}

// winner scenario
function winnerCheck(){
    let totalMatchs = 0
    for (let i = 0; i < squares.length; i++){
        if(squares[i].classList.contains('flags') && squares[i].classList.contains('bomb')){
            totalMatchs ++
        }
        if (totalMatchs === amountOfBombs){
            alert('YOU ARE THE WINNER 🏆🥇🎖️')
            gameOver = true
        }
    }
}

})
// set up a timer 
function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.onload = function () {
    var fiveMinutes = 60 * 5,
        display = document.querySelector('#time');
    startTimer(fiveMinutes, display);
};