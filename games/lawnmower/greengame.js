// Information about the tools (name, cost, revenue, description, image)
const tools = [
  ['your teeth', 1, 5, 'Sturdy and effective but perhaps a bit yellow. Still it is quite a deal for the price.', 'images/teeth.png'],
  ['some rusty scissors', 5, 5, 'Slightly better than safety scissors... if you can avoid contracting tetanus from them.', 'images/scissors.png'],
  ['a push mower', 25, 50, 'A bit squeaky and hard on the grip but a definite improvement over the scissors.', 'images/push.png'],
  ['an electric mower', 250, 100, 'Efficient and good for the environment. Not to mention it is whisper quiet.', 'images/mower.png'],
  ['some migrant workers', 500, 250, 'Diligent workers but require pay every day and might leave if there is no work.', 'images/workers.png']
];
// Other constants
const maxDayLimit = 55;
const winAmount = 1000;
const vacationCosts = 27;
const vacationCostsWithWorkers = 89;

// Game state data
// Which tools are currently owned
const owned = [true, false, false, false, false];
const used = [false, false, false, false, false];
// Which tool is currently being used
let toolInUse = -1;
// How much money the user has
let cashOnHand = 0;
// How many days have passed
let daysElapsed = 0;
// Current string of idle days
let idleDays = 0;
// If we are in an active game
let activeGame = false;

// Can a tool be bought based on the current state
const canBuy = (toolId) => {
  // Shortcut if they already own it
  if (owned[toolId]) return false;
  // Shortcut if they don't have enough money
  if (tools[toolId][1] > cashOnHand) return false;
  // Make sure they are currently using the correct item
  if (toolId < 0) {
    // They need to be using the tool below the one they want to buy
    return (toolId == toolInUse+1);
  }
  // This only happens with teeth which can be bought regardless
  // of whichever tool the user may or may not be using
  return true;
}

// Purchase a tool
const buyTool = (toolId) => {
  // Make sure the user isn't using the console to cheat the game
  if (!canBuy(toolId)) return;
  // Adjust the state to indicate the tool was purchased
  cashOnHand -= tools[toolId][1];
  owned[toolId] = true;
  used[toolId] = false;
}

// Can a tool be sold based on the current state
const canSell = (toolId) => {
  return owned[toolId];
}

// How much the user can get for the tool
const getSalePrice = (toolId) => {
  // Normally the user only gets half price (rounded down)
  let salePrice = Math.floor(tools[toolId][1]/2);
  if (toolId==0 || !used[toolId]) {
    // User gets full price for teeth and unused tools
    salePrice = tools[toolId][1];
  }
  return salePrice;
}

// Sell a tool
const sellTool = (toolId) => {
  // Make sure the user isn't using the console to cheat the game
  if (!canSell(toolId)) return;
  let salePrice = getSalePrice(toolId);
  // Adjust the state to indicate the tool was purchased
  owned[toolId] = false;
  if (toolInUse == toolId) toolInUse = -1;
  cashOnHand += salePrice;
}

// Check to make sure they are using a tool
const canCutLawn = () => {
  return (toolInUse >= 0);
}

// Cut a lawn
const cutLawn = () => {
  // Make sure the user isn't using the console to cheat the game
  if (!canCutLawn()) return;
  // Adjust the state to indicate a lawn was cut
  used[toolInUse] = true;
  daysElapsed++;
  idleDays = 0;
  cashOnHand += tools[toolInUse][2];
}

// How much it costs to take the day off
const getCostOfDayOff = () => {
  // Normally it only costs $23 to take a day off
  let expenses = vacationCosts;
  if (owned[4]) {
    // If you own the migrant workers, you still have to pay
    // them for the day
    expenses = vacationCostsWithWorkers;
  }
  return expenses;
}

// Check to make sure the user can affors to relax
const canTakeDayOff = () => {
  return (getCostOfDayOff() <= cashOnHand);
}

// Randomly (but weighted based on # of idle days) determine if migrant workers leave
const workersTookOtherJob = () => {
  // The more idle days in a row, the more likely the workers will leave
  left = (owned[4] && idleDays>Math.floor(Math.random()*10)+1); // random 1-10
  if (left) {
    // The migrant workers found other work so you can't use them anymore
    owned[4] = false;
    if (toolInUse == 4) toolInUse = -1;
  }
  return left;
}

