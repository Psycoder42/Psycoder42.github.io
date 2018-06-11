// A class representing a spaceship
class Spaceship {
  constructor(name, hullStrength, attackStrength, accuracy) {
    this.name = name;
    this.defaults = {
      hp: hullStrength,
      fp: attackStrength,
      acc: accuracy
    };
    this.reset();
  }
  reset() {
    this.hull = this.defaults.hp;
    this.firepower = this.defaults.fp;
    this.accuracy = this.defaults.acc;
    this.shieldBonus = 0;
    this.weaponBonus = 0;
  }
  getName() {
    return this.name;
  }
  getAttackStrength() {
    return this.firepower + this.weaponBonus;
  }
  getAccuracy() {
    return this.accuracy;
  }
  getHitpoints() {
    return this.hull;
  }
  getMaxHitpoints() {
    return this.defaults.hp;
  }
  getShields() {
    return this.shieldBonus;
  }
  upgradeWeapon(bonus) {
    this.weaponBonus += bonus;
  }
  upgradeShield(bonus) {
    this.shieldBonus += bonus;
  }
  isDamaged() {
    return (this.hull < this.defaults.hp);
  }
  isDestroyed() {
    return (this.hull == 0);
  }
  // Calculates the adjusted damage, applies it, and returns the damage taken
  takeDamage(amount) {
    let damageReceived = Math.max(0, amount-this.shieldBonus);
    this.hull = Math.max(0, this.hull-damageReceived);
    return damageReceived;
  }
  // Attempts to attack otherShip and retuns the amount of damage dealt
  attack(otherShip) {
    let damageDealt = 0;
    if (Math.random() <= this.accuracy) {
      // Attack was successful
      damageDealt = otherShip.takeDamage(this.getAttackStrength());
    }
    return damageDealt;
  }
  // Repair the hull a certain amount but not more than the original strength
  repair(amount) {
    this.hull = Math.min(this.hull+amount, this.defaults.hp);
  }
}

// A class representing a player
class Player {
  constructor(playerName, shipName, shipImage=null) {
    this.name = playerName;
    this.ship = new Spaceship(shipName, 20, 5, 0.7);
    this.shipImage = shipImage;
    this.reset();
  }
  reset() {
    this.ship.reset();
    this.money = 0;
    this.kills = Array(ranks.length).fill(0);
    this.titles = [];
    this.retreated = false;
  }
  getName() {
    return this.name;
  }
  getShip() {
    return this.ship;
  }
  getShipImage() {
    return this.shipImage;
  }
  getMoney() {
    return this.money;
  }
  getTitles() {
    return this.titles;
  }
  hasRetreated() {
    return this.retreated;
  }
  // Gain money with positive number, spend with a negative
  adjustMoney(amount) {
    this.money += amount;
  }
  recordKill(rank) {
    let rankIdx = ranks.indexOf(rank);
    if (rankIdx != -1) this.kills[rankIdx]++;
  }
  getKills(rank) {
    let killCount = 0;
    let rankIdx = ranks.indexOf(rank);
    if (rankIdx != -1) killCount = this.kills[rankIdx];
    return killCount;
  }
  getTotalKills() {
    return this.kills.reduce( (total, cur) => { return total+=cur; } );
  }
  recordTitle(title) {
    this.titles.push(title);
  }
  retreat() {
    this.retreated = true;
  }
}

