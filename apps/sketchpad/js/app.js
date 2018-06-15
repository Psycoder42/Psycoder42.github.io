
const changeColor = (event) => {
  $(event.currentTarget).css('background-color',selectedColor);
}

const validateCanvasSizes = () => {
let width = parseInt($('#width').val());
let height = parseInt($('#height').val());
  if (isNaN(width) || isNaN(height) || width<10 || height<10 || width>60 || height>60)
  {
    alert('The width and height fields must be an integer in the range 10-60.');
    return false;
  }
  return true;
}

const generateCanvas = () => {
  if (!validateCanvasSizes()) return false;
  let $canvas = $('#canvas');
  let width = parseInt($('#width').val());
  let height = parseInt($('#height').val());
  $canvas.empty();
  $canvas.css('height',height*10).css('width',width*10);
  for (let i=0; i<height; i++) {
    let $div = $('<div>').addClass('row');
    for (let j=0; j<width; j++) {
      $div.append($('<div>').addClass('pixel').on('mouseover', changeColor));
    }
    $('#canvas').append($div);
  }
  return false;
}

// To run after page loads
const runOnReady = () => {
  $('#reset').on('click', generateCanvas);
  $('#generate').on('click', generateColorSwatches);
  generateColorSwatches();
  generateCanvas();
}

// Run when the page is done loading
$(runOnReady);