// Take the day off
const takeDayOff = () => {
    // Make sure the user isn't using the console to cheat the game
    if (!canTakeDayOff()) return;
    let expenses = getCostOfDayOff();
    // Adjust the state to indicate a day was taken off
    daysElapsed++;
    idleDays++;
    cashOnHand -= expenses
}

// Display a message on the game log
const printGameLogMessage = (message, messageType) => {
  let timestamp = '<span class="timestamp">Day '+daysElapsed+':</span> ';
  let fullMessage = timestamp+'<span class="'+messageType+'">'+message+'</span><br>'
  let console = document.getElementById('gamelog');
  console.innerHTML += fullMessage;
  console.scrollTop = console.scrollHeight;
}

// Draw a row in the inventory window
const getInventoryDOMObject = (toolId) => {
  let image = document.createElement('img');
  let classes = 'inv-item'
  if (toolId==toolInUse) {
    classes += ' using';
  }
  image.className = classes;
  image.setAttribute('src', tools[toolId][4]);
  image.setAttribute('data-id', toolId);
  if (activeGame) {
    image.addEventListener('click', doSelectTool);
  }
  return image;
}

// Redraw the inventory items
const redrawInventory = () => {
  let inventory = document.getElementById('owned');
  // Clear out the old objects
  while (inventory.firstChild) {
    inventory.removeChild(inventory.firstChild);
  }
  // Populate the new objects
  for (let i=0; i<tools.length; i++) {
    if (owned[i]) {
      inventory.appendChild(getInventoryDOMObject(i));
    }
  }
}

// Draw a row in the store window
const getStoreDOMObject = (toolId) => {
  // The entire row
  let row = document.createElement('div');
  row.className = 'shop-row wrapper';
  // The item's image
  let image = document.createElement('img');
  image.className = 'shop-item';
  image.setAttribute('src', tools[toolId][4]);
  row.appendChild(image);
  // The item's description
  let info = document.createElement('div');
  info.className = 'shop-info wrapper';
  let description = document.createElement('div');
  description.className = 'shop-text';
  description.textContent = tools[toolId][3];
  info.appendChild(description);
  if (activeGame) {
    // A button to buy the item
    let buy = document.createElement('div');
    buy.className = 'button shop-button';
    buy.innerHTML = 'Buy ($'+tools[toolId][1]+')';
    buy.setAttribute('data-id', toolId);
    buy.addEventListener('click', doBuyTool);
    info.appendChild(buy);
    // Abutton to sell the item
    let sell = document.createElement('div');
    sell.className = 'button shop-button';
    sell.innerHTML = 'Sell ($'+getSalePrice(toolId)+')';
    sell.setAttribute('data-id', toolId);
    sell.addEventListener('click', doSellTool);
    info.appendChild(sell);
  }
  row.appendChild(info);
  return row;
}

// Redraw the shop items
const redrawShop = () => {
  let store = document.getElementById('tools');
  // Clear out the old objects
  while (store.firstChild) {
    store.removeChild(store.firstChild);
  }
  // Populate the new objects
  for (let i=0; i<tools.length; i++) {
    store.appendChild(getStoreDOMObject(i));
  }
}

// Update the gameboard
const refreshBoard = () => {
  // Update the cash
  document.getElementById('bank').textContent = "$"+cashOnHand;
  redrawInventory();
  redrawShop();
}

// Reset the gameboard to the default state
const resetBoard = () => {
  document.getElementById('gamelog').innerHTML = '';
  printGameLogMessage(
    'Welcome to your life as a lawn care specialist. You are trying to hire a '+
    'crew and still have at least <span class="cash">$'+winAmount+'</span> '+
    'before the end of the lawn mowing season. Good luck and happy mowing!'
    , 'game-info'
  );
  refreshBoard();
  let allButtons = document.getElementsByClassName("button");
  for (let button of allButtons) {
    button.style.visibility = 'visible';
  }
}

// Reset the game
const reset = () => {
  owned.fill(false);
  owned[0] = true;
  used.fill(false);
  toolInUse = -1;
  cashOnHand = 0;
  daysElapsed = 0;
  idleDays = 0;
  activeGame = true;
  resetBoard();
}

const endGame = () => {
  activeGame = false;
  document.getElementById('mow').style.visibility = 'hidden';
  document.getElementById('relax').style.visibility = 'hidden';
}

