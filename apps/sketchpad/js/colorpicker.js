// console.log('app.js loaded for palette picker');
let selectedColor = "rgb(0,0,0)";

// A function to generate an integer in a certain range
const randInt = (limit, offset=0) => {
  return (Math.floor(Math.random()*parseInt(limit)) + parseInt(offset));
}

// A function to handle a color being picked
const colorPicked = (event) => {
  selectedColor = $(event.currentTarget).css('background-color');
}

// A function to check if the user provided a valid limit
const badLimitValue = (limit) => {
  return (isNaN(limit) || limit<0 || limit>256);
}

// A function to check if the user provided a valid limit/offset pair
const badLimitOffsetCombo = (limit, offset) => {
  return (isNaN(offset) || offset<0 || limit+offset>256)
}

// Check the user input. Return false onn problem, true if everything's fine
const validateUserInput = () => {
  let r1 = parseInt($('#R1').val());
  let r2 = parseInt($('#R2').val());
  let g1 = parseInt($('#G1').val());
  let g2 = parseInt($('#G2').val());
  let b1 = parseInt($('#B1').val());
  let b2 = parseInt($('#B2').val());
  if (badLimitValue(r1) || badLimitValue(g1) || badLimitValue(b1) ||
      badLimitOffsetCombo(r1,r2) || badLimitOffsetCombo(g1,g2) || badLimitOffsetCombo(b1,b2))
  {
    alert('The R1, G1, and B1 fields must be an integer in the range 0-256. The total of the pairs R1+R2, G1+G2, and B1+B2 must also fall in the range 0-256.');
    return false;
  }
  return true;
}

// Generate a single randomly colored square
const generateColorSquare = (parent) => {
  const color = `rgb(${randInt($('#R1').val(), $('#R2').val())},${randInt($('#G1').val(), $('#G2').val())},${randInt($('#B1').val(), $('#B2').val())})`;
  const $div = $('<div>').addClass('square').css('background-color',color);
  $div.on('click', colorPicked);
  parent.append($div);
}

// Generate a palette of random color squares
const generateColorSwatches = (event) => {
  if (!validateUserInput()) return false;
  const $parent = $('#color-palette');
  $parent.empty();
  for (let i=0; i<30; i++) {
    generateColorSquare($parent);
  }
  return false;
}