// A class representing an alien attacker
class Alien {
  constructor(rank) {
    // Some vars for rank-specific specs
    let hull = 0;
    let attack = 0;
    let accuracy = 0;
    let loot = 0;
    this.weaponBonus = 0;
    this.shieldBonus = 0;
    // Assign specks based on rank
    switch (ranks.indexOf(rank)) {
      case 0:
        // grunt rank
        hull = Math.floor(Math.random()*4) + 3;
        attack = Math.floor(Math.random()*3) + 2;
        accuracy = (Math.floor(Math.random()*3) + 6) / 10;
        loot = Math.floor(Math.random()*3) + 1;
        break;
      case 1:
        // soldier rank
        hull = Math.floor(Math.random()*4) + 5;
        attack = Math.floor(Math.random()*3) + 4;
        accuracy = (Math.floor(Math.random()*2) + 7) / 10;
        loot = Math.floor(Math.random()*5) + 5;
        this.shieldBonus = Math.floor(Math.random()*3) + 1;
        break;
      case 2:
        // Warship rank
        hull = Math.floor(Math.random()*5) + 10;
        attack = Math.floor(Math.random()*3) + 8;
        accuracy = (Math.floor(Math.random()*2) + 8) / 10;
        loot = Math.floor(Math.random()*3) + 13;
        this.weaponBonus = Math.floor(Math.random()*3) + 1;
        this.shieldBonus = Math.floor(Math.random()*5) + 2;
        break;
      default:
        // unknown rank
        throw "Unknown rank: "+rank;
    }
    // store the class variables
    this.rank = rank;
    this.ship = new Spaceship(rank, hull, attack, accuracy);
    this.loot = loot;
  }
  reset() {
    this.ship.reset();
    // Resetting shouldn't remove alien bonuses
    this.ship.upgradeWeapon(this.weaponBonus);
    this.ship.upgradeShield(this.shieldBonus);
  }
  getRank() {
    return this.rank;
  }
  getShip() {
    return this.ship;
  }
  getLoot() {
    return this.loot;
  }
}

// A clsss representing a purchasible upgrade
class Upgrade {
  constructor(type, name, price, bonus, image=null) {
    if (type!="Weapon" && type!="Shield") {
      throw "Invalid upgrade type: "+type;
    }
    this.type = type;
    this.name = name;
    this.price = price;
    this.bonus = bonus;
    this.image = image;
  }
  getName() {
    return this.name;
  }
  getPrice() {
    return this.price;
  }
  getBonus() {
    return this.bonus;
  }
  getImage() {
    return this.image;
  }
  getDescription() {
    return this.type + " bonus: +" + this.getBonus();
  }
  // return true if sale was successful
  sellTo(player) {
    if (player.getMoney() >= this.price) {
      player.adjustMoney(this.price*-1);
      let func = "upgrade"+this.type;
      player.getShip()[func](this.bonus);
      return true;
    }
    return false;
  }
}

// A class representing a game
class Game {
  constructor() {
    this.players = [];
    this.aliens = [];
    this.restart();
  }
  // The starts the game over with same players/aliens (not re-randomized)
  restart() {
    this.players.forEach( p => p.reset() );
    this.aliens.forEach( a => a.reset() );
    this.activePlayer = 0;
    this.activeAlien = 0;
  }
  addPlayer(player) {
    this.players.push(player);
  }
  addAlien(alien) {
    this.aliens.push(alien);
  }
  getAlien(index) {
    if (index>=0 && index<this.aliens.length) {
      return this.aliens[index];
    }
    return null;
  }
  getAlienIndex(alien) {
    return this.aliens.indexOf(alien);
  }
  getPlayer(index) {
    if (index>=0 && index<this.players.length) {
      return this.players[index];
    }
    return null;
  }
  getPlayerIndex(player) {
    return this.players.indexOf(player);
  }
  getPlayerCount() {
    return this.players.length;
  }
  getAliensLeft() {
    let remaining = 0;
    for (let alien of this.aliens) {
      if (!alien.getShip().isDestroyed()) remaining++;
    }
    return remaining;
  }
  getPlayersLeft() {
    let remaining = 0;
    for (let player of this.players) {
      if (!player.getShip().isDestroyed() && !player.hasRetreated()) remaining++;
    }
    return remaining;
  }
  isGameOver() {
    return (this.getAliensLeft()==0 || this.getPlayersLeft()==0);
  }
  // Look to what is going to be showing up next
  previewNextAlien() {
    return this.aliens[this.activeAlien];
  }
  // Get the next alien to fight or null if no more aliens
  getNextAlien() {
    let nextAlien = null;
    if (this.activeAlien < this.aliens.length) {
      nextAlien = this.aliens[this.activeAlien];
      this.activeAlien = (this.activeAlien+1)%this.aliens.length;
    }
    return nextAlien;
  }
  // Get the player who's turn it is or null if they all retreated/died
  nextActivePlayer() {
    let nextPlayer = null;
    for (let i=0; i<this.players.length; i++) {
      let player = this.players[this.activePlayer];
      this.activePlayer = (this.activePlayer+1)%this.players.length;
      if (!player.hasRetreated() && !player.getShip().isDestroyed()) {
        // this player is still alive and active - they are next
        nextPlayer = player;
        break;
      }
    }
    return nextPlayer;
  }
}