// The logic that checks if the game is over
const checkForEndStates = () => {
  // Check the win condition
  if (owned[4] && cashOnHand>=winAmount && daysElapsed<=maxDayLimit) {
    printGameLogMessage("Congratulations! You won! You are the lawn mowing champion!", 'game-over');
    endGame();
    return;
  }
  // Check the normal lose condition
  if (daysElapsed>=maxDayLimit) {
    printGameLogMessage("Sorry, the mowing season is over. Maybe you will have better luck next summer.", 'game-over');
    endGame();
    return;
  }
  // Check the very rare corner case lose condition
  if (cashOnHand==0) {
    let hasTool = false;
    for (let tool of owned) {
      if (tool) {
        hasTool = true;
        break;
      }
    }
    if (!hasTool) {
      // User managed to get sell all tools and use up all their money
      printGameLogMessage(
        "Unfortunately with no tools and no money, you starved to death "+
        "(you probably would have had trouble eating without teeth anyway)."
        , 'game-over'
      );
      endGame();
    }
  }
}

// The logic for when the user mows a lawn
const mow = () => {
  // Make sure the user is using a tool
  if (toolInUse < 0) {
    printGameLogMessage("You can't mow a lawn without a tool!", 'error');
    checkForEndStates();
    return;
  }
  cutLawn();
  printGameLogMessage(
    'You spent the day mowing a lawn using '+tools[toolInUse][0] +
    ' and earned <span class="cash">$'+tools[toolInUse][2]+'</span>.'
    , 'user-action'
  );
  checkForEndStates();
  refreshBoard();
}

// The logic for when the user takes a day off
const takeVacation = () => {
  let expenses = getCostOfDayOff();
  // Make sure the user can afford it
  if (cashOnHand < expenses) {
    printGameLogMessage(
      "If you aren't making money, you're spending it. It costs "+
      '<span class="cash">$'+expenses+'</span> to take a vacation right now '+
      "and you currently don't have that much. Better get to work."
      , 'error'
    );
    checkForEndStates();
    return;
  }
  takeDayOff();
  let message = 'You spent <span class="cash">$'+expenses+'</span> while relaxing on your day off.';
  if (workersTookOtherJob()) {
    message += " Unfortunately your migrant workers have abandoned you for other jobs.";
  }
  printGameLogMessage(message, 'user-action');
  checkForEndStates();
  refreshBoard();
}

// The logic for when the user selects what tool to use
// Using the older style function because I need access to 'this' object
function doSelectTool() {
  let toolId = this.getAttribute('data-id')
  // Make sure the user has the tool and it's not already selected
  if (toolId==toolInUse || !owned[toolId]) return; // No log message needed
  toolInUse = toolId;
  printGameLogMessage('You are now using '+tools[toolId][0]+'.', 'user-state');
  refreshBoard();
}

// The logic for when the user tries to buy a tool
// Using the older style function because I need access to 'this' object
function doBuyTool() {
  let toolId = this.getAttribute('data-id')
  let toolName = tools[toolId][0];
  // Make sure the user doesn't have the tool and has enough money
  if (owned[toolId]) {
    printGameLogMessage('You already have '+toolName+'.', 'error');
    return;
  } else if (tools[toolId][1] > cashOnHand) {
    printGameLogMessage("You don't have enough money to buy that.", 'error');
    // Check here because of rare corner case
    checkForEndStates();
    return;
  } else if (toolId>0 && toolInUse!=toolId-1) {
    printGameLogMessage(
      'To buy '+toolName+' you have to be in possession of (a.k.a. using) '+
      tools[toolId-1][0]+'.'
      , 'error'
    );
    return;
  }
  buyTool(toolId);
  // Some special grammar for teeth
  if (toolId == 0) {
    toolName = 'new teeth';
  }
  printGameLogMessage(
    'You bought '+toolName+' for <span class="cash">$'+tools[toolId][1]+'</span>.'
    , 'user-state'
  );
  refreshBoard();
}

// The logic for when the user tries to sell a tool
// Using the older style function because I need access to 'this' object
function doSellTool() {
  let toolId = this.getAttribute('data-id')
  // Make sure the user has the tool
  if (!owned[toolId]) {
    printGameLogMessage("You can't sell what you don't have.", 'error');
    return;
  }
  sellTool(toolId);
  printGameLogMessage(
    "You sold "+tools[toolId][0]+' for <span class="cash">$'+
    getSalePrice(toolId)+'</span>.'
    , 'user-state'
  );
  checkForEndStates();
  refreshBoard();
}

// Add the static even listeners
document.getElementById('mow').addEventListener('click', mow);
document.getElementById('relax').addEventListener('click', takeVacation);
document.getElementById('restart').addEventListener('click', reset);

// Start the game
reset();
