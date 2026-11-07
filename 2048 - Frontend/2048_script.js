var timer
var target = 8
var timeList = document.getElementById("milestones")
var startMilliseconds
var [hours, minutes, seconds, milliseconds] = [0, 0, 0, 0]
var currentWindow = "nameScreen"
var userName = null;

//for deployment
var backendApiUrl = "https://gp3gliyhzh.execute-api.ap-south-1.amazonaws.com/prod/hello"

//for local testing
// var backendApiUrl = "http://localhost:8080/leaderboard"

updateLeaderboard()
function acceptName() {
    // Get the value from the input field
    let inputField = document.querySelector('.nameInput');
    userName = inputField.value.trim();

    if (userName === "") {
        alert("Please enter a name.");
        return;
    }

    document.getElementsByClassName("nameScreen")[0].addEventListener('transitionend', function (event) {
        if (event.propertyName === "background-color" || event.propertyName === "backdrop-filter") {
            document.getElementsByClassName("nameScreen")[0].style.display = "none";
        }
    });
    // Hide the name screen and show the menu or play section
    document.getElementsByClassName("namePopUp")[0].style.display = "none";
    document.getElementsByClassName("nameScreen")[0].classList.add("nameScreenBlurOut");
    addListeners()


    // Clear the input field for future use
    inputField.value = "";

    // Optionally, you can update the UI to show the name (if needed)
    console.log("User Name:", userName);
}

function toggleMenu() {
    document.body.classList.toggle("add-padding")
    document.getElementsByClassName("menuScreen")[0].classList.toggle("menu-shift")
}

async function updateLeaderboard() {
    disableRadioButtonSelectionUsingArrowKeys()
    const leaderboard = document.getElementById('leaderboard').querySelector('tbody');
    const milestone = document.querySelector('input[name="milestone"]:checked').value;
    const no_data_message = document.getElementById('no-data-message');
    if (no_data_message != undefined)
        no_data_message.style.display = 'none';
    leaderboard.innerHTML = '';

    let leaderboardData = []

    let reqBody = {
        "requestType": "getLeaderboard",
        "requestData": {
            "milestone": milestone
        }
    }
    let responseBody = await fetch(backendApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
    }).catch((error) => console.error('Error:', error));

    leaderboardData = await responseBody.json();
    leaderboardData = leaderboardData["content"]

    for (let i = 0; i < leaderboardData.length; i++) {
        var row = document.createElement('tr');
        var rankCell = document.createElement('td');
        var usernameCell = document.createElement('td');
        var timeCell = document.createElement('td');
        rankCell.textContent = i + 1;
        usernameCell.textContent = leaderboardData[i]["userName"] || "Not Found";
        timeCell.textContent = getTimeInHoMiSeMilFromMilliseconds(leaderboardData[i]["timeTaken"]) || "Not Found";
        row.appendChild(rankCell);
        row.appendChild(usernameCell);
        row.appendChild(timeCell);
        leaderboard.appendChild(row);
    }
}

//This event handler listenes to the whole window for |W|A|S|D| / Arrow key presses and starts/stops timer
function addListeners() {
    window.addEventListener('keydown', (e) => {
        switch (e.keyCode) {
            case 87:
            case 38:    //console.log("UP");
                if (moveUp() == 1)
                    getRandom()
                break;
            case 65:
            case 37:    //console.log("LEFT");
                if (moveLeft() == 1)
                    getRandom()
                break;
            case 83:
            case 40:    //console.log("DOWN");
                if (moveDown() == 1)
                    getRandom()
                break;
            case 68:
            case 39:    //console.log("RIGHT");
                if (moveRight() == 1)
                    getRandom()
                break;
            default: break;
        }

        startTimer()
        // disableRadioButtonSelectionUsingArrowKeys()

        if (isGameOver()) {
            alert("Game Over")
            clearInterval(timer)
            console.log("Timer Stopped")
        }
    })
    initDPadControls()
    getRandom();
}

function startTimer() {
    if (timer == undefined) {
        startMilliseconds = Date.now()
        console.log("Timer Started")
        timer = setInterval(() => {
            tick()
        }, 10);
    }
}