// A function to add a player to the game
const addPlayerToGame = (playerName, shipName, shipImage) => {
  activeGame.addPlayer(new Player(playerName, shipName, shipImage));
}

// A function to add aliens to the game based off difficulty
const addAliensToGame = (difficulty) => {
  // Alien rank counts are difficulty-specific
  let alienCounts = [0,0,0];
  // Assign based on difficulty
  switch (gameDifficulties.indexOf(difficulty)) {
    case 0:
      // easy
      alienCounts[0] = 6;
      break;
    case 1:
      // medium
      alienCounts[0] = 4
      alienCounts[1] = 3;
      alienCounts[2] = 1;
      break;
    case 2:
      // hard
      alienCounts[0] = 4
      alienCounts[1] = 6;
      alienCounts[2] = 3;
      break;
    default:
      // unknown rank
      throw "Unknown difficulty: "+difficulty;
  }
  // Add the aliens
  for (let rankIdx=0; rankIdx<alienCounts.length; rankIdx++) {
    // For each rank, add the appropriate number of aliens
    for (let i=0; i<alienCounts[rankIdx]; i++) {
      activeGame.addAlien(new Alien(ranks[rankIdx]));
    }
  }
}

// A helper function to award titles
const awardTitle = (player, title) => {
  player.recordTitle(title);
  output(format(NEW_TITLE, [player.getName(), title]));
}

// A function to salvage loot from the destroyed ship
const salvageLoot = (player, alien) => {
  let amount = alien.getLoot();
  player.adjustMoney(amount);
  let units = (amount==1 ? "credit" : "credits");
  output(format(SALVAGE, [player.getName(), amount, units]));
}

// A function to update various game state after a kill
const processKill = (player, alien) => {
  let alienRank = alien.getRank();
  // Record the kill in the player's stats
  player.recordKill(alienRank);
  // Collect the alien loot
  salvageLoot(player, alien);
  // Award titles
  // First kill of the rank
  if (player.getKills(alienRank) == 1) {
    let title = null;
    switch (ranks.indexOf(alienRank)) {
      case 0:
        // grunt rank
        title = "Grunt Smasher";
        break;
      case 1:
        // soldier rank
        title = "Soldier's Bane";
        break;
      case 2:
        // Warship rank
        title = "Warship Crusher";
        break;
    }
    if (title != null) awardTitle(player, title);
  }
  let totalKills = player.getTotalKills();
  // Killed 5 aliens
  if (totalKills == 5) awardTitle(player, "Alien Bounty Hunter");
  // Killed 10 aliens
  if (totalKills == 10) awardTitle(player, "Alien Exterminator");
}

// A function to attempt to inflict damage
const launchAttack = (attackerName, attackerShip, targetName, targetShip) => {
  let damage = attackerShip.attack(targetShip);
  // For formatting the output string, figure out if player or alien is attacking
  let aType = "enemy";
  let tType = "player";
  if (ranks.indexOf(attackerName) == -1) {
    aType = "player";
    tType = "enemy";
  }
  if (damage == 0) {
    output(format(MISSED, [attackerName, aType]));
  } else {
    output(format(DAMAGE, [attackerName, damage, targetName, aType, tType]));
  }
}

