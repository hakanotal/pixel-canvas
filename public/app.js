const screenWidth = 1280;
const screenHeight = 640;
const size = 20;
const width = screenWidth/size;
const height = screenHeight/size;
const address = 'https://pixel-canvas.herokuapp.com/';
//const address = 'http://localhost:3000/';

let socket;
let grid = [];
for(let y=0; y<height; y++){
  grid[y] = [];
  for(let x=0; x<width; x++){
    grid[y][x] = [100, 100, 100];
  }
}

//Color Change
let colorPickers = [];
let colorButtons = [];
let R=255, G=255, B=255;

function changeColor(){
  let index = colorButtons.indexOf(this);
  R = red(colorPickers[index].color());
  G = green(colorPickers[index].color());
  B = blue(colorPickers[index].color());
}
function keyPressed() {
  let index = 0;
  if (keyCode === 49) index = 0;
  else if (keyCode === 50) index = 1;
  else if (keyCode === 51) index = 2;
  else if (keyCode === 52) index = 3;
  
  R = red(colorPickers[index].color());
  G = green(colorPickers[index].color());
  B = blue(colorPickers[index].color());
}
function clearCanvas(r, g, b){
  let data = {r: r, g: g, b: b}; 
  socket.emit('clear', data);
  console.log("Canvas cleared.");
}

function setup() {
  //Canvas
  frameRate(30);
  let cnv = createCanvas(screenWidth, screenHeight);
  cnv.position(10, 10, 'fixed');

  //Color
  let startColors = ['#ff0000', '#00ff00', '#0000ff', '#000000'];
  for(let i=0; i<4; i++){
    colorPickers[i] = createColorPicker(startColors[i]);
    colorPickers[i].position(1300, 70 + (i*150));
    colorPickers[i].size(92, 94);

    colorButtons[i] = createButton('Color #'+(i+1));
    colorButtons[i].position(1300, 170 + (i*150));
    colorButtons[i].size(100, 30);
    colorButtons[i].mouseClicked(changeColor);
  }

  //Download
  let download_button = createButton('DOWNLOAD');
  download_button.position(1300, 10);
  download_button.size(100, 30);
  function download(){
    saveCanvas(cnv, 'pixel-art', 'jpg');
  }
  download_button.mousePressed(download);

  //Server Connection
  socket = io.connect(address)
  socket.on('init', data => {
    grid = data;
  })
	socket.on('update', data => {
    grid[data.y][data.x] = [data.r, data.g, data.b];
  })
}

function draw() {
  background(0);
  noStroke();
  for(let y=0; y<height; y++){
    for(let x=0; x<width; x++){
      fill(grid[y][x])
      square(x*size, y*size, size);
    }
  }

  //Hover Effect
  let X = floor(mouseX/size);
  let Y = floor(mouseY/size);
  noFill();
  stroke(0);
  square(X*size, Y*size, size);

  //Paint
  if(mouseIsPressed){
    if(X >= 0 && X < width && Y >= 0 && Y < height){
      if (mouseButton == LEFT) {
        if(grid[Y][X][0] != R || grid[Y][X][1] != G || grid[Y][X][2] != B){
          let data = { x : X, y : Y, r : R, g : G, b : B }
          socket.emit('paint', data);
          console.log(grid[Y][X], [R, G, B]);
        }
      }
      else if (mouseButton == RIGHT) {
        if(grid[Y][X][0] != 255 || grid[Y][X][1] != 255 || grid[Y][X][2] != 255){
          let data = { x : X, y : Y, r : 255, g : 255, b : 255 }
          socket.emit('paint', data);
        }
      }
    }
  }
}