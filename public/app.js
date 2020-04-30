const screenWidth = 640;
const screenHeight = 640;
const size = 20;
const width = screenWidth/size;
const height = screenHeight/size;
const address = 'https://pixel-canvas.herokuapp.com/';

let socket;
let grid = [];
for(let y=0; y<width; y++){
  grid[y] = [];
  for(let x=0; x<height; x++){
    grid[y][x] = [100, 100, 100];
  }
}

let colorPicker, R=255, G=255, B=255;
function changeColor(){
  R = red(colorPicker.color());
  G = green(colorPicker.color());
  B = blue(colorPicker.color());
}

function mousePressed(){
  let X = floor(mouseX/size);
  let Y = floor(mouseY/size);
  if(X >= 0 && X < width && Y >= 0 && Y < height){
    let data = { x : X, y : Y, r : R, g : G, b : B }
    socket.emit('paint', data);
  }
}

function clearCanvas(r, g, b){
  let data = {r: r, g: g, b: b}; 
  socket.emit('clear', data);
  console.log("Canvas cleared.");
}

function setup() {
  //Canvas
  let cnv = createCanvas(screenWidth, screenHeight);
  cnv.center("horizontal");

  //Color
  colorPicker = createColorPicker('#ffffff');
  colorPicker.position(100, 300);
  colorPicker.size(100, 100);
  colorPicker.input(changeColor);

  //Download
  let button = createButton('DOWNLOAD');
  button.position(100, 50);
  button.size(100, 30);
  function download(){
    saveCanvas(cnv, 'pixel-art', 'jpg');
  }
  button.mousePressed(download);

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
  for(let y=0; y<width; y++){
    for(let x=0; x<height; x++){
      fill(grid[y][x])
      square(x*size, y*size, size);
    }
  }
}