// A function for commmensing the next fight
const startNextAttack = () => {
  const alien = activeGame.getNextAlien();
  let activePlayer = activeGame.nextActivePlayer();
  // Announce what showed up
  output(format(ALIEN_APPEAR, [alien.getRank()]));
  // Continue the fight until one side is no more
  while (true) {
    // Player attacks first
    launchAttack(
      activePlayer.getName(), activePlayer.getShip(), alien.getRank(), alien.getShip()
    );
    if (alien.getShip().isDestroyed()) {
      // The player has destroyed the alien ship
      output(format(ENEMY_DEAD, [alien.getRank()]));
      processKill(activePlayer, alien);
      break;
    }
    // The alien fires back
    launchAttack(
      alien.getRank(), alien.getShip(), activePlayer.getName(), activePlayer.getShip()
    );
    if (activePlayer.getShip().isDestroyed()) {
      // The activePlayer has been destroyed
      let shipName = activePlayer.getShip().getName()
      output(format(PLAYER_DEAD, [activePlayer.getName(), shipName]));
    }
    activePlayer = activeGame.nextActivePlayer();
    if (activePlayer == null) {
      // All players have been destroyed
      break;
    }
  }
}

// A function to buy a repair
const buyRepair = (player) => {
  let ship = player.getShip();
  // Can't repair a destroyed ship
  if (ship.isDestroyed()) return;
  // No need to repair an undamaged ship
  if (!ship.isDamaged()) return;
  // Can't afford a repair
  if (player.getMoney() <= 0) return;
  // Do the repair
  player.adjustMoney(-1);
  ship.repair(repairBasis);
  output(format(REPAIR, [player.getName()]));
}

// A function to buy an upgrade
const buyUpgrade = (player, upgrade) => {
  // Can't upgrade a destroyed ship
  if (player.getShip().isDestroyed()) return;
  // Try to buy and apply the upgrade
  if (upgrade.sellTo(player)) {
    // The upgrade was successful
    output(format(UPGRADE, [player.getName(), upgrade.getName()]));
  } else {
    // Player didn't have enough money
    error(format(TOO_POOR, [player.getName(), upgrade.getName()]));
  }
}

// A function to retreive the ship image
const getImageForObject = (object) => {
  let image = "images/blank.png";
  if (object instanceof Player) {
    image = object.getShipImage();
  } else if (object instanceof Alien) {
    image = "images/"+object.getRank().toLowerCase()+".png";
  } else if (object instanceof Upgrade) {
    image = object.getImage();
  }
  return image;
}

// Some global constansts
// The various types of alien ships
const ranks = ['Grunt', 'Soldier', 'Warship'];
// Random player ship names
const playerShipNames = [
  "USS Schwarzenegger", "USS Maiden Voyage", "USS Spacey McSpaceship",
  "Spaceball 1", "Apallo 45"
];
// Random player ship images
const playerShipImages = [
  "images/ship0.png", "images/ship1.png", "images/ship2.png",
  "images/ship3.png", "images/ship4.png"
];
// The different difficulty levels
const gameDifficulties = ['Training Pilot','Plucky Go-Getter','Flying Ace'];
// Purchasable upgrades
const upgrades = [
  new Upgrade("Weapon", "Additional Laser", 8, 2, "images/laser.png"),
  new Upgrade("Shield", "Additional Generator", 8, 2, "images/shield.png"),
  new Upgrade("Weapon", "Plazma Emmitter", 15, 5, "images/plazma.png"),
  new Upgrade("Shield", "Phase Modulator", 15, 5, "images/phase.png"),
];
// The amount of hull repair 1 unit of money will buy
const repairBasis = 2;
// The character to use for the credit symbol
const creditSymbol = "&#8373;";
// The running instance of the game
let activeGame = null;
// A variable to indicate who is in the shop
let upgradingPlayer = null;

// Functions that interact with the DOM
// Display a message on the console
const printConsoleMessage = (message, messageType) => {
  let fullMessage = '<span class="'+messageType+'">'+message+'</span><br>'
  let console = document.getElementById('console');
  console.innerHTML += fullMessage;
  console.scrollTop = console.scrollHeight;
}

// A function to output a message
const output = (message) => {
  printConsoleMessage(message, "normal");
};

