// Game strings
const ALIEN_APPEAR = '*** A <span class="enemy">{0}</span> appeared! ***';
const NEW_TITLE = '<span class="player">{0}</span> received the title: <span class="title">{1}</span>';
const SALVAGE = '<span class="player">{0}</span> collected salvage worth <span class="money">{1} {2}</span>.';
const MISSED = '<span class="{1}">{0}</span>\'s attack missed.';
const DAMAGE = '<span class="{3}">{0}</span> does <span class="damage">{1} damage</span> to <span class="{4}">{2}</span>\'s ship.';
const ENEMY_DEAD = '<span class="enemy">{0}</span>\'s ship was destroyed!';
const PLAYER_DEAD = '<span class="player">{0}</span>\'s ship, <span class="player">{1}</span>, was destroyed!';
const REPAIR = '<span class="player">{0}</span> completed some ship repairs.';
const UPGRADE = '<span class="player">{0}</span> bought the upgrade: <span class="upgrade">{1}</span>';
const TOO_POOR = 'Sorry, <span class="player">{0}</span> doesn\'t have the funds to buy: <span class="upgrade">{1}</span>';
const TOO_POOR_ALERT = '{0} has {1} {2} which is not enough to buy the {3} upgrade.';
const WON = 'Congratulations! The aliens have been defeated! Humanity lives on!';
const LOST = 'Oh no! With no one left to defeat them, the aliens have enslaved all of humanity.';
const ITEM = '<span class="upgrade">{0}</span>  ( <span class="money">&#8373;{1}</span> )';
const FLEE_CONFIRM = 'Are you sure you want {0} to flee from battle?';
const FLED = '<span class="player">{0}</span> has fled the battle!';

// Helper function to do replacements
const format = (template, replacementArray) => {
  let result = template;
  for (let i=0; i<replacementArray.length; i++) {
    let re = "\\{"+i+"\\}"; // we want the backslash literal in the re string
    result = result.replace(new RegExp(re, "g"), replacementArray[i]);
  }
  return result;
}
