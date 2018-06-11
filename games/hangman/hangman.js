// All of the words to choose from
const words = [
  "abruptly","absurd","abyss","affix","askew","avenue","awkward","axiom","azure","bagpipes","bandwagon","banjo","bayou","beekeeper","bikini",
  "blitz","blizzard","boggle","bookworm","boxcar","boxful","buckaroo","buffalo","buffoon","buxom","buzzard","buzzing","buzzwords","caliph",
  "cobweb","cockiness","croquet","crypt","curacao","cycle","daiquiri","dirndl","disavow","dizzying","duplex","dwarves","embezzle","equip",
  "espionage","euouae","exodus","faking","fishhook","fixable","fjord","flapjack","flopping","fluffiness","flyby","foxglove","frazzled","frizzled",
  "fuchsia","funny","gabby","galaxy","galvanize","gazebo","giaour","gizmo","glowworm","glyph","gnarly","gnostic","gossip","grogginess","haiku",
  "haphazard","hyphen","iatrogenic","icebox","injury","ivory","ivy","jackpot","jaundice","jawbreaker","jaywalk","jazziest","jazzy","jelly","jigsaw",
  "jinx","jiujitsu","jockey","jogging","joking","jovial","joyful","juicy","jukebox","jumbo","kayak","kazoo","keyhole","khaki","kilobyte","kiosk",
  "kitsch","kiwifruit","klutz","knapsack","larynx","lengths","lucky","luxury","lymph","marquis","matrix","megahertz","microwave","mnemonic",
  "mystify","naphtha","nightclub","nowadays","numbskull","nymph","onyx","ovary","oxidize","oxygen","pajama","peekaboo","phlegm","pixel","pizazz",
  "pneumonia","polka","pshaw","psyche","puppy","puzzling","quartz","queue","quips","quixotic","quiz","quizzes","quorum","razzmatazz","rhubarb",
  "rhythm","rickshaw","schnapps","scratch","shiv","snazzy","sphinx","spritz","squawk","staff","strength","strengths","stretch","stronghold",
  "stymied","subway","swivel","syndrome","thriftless","thumbscrew","topaz","transcript","transgress","transplant","triphthong","twelfth",
  "twelfths","unknown","unworthy","unzip","uptown","vaporize","vixen","vodka","voodoo","vortex","voyeurism","walkway","waltz","wave","wavy",
  "waxy","wellspring","wheezy","whiskey","whizzing","whomever","wimpy","witchcraft","wizard","woozy","wristwatch","wyvern","xylophone","yachtsman",
  "yippee","yoked","youthful","yummy","zephyr","zigzag","zigzagging","zilch","zipper","zodiac","zombie"
];

// All all the valid input
const letters = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
];

// A function to choose a random word
const pickWord = () => {
  return words[Math.floor(Math.random()*words.length)];
};

// A function to verify a valid guess
// Return null on success, error message otherwise
const checkGuess = (letter, alreadyGuessed) => {
  if (letter.length != 1){
    return "Your guess must be a single letter";
  }
  let normalized = letter.toUpperCase();
  if (letters.indexOf(normalized) == -1) {
    return "Your guess must be a letter from A-Z";
  }
  if (alreadyGuessed.indexOf(normalized) != -1) {
    return "You already guessed that letter";
  }
  return null;
};

// The state of a game
class Game {
  constructor(word) {
    this.word = word.toUpperCase();
    this.won = false;
    this.guessedLetters = [];
    this.wrongGuessesLeft = 6;
    this.charDisplay = Array(this.word.length).fill('-');
  }
  getWordState() {
    return this.charDisplay.join('');
  }
  guessLetter(letter) {
    let error = checkGuess(letter, this.guessedLetters);
    if (error) {
      return error;
    }
    let normalized = letter.toUpperCase();
    this.guessedLetters.push(normalized);
    if (this.word.indexOf(normalized) == -1) {
      this.wrongGuessesLeft--;
    } else {
      for (let i=0; i<this.word.length; i++) {
        if (this.word[i] == normalized) {
          this.charDisplay[i] = normalized;
        }
      }
      if (this.charDisplay.indexOf('-')==-1) {
        this.won = true;
      }
    }
  }
  guessesLeft() {
    return this.wrongGuessesLeft;
  }
  isOver() {
    return (this.wrongGuessesLeft==0 || this.charDisplay.indexOf('-')==-1);
  }
  wonGame() {
    return (this.isOver() && this.won);
  }
};

// Start a new game
const resetGame = () => {
  activeGame = new Game(pickWord());
  document.getElementById("output").innerHTML = '';
  document.getElementById("word").innerHTML = activeGame.getWordState();
  document.getElementById("board").style.backgroundImage = "url('images/6.png')";
};

// A function to populate the letter buttons
const populateLetters = (domParent) => {
  while (domParent.firstChild) {
    domParent.removeChild(domParent.firstChild);
  }
  for (let letter of letters) {
    let btn = document.createElement('button');
    btn.setAttribute("type", "button");
    btn.innerHTML = letter;
    btn.addEventListener('click', makeGuess);
    domParent.appendChild(btn);
  }
};

// A function to guess a letter based on a click
function makeGuess() {
  if (activeGame==null || activeGame.isOver()) return;
  let letter = this.innerHTML;
  let error = activeGame.guessLetter(letter);
  let outputHtml = (error ? error : '');
  document.getElementById("word").innerHTML = activeGame.getWordState();
  document.getElementById("board").style.backgroundImage =
    "url('images/"+activeGame.guessesLeft()+".png')";
  if (activeGame.isOver()) {
    outputHtml = (activeGame.wonGame() ? "You Won!" : "Try Again!");
  }
  document.getElementById("output").innerHTML = outputHtml;
}

let activeGame = null;
populateLetters(document.getElementById("letters"));
document.getElementById("new-game-button").addEventListener('click', resetGame);