// A function to output an error
const error = (message) => {
  printConsoleMessage(message, "error");
};

// A function to populate the shop inventory
// <div class="shop-item">
//   <img src="images/shield.png">
//   <h3>Name and Cost</h3>
//   <p>Description</p>
//   <button class="button" type="button" data-id="0">Purchase</button>
// </div>
const populateShop = () => {
  let inventory = document.getElementById('shop-list');
  for (let i=0; i<upgrades.length; i++) {
    let upgrade = upgrades[i];

    let item = document.createElement('div');
    item.className = "shop-item";

    let pic = document.createElement('img');
    pic.setAttribute("src", getImageForObject(upgrade));
    item.appendChild(pic);

    let text = document.createElement('h3');
    text.innerHTML = format(ITEM, [upgrade.getName(), upgrade.getPrice()]);
    item.appendChild(text);

    let desc = document.createElement('p');
    desc.innerHTML = upgrade.getDescription();
    item.appendChild(desc);

    let button = document.createElement('button');
    button.className = "button";
    button.setAttribute("type", "button");
    button.setAttribute("data-id", i);
    button.innerHTML = "Purchase";
    button.addEventListener('click', doBuyUpgrade);
    item.appendChild(button);

    inventory.appendChild(item);
  }
}

// A function to toggle enablement of a player's buttons
const togglePlayerButtons = (playerIdx) => {
  let buttons = document.getElementById("p"+playerIdx).querySelectorAll(".button");
  for (let btn of buttons) {
    btn.disabled = !btn.disabled;
  }
}

// A function to enable all player buttons
const disablePlayerButtons = (disableState) => {
  for (let playerIdx=0; playerIdx<activeGame.getPlayerCount(); playerIdx++) {
    let buttons = document.getElementById("p"+playerIdx).querySelectorAll(".button");
    for (let btn of buttons) {
      btn.disabled = disableState;
    }
  }
}

// A function to populate the players
// <div id="p0" class="ship-info">
//   <h2>Player1</h2>
//   <h2>USS Something</h2>
//   <div class="ship">
//     <div class="ship-controls">
//       <p id="p0-money" class="money">$18</p>
//       <button type="button" class="button">Repair</button>
//       <button type="button" class="button">Shop</button>
//       <button type="button" class="button">Flee</button>
//       <p id="p0-hp" class="hp">HP: 20</p>
//     </div>
//     <img src="images/ship3.png">
//   </div>
// </div>
const populatePlayers = () => {
  let playerSpace = document.getElementById('player-realm');
  // Clear off any old entries
  let existingShips = playerSpace.querySelectorAll(".ship-info");
  for (let oldShip of existingShips) {
    playerSpace.removeChild(oldShip);
  }
  // Add players back
  for (let i=0; i<activeGame.getPlayerCount(); i++) {
    let player = activeGame.getPlayer(i);

    let info = document.createElement('div');
    info.className = "ship-info";
    info.setAttribute("id", "p"+i);

    let pName = document.createElement('h2');
    pName.innerHTML = player.getName();
    info.appendChild(pName);

    let pShipName = document.createElement('h2');
    pShipName.innerHTML = player.getShip().getName();
    info.appendChild(pShipName);

    let ship = document.createElement('div');
    ship.className = "ship";

    let controls = document.createElement('div');
    controls.className = "ship-controls";

    let funds = document.createElement('p');
    funds.className = "money";
    funds.setAttribute("id", "p"+i+"-money");
    controls.appendChild(funds);

    let btnRepair = document.createElement('button');
    btnRepair.className = "button";
    btnRepair.setAttribute("type", "button");
    btnRepair.setAttribute("data-id", i);
    btnRepair.innerHTML = "Repair";
    btnRepair.addEventListener('click', doRepair);
    controls.appendChild(btnRepair);

    let btnShop = document.createElement('button');
    btnShop.className = "button";
    btnShop.setAttribute("type", "button");
    btnShop.setAttribute("data-id", i);
    btnShop.innerHTML = "Shop";
    btnShop.addEventListener('click', doShop);
    controls.appendChild(btnShop);

    let btnFlee = document.createElement('button');
    btnFlee.className = "button";
    btnFlee.setAttribute("type", "button");
    btnFlee.setAttribute("data-id", i);
    btnFlee.innerHTML = "Flee";
    btnFlee.addEventListener('click', doRetreat);
    controls.appendChild(btnFlee);

    let hp = document.createElement('p');
    hp.className = "hp";
    hp.setAttribute("id", "p"+i+"-hp");
    controls.appendChild(hp);

    ship.appendChild(controls);

    let pic = document.createElement('img');
    pic.setAttribute("src", getImageForObject(player));
    pic.setAttribute("id", "p"+i+"-image");
    pic.setAttribute("data-id", i);
    pic.setAttribute("data-type", "Player");
    pic.addEventListener('click', openInfo);
    ship.appendChild(pic);

    info.appendChild(ship);

    playerSpace.appendChild(info);
  }
}