function tick() {
    // if (milliseconds == 990) {
    //     milliseconds = -10
    //     seconds++
    //     if (seconds == 60) {
    //         seconds = 0
    //         minutes++
    //         if (minutes == 60) {
    //             minutes = 0
    //             hours++
    //         }
    //     }
    // }

    // milliseconds+=10
    // if (milliseconds == 999) {
    //     milliseconds = -1
    //     seconds++
    //     if (seconds == 60) {
    //         seconds = 0
    //         minutes++
    //         if (minutes == 60) {
    //             minutes = 0
    //             hours++
    //         }
    //     }
    // }

    // milliseconds++
    document.getElementsByClassName("timeEnclosure")[0].innerHTML = getTimeInHoMiSeMilFromMilliseconds(getElapsedTimeInMilliseconds())
}

function getElapsedTimeInMilliseconds() {
    // return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
    return Date.now() - startMilliseconds;
}

function getTimeInHoMiSeMilFromMilliseconds(totalMs) {
    let mll = Math.floor(totalMs % 1000)
    let ss = Math.floor((totalMs / 1000) % 60)
    let mm = Math.floor((totalMs / (1000 * 60)) % 60)
    let hh = Math.floor(totalMs / (1000 * 60 * 60))
    return getHoMiSeMilDisplayString(hh, mm, ss, mll)
}

