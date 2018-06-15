// A class representing an AI player
class AI {
  constructor(easyMode=true) {
    // TODO: Enable a hard mode
    this.easyMode = true;
  }
  playTurn(game) {
    if (this.easyMode) {
      // Just pick any random open square
      let row = -1;
      let column = -1;
      while (!game.squareIsOpen(row, column)) {
        row = Math.floor(Math.random()*game.getGameSize());
        column = Math.floor(Math.random()*game.getGameSize());
      }
      game.makeMove(row, column);
    } else {
      // TODO: Write the logic for hard mode
    }
  }
}

// A class representing a game
class Game {
  constructor(gameSize=3, opponent=null) {
    this.gameSize = gameSize;
    this.opponent = opponent;
    this.winner = null;
    this.isXTurn = true;
    this.turnNumber = 0;
    this.gameInProgress = true;
    this.gameBoard = Array(gameSize);
    for (let i=0; i<gameSize; i++) {
      this.gameBoard[i] = Array(gameSize).fill(' ');
    }
  }
  getGameSize() {
    return this.gameSize;
  }
  getWinner() {
    if (!this.gameInProgress) {
      return (this.winner==null ? "TIE" : this.winner);
    }
    return null;
  }
  squareIsOnBoard(row, column) {
    let x = parseInt(row);
    let y = parseInt(column);
    return !(isNaN(x) || x<0 || x>=this.gameSize || isNaN(y) || y<0 || y>=this.gameSize);
  }
  squareIsOpen(row, column) {
    let x = parseInt(row);
    let y = parseInt(column);
    return (this.squareIsOnBoard(x, y) && this.gameBoard[x][y] == ' ');
  }
  getBoardValue(row, column) {
    let x = parseInt(row);
    let y = parseInt(column);
    if (this.squareIsOnBoard(x, y)) {
      return this.gameBoard[x][y];
    }
    return null;
  }
  makeMove(row, column) {
    let x = parseInt(row);
    let y = parseInt(column);
    // make sure teh game isn't over
    if (!this.gameInProgress) {
      return "The game is already over";
    }
    // make sure the location is on the gameBoard
    if (!this.squareIsOnBoard(x, y)) {
      return "You must select a square that actually exists on the board";
    }
    // make sure the location is not already taken
    if (!this.squareIsOpen(x, y)) {
      return "You cannot select a square that has already been played";
    }
    this.gameBoard[x][y] = (this.isXTurn ? 'X' : 'O');
    this.turnNumber++;
    // The game is definitely over if there are no more squares left
    this.gameInProgress = (this.turnNumber < this.gameSize*this.gameSize);
    // Check to see if someone won (whether or not this was the last move)
    if (this.turnNumber >= (this.gameSize*2)-1) {
      // Only start checking for wins after (gameSize*2)-1 turns have been played
      // It's impossible to win before then so this saves us some calculating
      this.checkForWinCondition();
    }
    this.isXTurn = !this.isXTurn;
    if (this.gameInProgress && this.opponent!=null && !this.isXTurn) {
      this.opponent.playTurn(this);
    }
    return null;
  }
  checkForWinCondition() {
    // Check for a solid rows
    for (let row of this.gameBoard) {
      if (row.indexOf(' ') > -1) continue; // There are still empty squares on this row
      if (row.indexOf('X') == -1) {
        // There weren't any blanks or Xs so O must have won
        this.winner = 'O';
        this.gameInProgress = false;
        return; // shortcut out of the rest of the checks
      } else if (row.indexOf('O') == -1) {
        // There weren't any blanks or Os so X must have won
        this.winner = 'X';
        this.gameInProgress = false;
        return; // shortcut out of the rest of the checks
      }
    }
    // Check for solid columns
    for (let col=0; col<this.gameSize; col++) {
      let found = null;
      for (let row of this.gameBoard) {
        if (row[col] == ' ') {
          // There are still empty squares in this column
          found = null;
          break;
        }
        if (found == null) {
          // Starting to check a new row
          found = row[col];
        } else if (row[col] != found) {
          // There was one of the other player's marks in this column
          found = null;
          break;
        }
      }
      if (found != null) {
        // the inner loop found a winner
        this.winner = found;
        this.gameInProgress = false;
        return; // shortcut out of the rest of the checks
      }
    }
    // check the first long diagnal
    let diag1 = null;
    for (let i=0; i<this.gameSize; i++) {
      if (this.gameBoard[i][i] == ' ') {
        // There are still empty squares in this diagnal
        diag1 = null;
        break;
      }
      if (diag1 == null) {
        // Starting the diagnal
        diag1 = this.gameBoard[i][i];
      } else if (this.gameBoard[i][i] != diag1) {
        // There was one of the other player's marks in this diagnal
        diag1 = null;
        break;
      }
    }
    if (diag1 != null) {
      // The diagnal was all one player
      this.winner = diag1;
      this.gameInProgress = false;
      return; // shortcut out of the rest of the checks
    }
    // check the second long diagnal
    let diag2 = null;
    for (let i=0; i<this.gameSize; i++) {
      let j = (this.gameSize-(i+1));
      if (this.gameBoard[i][j] == ' ') {
        // There are still empty squares in this diagnal
        diag2 = null;
        break;
      }
      if (diag2 == null) {
        // Starting the diagnal
        diag2 = this.gameBoard[i][j];
      } else if (this.gameBoard[i][j] != diag2) {
        // There was one of the other player's marks in this diagnal
        diag2 = null;
        break;
      }
    }
    if (diag2 != null) {
      // The diagnal was all one player
      this.winner = diag2;
      this.gameInProgress = false;
    }
  }
}