// Functions that are responses to button presses
// A function that updates various state objects
const updateScreen = () => {
  // Update the player stats
  for (let playerIdx=0; playerIdx<activeGame.getPlayerCount(); playerIdx++) {
    let player = activeGame.getPlayer(playerIdx);
    document.getElementById("p"+playerIdx+"-money").innerHTML = creditSymbol+player.getMoney();
    document.getElementById("p"+playerIdx+"-hp").innerHTML = "HP: "+player.getShip().getHitpoints();
    if (player.getShip().isDestroyed()) {
      togglePlayerButtons(playerIdx);
    }
    let opacity = "1";
    if (player.getShip().isDestroyed() || player.hasRetreated()) {
      opacity = "0.3";
    }
    document.getElementById("p"+playerIdx+"-image").style.opacity = opacity;
  }
  // Update the aliens
  let attackersLeft = activeGame.getAliensLeft();
  document.getElementById("att-count").innerHTML = attackersLeft;
  let alienImg = "images/blank.png";
  let nextAttacker = null;
  if (attackersLeft > 0) {
    nextAttacker = activeGame.previewNextAlien();
    alienImg = getImageForObject(nextAttacker);
  }
  // Only update the image if the game is still on or the players won
  if (!activeGame.isGameOver() || activeGame.getPlayersLeft()>0) {
    let alienElement = document.getElementById("cur-alien");
    alienElement.setAttribute("src", alienImg);
    alienElement.setAttribute("data-id", activeGame.getAlienIndex(nextAttacker));
  }
}

// A function to show a popup
const openPopup = (popup) => {
  // Show the desired popup
  document.getElementById(popup).style.display = "block";
  document.getElementById('popup-parent').style.visibility = "visible";
}

// A function to close a popup
const closePopup = (popup) => {
  // Hide the desired popup
  document.getElementById('popup-parent').style.visibility = "hidden";
  document.getElementById(popup).style.display = "none";
  updateScreen();
}

// A function to open the settings page
const openSettings = () => {
  openPopup('settings');
}

// A function to open the shop page
const openShop = () => {
  openPopup('shop');
}

// A function to close the shop page
const closeShop = () => {
  closePopup('shop');
}

// A function to close the info page
const closeInfo = () => {
  closePopup('more-info');
  // Remove the generated content
  let infoPopup = document.getElementById('more-info');
  infoPopup.removeChild(infoPopup.firstChild);
}

// A function to restart the game
const restartGame = () => {
  // Clear old game messages
  document.getElementById('console').innerHTML = '';
  // Enable any potentially disabled buttons
  document.getElementById('fight').disabled = false;
  disablePlayerButtons(false);
  // Reset the objects to their initial states
  activeGame.restart();
  // Make sure the screen is up to date
  updateScreen();
}