function getHoMiSeMilDisplayString(hh = hours, mm = minutes, ss = seconds, mll = milliseconds) {
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}:${mll.toString().padStart(3, "0")}`
}

//To create a new 2D array for the board simulation: 
var board = new Array(4)
var line
for (i = 0; i < 4; i++) {
    line = new Array(4)
    for (j = 0; j < 4; j++) {
        line[j] = 0;
    }
    board[i] = line;
}
// board=pushBoard()

//This generates random 2 or 4 values in random positions which are empty and syncs the board
var randX, randY, option
var failed
function getRandom() {
    failed = 1
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            if (board[i][j] == 0)
                failed = 0
        }
    }

    if (failed == 1)
        return

    //This generates a random position in the board
    do {
        randX = Math.floor(Math.random() * 4 + 0)
        randY = Math.floor(Math.random() * 4 + 0)
    } while (board[randY][randX] != 0)

    //This generates a random number 2 or 4
    option = Math.floor(Math.random() * 2 + 1) * 2
    board[randY][randX] = option //This assigns the random number to the random position in the board
    syncBoard()
}

//This generates the playing board in HTML
var playboard = document.getElementById("playboard")
var x = 0, y = 0
var numberboxArray = [[], [], [], []]
var numberbox

for (i = 0; i < 4; i++) {
    x = 0
    for (j = 0, x = 0; j < 4; j++) {
        numberbox = document.createElement("div")
        numberbox.className = "number-box"
        numberbox.innerHTML = "0"
        numberbox.style.top = `${y}px`
        numberbox.style.left = `${x}px`
        numberboxArray[i].push(numberbox);

        playboard.appendChild(numberbox)
        x += 4
    }
    y += 4
}
// syncBoard()

//This syncs the HTML board with 2D array values and updates scoreboard with milestones
function syncBoard() {
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            numberboxArray[i][j].innerHTML = `${board[i][j]}`

            if (board[i][j] != 0)
                numberboxArray[i][j].style.visibility = "visible";
            else
                numberboxArray[i][j].style.visibility = "hidden";

            if (board[i][j] == 0)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 250, 250)";
            else if (board[i][j] == 2)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 200, 200)";
            else if (board[i][j] == 4)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 150, 150)";
            else if (board[i][j] == 8)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 100, 100)";
            else if (board[i][j] == 16)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 50, 50)";
            else if (board[i][j] == 32)
                numberboxArray[i][j].style.backgroundColor = "rgb(200, 200, 255)";
            else if (board[i][j] == 64)
                numberboxArray[i][j].style.backgroundColor = "rgb(150, 150, 255)";
            else if (board[i][j] == 128)
                numberboxArray[i][j].style.backgroundColor = "rgb(100, 100, 255)";
            else if (board[i][j] == 256)
                numberboxArray[i][j].style.backgroundColor = "rgb(150, 100, 150)";
            else if (board[i][j] == 512)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 255, 150)";
            else if (board[i][j] == 1024)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 200, 100)";
            else if (board[i][j] == 2048)
                numberboxArray[i][j].style.backgroundColor = "rgb(255, 150, 50)";
        }
    }

    // Logic to update the scoreboard and send the updated score to the server
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            if (board[i][j] == target) {
                timeList.innerHTML += `<li>${target.toString().padStart(4, "0")} > ${getTimeInHoMiSeMilFromMilliseconds(getElapsedTimeInMilliseconds())}</li>`

                if (target >= 32) {
                    let reqBody = {
                        "requestType": "updateLeaderboard",
                        "requestData": {
                            "milestone": target.toString(),
                            "userScoreData": {
                                "userName": userName,
                                "timeTaken": getElapsedTimeInMilliseconds()
                            }
                        }
                    }


                    fetch(backendApiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(reqBody)
                    })
                        .then(() => updateLeaderboard())
                        .catch((error) => console.error('Error:', error));
                }

                target = target * 2;
            }
        }
    }
}

//This function checks if furthur movements can be made AKA gameover condition
// let board2, gameOver
function isGameOver() {
    // console.log("board inside gameover: ", board);
    var gameOver = true
    var board2 = copyBoard(board)
    // console.log("board2: ", board2);
    // console.log("board: ", board);
    // console.log("board2: ", board2);

    if (moveUp() == 1)
        gameOver = false

    board = copyBoard(board2)
    if (moveLeft() == 1)
        gameOver = false

    board = copyBoard(board2)
    if (moveDown() == 1)
        gameOver = false

    board = copyBoard(board2)
    if (moveRight() == 1)
        gameOver = false

    board = copyBoard(board2)


    // console.log("board before moveup in gameover: ", board);
    // console.log("Move Up -> ",moveUp());
    // board = board2
    // console.log("board before moveleft in gameover: ", board);
    // console.log("Move Left -> ",moveLeft());
    // board = board2
    // console.log("board before movedown in gameover: ", board);
    // console.log("Move Down -> ",moveDown());
    // board = board2
    // console.log("board before moveright in gameover: ", board);
    // console.log("Move Right -> ",moveRight());

    // board = board2

    return gameOver
}

function copyBoard(boardObj) {
    var boardCopy = [[], [], [], []]

    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            boardCopy[i][j] = boardObj[i][j]
        }
    }

    return boardCopy
}

//These are movement functions
function moveUp() {
    // console.log(board);
    flag = 0 //To check whether there is any movement
    for (i = 0; i < 4; i++) {//Iterating by columns for snapping
        for (j = 0; j < 3; j++) {
            if (board[j][i] == 0)
                continue

            for (k = j + 1; k < 4; k++) {
                if (board[j][i] == board[k][i]) {
                    if (board[j][i] != 0)
                        flag = 1

                    board[j][i] = board[k][i] * 2
                    board[k][i] = 0
                    j = k
                    break
                }
                else if (board[j][i] != board[k][i] && board[k][i] != 0)
                    break
            }
        }
    }
    for (i = 0; i < 4; i++) {//Iterating by columns for moving
        for (j = 0; j < 3; j++) {
            if (board[j][i] == 0) {
                for (k = j + 1; k < 4; k++) {
                    if (board[k][i] != 0)
                        flag = 1
                    board[k - 1][i] = board[k][i]
                    // console.log("Yo");
                }
                board[3][i] = 0
            }
            for (k = j + 1; k < 4; k++) {
                if (board[k][i] != 0)
                    break;
            }
            if (board[j][i] == 0 && k != 4)
                j--;
        }
    }
    // if (flag==1)
    // getRandom()

    return flag

    //syncBoard()
    // console.log(board);
}

function moveDown() {
    // console.log(board);
    flag = 0 //To check whether there is any movement
    for (i = 0; i < 4; i++) {//Iterating by columns for snapping
        for (j = 3; j > 0; j--) {
            if (board[j][i] == 0)
                continue

            for (k = j - 1; k >= 0; k--) {
                if (board[j][i] == board[k][i]) {
                    if (board[j][i] != 0)
                        flag = 1

                    board[j][i] = board[k][i] * 2
                    board[k][i] = 0
                    j = k
                    break
                }
                else if (board[j][i] != board[k][i] && board[k][i] != 0)
                    break
            }
        }
    }
    for (i = 0; i < 4; i++) {//Iterating by columns for moving
        for (j = 3; j > 0; j--) {
            if (board[j][i] == 0) {
                for (k = j - 1; k >= 0; k--) {
                    if (board[k][i] != 0)
                        flag = 1
                    board[k + 1][i] = board[k][i]
                }
                board[0][i] = 0
            }
            for (k = j - 1; k >= 0; k--) {
                if (board[k][i] != 0)
                    break;
            }
            if (board[j][i] == 0 && k != -1)
                j++;
            // console.log("Yo j");
        }
        // console.log("Yo i");
    }
    // if (flag==1)
    // getRandom()

    return flag

    //syncBoard()
    // console.log(board);
}

function moveLeft() {
    // console.log(board);
    flag = 0 //To check whether there is any movement
    for (i = 0; i < 4; i++) {//Iterating by rows for snapping
        for (j = 0; j < 3; j++) {
            if (board[i][j] == 0)
                continue

            for (k = j + 1; k < 4; k++) {
                if (board[i][j] == board[i][k]) {
                    if (board[i][j] != 0)
                        flag = 1

                    board[i][j] = board[i][k] * 2
                    board[i][k] = 0
                    j = k
                    break
                }
                else if (board[i][j] != board[i][k] && board[i][k] != 0)
                    break
            }
        }
    }
    for (i = 0; i < 4; i++) {//Iterating by columns for moving
        for (j = 0; j < 3; j++) {
            if (board[i][j] == 0) {
                for (k = j + 1; k < 4; k++) {
                    if (board[i][k] != 0)
                        flag = 1
                    board[i][k - 1] = board[i][k]
                    // console.log("Yo");
                }
                board[i][3] = 0
            }
            for (k = j + 1; k < 4; k++) {
                if (board[i][k] != 0)
                    break;
            }
            if (board[i][j] == 0 && k != 4)
                j--;
        }
    }
    // if (flag==1)
    // getRandom()

    return flag

    //syncBoard()
    // console.log(board);
}

function moveRight() {
    // console.log(board);
    flag = 0 //To check whether there is any movement
    for (i = 0; i < 4; i++) {//Iterating by columns for snapping
        for (j = 3; j > 0; j--) {
            if (board[i][j] == 0)
                continue

            for (k = j - 1; k >= 0; k--) {
                if (board[i][j] == board[i][k]) {
                    if (board[i][j] != 0)
                        flag = 1

                    board[i][j] = board[i][k] * 2
                    board[i][k] = 0
                    j = k
                    break
                }
                else if (board[i][j] != board[i][k] && board[i][k] != 0)
                    break
            }
        }
    }
    for (i = 0; i < 4; i++) {//Iterating by columns for moving
        for (j = 3; j > 0; j--) {
            if (board[i][j] == 0) {
                for (k = j - 1; k >= 0; k--) {
                    if (board[i][k] != 0)
                        flag = 1
                    board[i][k + 1] = board[i][k]
                }
                board[i][0] = 0
            }
            for (k = j - 1; k >= 0; k--) {
                if (board[i][k] != 0)
                    break;
            }
            if (board[i][j] == 0 && k != -1)
                j++;
            // console.log("Yo j");
        }
        // console.log("Yo i");
    }
    // if (flag==1)
    // getRandom()

    return flag

    //syncBoard()
    // console.log(board);
}

// Add D-pad / UI button support (pointer + click fallback)
function initDPadControls() {
    function performMove(direction) {
        let moved = 0;
        switch (direction) {
            case 'up':
                if (moveUp() == 1) moved = 1;
                break;
            case 'left':
                if (moveLeft() == 1) moved = 1;
                break;
            case 'down':
                if (moveDown() == 1) moved = 1;
                break;
            case 'right':
                if (moveRight() == 1) moved = 1;
                break;
            default:
                break;
        }

        if (moved == 1) {
            getRandom(); // getRandom() calls syncBoard()
        }

        startTimer()

        // Check game over exactly as keyboard handler
        if (isGameOver()) {
            alert("Game Over");
            clearInterval(timer);
        }
    }

    // map button id -> direction string
    const mapping = {
        up: 'up',
        left: 'left',
        right: 'right',
        down: 'down'
    };

    Object.keys(mapping).forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;

        // pointerdown handles mouse/touch/stylus in modern browsers
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // disableRadioButtonSelectionUsingArrowKeys()
            btn.classList.add('animate'); // visual feedback (existing CSS)
            performMove(mapping[id]);
        });

        // remove visual feedback on pointerup / pointercancel / pointerleave
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt =>
            btn.addEventListener(evt, () => btn.classList.remove('animate'))
        );

        // click fallback for very old browsers that don't support pointer events
        // btn.addEventListener('click', (e) => {
        //     // avoid double-trigger if pointer events fired; keep conservative guard
        //     if (e.isTrusted) {
        //         e.preventDefault();
        //         e.stopPropagation();
        //         performMove(mapping[id]);
        //     }
        // });
    });
}

function disableRadioButtonSelectionUsingArrowKeys() {
    let radioButtons = document.querySelectorAll('input[type="radio"]');
    
    radioButtons.forEach(function (radioButton) {
      radioButton.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
        }
      });
    });

    console.log("Disabled Arrow Keys");
}