// The game being played
let activeGame = null;

// Some phrases and an index
let phraseIdx = -1;
const phrases = ['Went to the market.','Stayed home.','Had roast beef.','Had none.','Went "wee wee wee" all the way home.'];

// Close all popups
const closePopups = () => {
  const $modal = $('#popup').hide();
  $modal.find('.popup-dialog').hide();
}

// Open a popup (the event.data object needs to have a property id which is the popup's id)
const openPopup = (event) => {
  $(`#${event.data.id}`, '#popup').show();
  $('#popup').show();
}

// Open the generic popup
const openGenericPopup = (title, message) => {
  $('#generic-title').text(title);
  $('#generic-message').text(message);
  $('#generic').show();
  $('#popup').show();
}

// Why the heck not
const showIt = () => {
  phraseIdx = ((phraseIdx + 1) % phrases.length);
  openGenericPopup("This Litte Piggy", phrases[phraseIdx]);
}

// A function for the UI to check the game state
const checkGameState = () => {
  let winner = activeGame.getWinner();
  if (winner != null) {
    // The game has ended remove any remaining move listeners
    $('.board-square').off('click', userMoved);
    let message = "The game ended in a tie.";
    if (winner != 'TIE') {
      message = "The winner was "+winner+"!";
    }
    // Open the results popup
    $('#outcome', '#result').text(message);
    // Fake out an event so I can reuse the function
    openPopup({ data: { id: "result" } });
  }
}

// A move was made in the UI
const userMoved = (event) => {
  let $div = $(event.currentTarget);
  $div.off('click', userMoved);
  let error = activeGame.makeMove($div.attr('data-row'), $div.attr('data-col'));
  if (error != null) {
    openGenericPopup("Bad Move", error);
  } else {
    redrawBoard();
    checkGameState();
  }
}

// Redraw the board
const redrawBoard = () => {
  let $board = $('#board').empty();
  let gameSize = activeGame.getGameSize();
  for (let i=0; i<gameSize; i++) {
    let $row = $('<div>').addClass('board-row');
    for (let j=0; j<gameSize; j++) {
      let $square = $('<div>').addClass('board-square').attr('data-row',i).attr('data-col',j);
      let squareContent = activeGame.getBoardValue(i, j);
      if (squareContent == ' ') {
        // Nobody played here yet, it needs a listener
        $square.on('click', userMoved);
      }
      $row.append($square.text(squareContent));
    }
    $board.append($row);
  }
}

// Restart the game based off the current settings
const newGame = () => {
  let opponent = null;
  let gameSize = parseInt($('#sizeValue').text());
  let opponentChoice = $('input[name=opponent]:checked').val();
  if (opponentChoice != 'human') {
    let easyMode = (opponentChoice=='cpu-dumb');
    opponent = new AI(easyMode);
  }
  activeGame = new Game(gameSize, opponent);
  redrawBoard();
}

// Show the slider value on the settings page
const updateSliderValue = () => {
  $('#sizeValue').text($('#slider').val());
}

// To run after page loads
const runOnReady = () => {
  // Any button on a modal will close the modal
  $(".modal .button").on('click', closePopups);
  // settings button - brings up settings modal
  $("#settings-button").on('click', null, { id: "settings" }, openPopup);
  // settings-apply button - changes the settings
  $("#settings-apply").on('click', newGame);
  // result-close button - starts a new game
  $("#result-close").on('click', newGame);
  // A silly little easter egg
  $('span', 'h1').on('click', showIt);
  // slider - update the gridValue span
  $('#slider').on('input', updateSliderValue);
  // Start a new game
  newGame();
}

// Run when the page is done loading
$(runOnReady);