// A function to start a new game
const startGame = () => {
  let p1Name = document.getElementById('p1-name').value.trim();
  if (p1Name == '') {
    // Player one name is missing
    alert("You must provide a name for Player1.");
    return;
  }
  activeGame = new Game();
  let p1ship = playerShipNames[Math.floor(Math.random()*playerShipNames.length)];
  let p1shipImg = playerShipImages[Math.floor(Math.random()*playerShipImages.length)];
  addPlayerToGame(p1Name, p1ship, p1shipImg);
  let p2Name = document.getElementById('p2-name').value.trim();
  if (p2Name != '') {
    // Add the second player
    let p2ship = p1ship;
    while (p2ship == p1ship) {
      p2ship = playerShipNames[Math.floor(Math.random()*playerShipNames.length)];
    }
    let p2shipImg = p1shipImg;
    while (p2shipImg == p1shipImg) {
      p2shipImg = playerShipImages[Math.floor(Math.random()*playerShipImages.length)];
    }
    addPlayerToGame(p2Name, p2ship, p2shipImg);
  }
  let difficulty = document.getElementById('difficulty').value.trim();
  addAliensToGame(difficulty);
  populatePlayers();
  // Hide the settings
  document.getElementById('popup-parent').style.visibility = "hidden";
  document.getElementById('settings').style.display = "none";
  // Restart the game
  restartGame();
}

// A function to see if we are at an end state
const checkForGameEnd = () => {
  if (activeGame.isGameOver()) {
    // Disable the fight buttom
    document.getElementById('fight').disabled = true;
    // Display the ending message
    if (activeGame.getPlayersLeft() == 0) {
      // All the players retreated/died
      output(LOST);
    } else {
      // There is at least one player still alive
      output(WON);
    }
    // Disable all ship controls
    disablePlayerButtons(true);
  }
}

// A function to do a round of attacks
const doAttackRound = () => {
  // Don't do anything if the game is over
  if (activeGame.isGameOver()) return;
  // Do the next round of attacks
  startNextAttack();
  // adjust the DOM as necessary
  updateScreen();
  checkForGameEnd();
}

// A function to update the more-info popup with a particular ship
// <div class="all-info">
//   <h2>Ship Name</h2>
//   <div class="info-container>
//     <img src="images/ship0.png">
//     <div>
//       <p>Pilot: pilot name</p>
//       <p>Status: Damaged</p>
//       <p>Hitpoints: 20</p>
//       <p>Shields: 3</p>
//       ...
//       <p>Kills:
//         <ul>
//           <li>Grunt: 2</li>
//           <li>Soldier: 1</li>
//         </ul>
//       </p>
//       <p>Titles:
//         <ul>
//           <li>Title 1</li>
//           <li>Title 2</li>
//         </ul>
//       </p>
//     </div>
//   </div>
// </div>
const populateInfoPopup = (object) => {
  let ship = object.getShip();
  let isPlayer = (object instanceof Player);
  let info = document.createElement('div');
  info.className = "all-info";

  let sName = document.createElement('h2');
  sName.innerHTML = (isPlayer ? ship.getName() : "An Alien "+object.getRank());
  info.appendChild(sName);

  let ic = document.createElement('div');
  ic.className = "info-container";

  let pic = document.createElement('img');
  pic.setAttribute("src", getImageForObject(object));
  ic.appendChild(pic);

  let anonDiv = document.createElement('div');

  let pilot = document.createElement('p');
  pilot.innerHTML = "Pilot: "+(isPlayer ? object.getName() : "Unknown");
  anonDiv.appendChild(pilot);

  let condition = (isPlayer ? "Active" : "Attacking");
  if (isPlayer && object.hasRetreated()) {
    condition = "Fled Battle";
  } else if (ship.isDestroyed()) {
    condition = "Destroyed";
  } else if (ship.isDamaged()) {
    condition = "Damaged";
  }
  let status = document.createElement('p');
  status.innerHTML = "Status: " + condition;
  anonDiv.appendChild(status);

  let hp = document.createElement('p');
  hp.innerHTML = "HitPoints: "+ship.getHitpoints()+"/"+ship.getMaxHitpoints();
  anonDiv.appendChild(hp);

  let fp = document.createElement('p');
  fp.innerHTML = "Attack Strength: "+ship.getAttackStrength();
  anonDiv.appendChild(fp);

  let shields = document.createElement('p');
  shields.innerHTML = "Shields: "+ship.getShields();
  anonDiv.appendChild(shields);

  // Only players have these stats
  if (isPlayer) {
    let kills = document.createElement('p');
    if (object.getTotalKills() == 0) {
      kills.innerHTML = "Kills: 0";
    } else {
      let html = "Kills:<ul>";
      for (let rank of ranks) {
        rankKills = object.getKills(rank);
        if (rankKills > 0) {
          html += "<li>"+rank+": "+rankKills+"</li>";
        }
      }
      html += "</ul>";
      kills.innerHTML = html;
    }
    anonDiv.appendChild(kills);

    let titles = document.createElement('p');
    let playerTitles = object.getTitles();
    if (playerTitles.length == 0) {
      kills.innerHTML = "Titles: None";
    } else {
      let html = "Titles:<ul>";
      for (let title of playerTitles) {
        html += "<li>"+title+"</li>";
      }
      html += "</ul>";
      titles.innerHTML = html;
    }
    anonDiv.appendChild(titles);
  }

  ic.appendChild(anonDiv);
  info.appendChild(ic);

  // Inject the generated content
  let infoPopup = document.getElementById('more-info');
  infoPopup.insertBefore(info, infoPopup.firstChild);
}

// A function to open the info page
function openInfo() {
  let objIdx = this.getAttribute("data-id");
  let classType = this.getAttribute("data-type");
  let objInst = activeGame["get"+classType](objIdx);
  populateInfoPopup(objInst);
  openPopup('more-info');
}
// A function to buy an upgrade
function doBuyUpgrade() {
  let upgradeIdx = this.getAttribute("data-id");
  let upgrade = upgrades[upgradeIdx];
  let player = upgradingPlayer;
  let money = player.getMoney()
  if (money < upgrade.getPrice()) {
    let units = (money==1 ? "credit" : "credits");
    alert(format(TOO_POOR_ALERT, [player.getName(), money, units, upgrade.getName()]));
    return;
  }
  buyUpgrade(player, upgrade);
  closeShop();
}

// A function to perform repairs
function doRepair() {
  let playerIdx = this.getAttribute("data-id");
  let player = activeGame.getPlayer(playerIdx);
  if (!player.getShip().isDamaged()) {
    alert("No repairs are currently needed.");
    return;
  }
  if (player.getMoney() == 0) {
    alert("You have no money for repairs.");
    return;
  }
  buyRepair(player);
  updateScreen();
}

// A function to open the shop popup
function doShop() {
  let playerIdx = this.getAttribute("data-id");
  upgradingPlayer = activeGame.getPlayer(playerIdx);
  openShop();
}

// A function to flee from battle
function doRetreat() {
  let playerIdx = this.getAttribute("data-id");
  let player = activeGame.getPlayer(playerIdx);
  if (confirm(format(FLEE_CONFIRM, [player.getName()]))) {
    player.retreat();
    togglePlayerButtons(playerIdx);
    output(format(FLED, [player.getName()]));
    awardTitle(player, "Coward");
    checkForGameEnd();
    updateScreen();
  }
}

// A console-only function for enabling God Mode for player 1
const enableGodMode = () => {
  if (confirm("Are you sure you want to break the game?")) {
    let player = activeGame.getPlayer(0);
    player.getShip().upgradeShield(99);
    player.adjustMoney(99);
    updateScreen();
  }
}

// Actions that need to happen once per page load
// Add static event listeners
document.getElementById('start').addEventListener('click', startGame);
document.getElementById('close-shop').addEventListener('click', closeShop);
document.getElementById('close-info').addEventListener('click', closeInfo);
document.getElementById('reconfig').addEventListener('click', openSettings);
document.getElementById('reset').addEventListener('click', restartGame);
document.getElementById('fight').addEventListener('click', doAttackRound);
document.getElementById('cur-alien').addEventListener('click', openInfo);

// Populate the shop items
populateShop();
