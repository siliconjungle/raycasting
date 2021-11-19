let projectionCanvas;
let projectionCtx;

const FLOOR_HEIGHT = 120
let posX = 22, posY = 12, posZ = 120 // x and y start position
let dirX = -1, dirY = 0; // Initial direction vector
// let pitch = 0;
let planeX = 0, planeY = 0.66; // The 2D raycaster version of camera plane
let paused = false;

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const MAP_WIDTH = 24;
const MAP_HEIGHT = 24;
const TEXTURE_WIDTH = 32
const TEXTURE_HEIGHT = 32
const CHARACTER_WIDTH = 50;
const CHARACTER_HEIGHT = 50;
// const PLANT_WIDTH = 42;
// const PLANT_HEIGHT = 42;
const PILLAR_WIDTH = 46;
const PILLAR_HEIGHT = 46;

let WORLD_MAP;
let WALL_MAP2;
let FLOOR_MAP;
let RENDER_FLOORS = [];
for (let z = 0; z < 3; z++) {
  RENDER_FLOORS.push([])
  for (let y = 0; y < MAP_HEIGHT; y++) {
    RENDER_FLOORS[z].push([])
    for (let x = 0; x < MAP_WIDTH; x++) {
      RENDER_FLOORS[z][y].push(0)
    }
  }
}
let connectionSocket

// x, y, texture
let entities = [
  // { x: 20.5, y: 11, texNum: 1 },
  // { x: 20, y: 11.5, texNum: 2 },
  // { x: 19.5, y: 11, texNum: 2 },
  // { x: 13, y: 10, texNum: 3 },
  // { x: 19, y: 11, texNum: 1 },
  // { x: 18.5, y: 11, texNum: 0 },
  // { x: 18, y: 11, texNum: 1 },
  // { x: 17.5, y: 11, texNum: 0 },
  // { x: 17, y: 11, texNum: 0 },
  // { x: 16.5, y: 11, texNum: 0 },
  // { x: 16.5, y: 10, texNum: 0 },
  // { x: 18.5, y: 4.5, texNum: 0 },
  // { x: 22.5, y: 9.5, texNum: 4 },
  // { x: 20.5, y: 9.5, texNum: 5 },
];

const zBuffer = new Array(SCREEN_WIDTH).fill(0);

// arrays used to sort the sprites
let spriteOrder = new Array(entities.length);
let spriteDistance = new Array(entities.length);

// Whenever a new character is created you should push the entity in and add a new element to distance and sprite order.
// This is a bit hacky... I feel like this spriteOrder & distance thing needs a re-work.
export const addEntity = (x, y, type) => {
  entities.push({ x, y, texNum: type })
  spriteOrder.push(0)
  spriteDistance.push(0)
}

// This is pretty garbage
export const updateEntities = (players) => {
  // The character you control is not included
  // This is so dirty.
  entities = players
  if (players.length !== entities.length) {
    spriteOrder = new Array(entities.length)
    spriteDistance = new Array(entities.length);
  }
}

let deltaTime;
let oldTimeStamp;
let fps;

const ROTATION_SPEED = 2
const MOVEMENT_SPEED = 5

const roofColor = 'rgb(0, 0, 0)';

let floorImages = []
let wallImages = []
let entityImages = []
let floorsData = []

// Can we please extract all of this logic out so that it's much easier to track key presses?
let leftDown = false
let rightDown = false
let upDown = false
let downDown = false
let jDown = false
let lDown = false

document.addEventListener('keydown', (e) => {
  switch (e.which) {
    case 65:
      leftDown = true;
      break;
    case 68:
      rightDown = true;
      break;
    case 87:
      upDown = true;
      break;
    case 83:
      downDown = true;
      break;
    case 74:
      jDown = true;
      break;
    case 76:
      lDown = true;
      break;
    case 32:
      posZ += 50;
      vSpeed = JUMP_SPEED;
      grounded = false;
      // pitch += 10
      // posZ += 10
      // addEntity(posX, posY, 1);
      break;
    case 50:
      // pitch -= 10
      // posZ -= 10
      // addEntity(posX, posY, 2);
      break;
    case 51:
      // addEntity(posX, posY, 0);
      break;
    case 52:
      // addEntity(posX, posY, 4);
      break;
    case 53:
      // addEntity(posX, posY, 5)
      break;
  }
}, false);

document.addEventListener('keyup', (e) => {
  switch (e.which) {
    case 65:
      leftDown = false;
      break;
    case 68:
      rightDown = false;
      break;
    case 87:
      upDown = false;
      break;
    case 83:
      downDown = false;
      break;
    case 74:
      jDown = false;
      break;
    case 76:
      lDown = false;
      break;
  }
}, false);

const convertImageToImageData = image => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  const imageData2D = [];

  // Now you can access pixel data from imageData.data.
  // It's a one-dimensional array of RGBA values.
  // Here's an example of how to get a pixel's color at (x,y)
  for (let y = 0; y < canvas.width; y++) {
    imageData2D.push([]);
    for (let x = 0; x < canvas.height; x++) {
      const index = (y * imageData.width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];
      imageData2D[y].push([r, g, b, a]);
    }
  }

  return imageData2D;
};

// init(WORLD_MAP, FLOOR_MAP, textures, floors, walls, sprites)
// Please improve your naming conventions...
export const init = (worldMap, wallMap2, floorMap, floors, walls, sprites) => {
  floorImages = floors
  wallImages = walls
  entityImages = sprites
  floorsData = floorImages.map(image => convertImageToImageData(image));

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      RENDER_FLOORS[0][y][x] = floorMap[y][x] > -1 && worldMap[y][x] === 0
    }
  }

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      RENDER_FLOORS[1][y][x] = worldMap[y][x] !== 0 && wallMap2[y][x] === 0
    }
  }

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      RENDER_FLOORS[2][y][x] = wallMap2[y][x] !== 0
    }
  }

  // for (let z = 0; z < 3; z++) {
  //   for (let y = 0; y < MAP_HEIGHT; y++) {
  //
  //   }
  // }

  initGame(worldMap, wallMap2, floorMap)
};

export const setPaused = (nextPaused) => {
  paused = nextPaused;
};

export const setWorldMap = (worldMap) => {
  WORLD_MAP = worldMap;
};

export const setFloorMap = (floorMap) => {
  FLOOR_MAP = floorMap;
};

export const setWallMap2 = (wallMap2) => {
  WALL_MAP2 = wallMap2;
}

const initGame = (worldMap, wallMap2, floorMap) => {
  setFloorMap(floorMap);
  setWorldMap(worldMap);
  setWallMap2(wallMap2);

  connectionSocket = new WebSocket('ws://localhost:8080')

  connectionSocket.onopen = (event) => {
    // connectionSocket.send('Send a first message!')
  }

  connectionSocket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    const { players } = message
    updateEntities(players)
  }

  projectionCanvas = document.getElementById('projection');
  projectionCtx = projectionCanvas.getContext('2d');
  // floorImageData = projectionCtx.createImageData(projectionCanvas.width, projectionCanvas.height * 0.5);

  floorImageData = projectionCtx.createImageData(projectionCanvas.width, projectionCanvas.height);

  window.requestAnimationFrame(gameLoop);
}

let firstLoop = true;

// There are a tonne of improvements that can be done e.g. combining the x and y positions into a single value.
const updateNetworkedPosition = (lastPosX, lastPosY) => {
  // Only update the position of your character if the socket is open, otherwise do it another time.
  // This probably shouldn't be done every frame either... maybe restrict it to x times per second?
  if (connectionSocket?.readyState === WebSocket.OPEN) {
    // Only send an update if the character has moved this frame.
    // It also might be worthwhile limiting how often these messages are sent.
    if (lastPosX !== posX || lastPosY !== posY) {
      connectionSocket.send(JSON.stringify({type: 'position', x: posX, y: posY}))
    }
  }
}

const GRAVITY = 85;
const MIN_V_SPEED = -200;
const JUMP_SPEED = 50;
let vSpeed = 0;
let grounded = false;

const applyPhysics = (deltaTime) => {
  // console.log('_POS_Z_', posZ);
  // console.log('_GRAVITY_', GRAVITY);
  // console.log('_DELTA_TIME_', deltaTime);
  // posZ = posZ - (GRAVITY * deltaTime);
  // console.log('_GRAVITY_DELLTA_', GRAVITY * deltaTime);
  if (deltaTime) {
    // posZ (GRAVITY * deltaTime);
    vSpeed -= GRAVITY * deltaTime;
    if (vSpeed < MIN_V_SPEED) {
      vSpeed = MIN_V_SPEED
    }
    posZ += vSpeed;
    if (posZ < FLOOR_HEIGHT) {
      posZ = FLOOR_HEIGHT;
      vSpeed = 0;
      grounded = true;
    }
  }
}

const gameLoop = (timeStamp) => {
  // Add an optimisation where this only happens when something has changed.
  // if (upDown || downDown || leftDown || rightDown || jDown || lDown || firstLoop) {
  if (firstLoop || !paused) {
    drawWorld();
    firstLoop = false;
  }

  // Make the first frame not be garbage.
  // Calculate the number of seconds passed since the last frame
  deltaTime = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  // Calculate fps
  fps = Math.round(1 / deltaTime);

  const lastPosX = posX, lastPosY = posY
  applyPhysics(deltaTime);

  if (!paused) {
    if (upDown) {
      // if (WORLD_MAP[Math.trunc(posX + dirX * MOVEMENT_SPEED * deltaTime)][Math.trunc(posY)] === 0) {
      posX += dirX * MOVEMENT_SPEED * deltaTime;
      // }
      // if (WORLD_MAP[Math.trunc(posX)][Math.trunc(posY + dirY * MOVEMENT_SPEED * deltaTime)] === 0) {
      posY += dirY * MOVEMENT_SPEED * deltaTime;
      // }
    }

    if (downDown) {
      // if (WORLD_MAP[Math.trunc(posX - dirX * MOVEMENT_SPEED * deltaTime)][Math.trunc(posY)] === 0) {
      posX -= dirX * MOVEMENT_SPEED * deltaTime;
      // }
      // if (WORLD_MAP[Math.trunc(posX)][Math.trunc(posY - dirY * MOVEMENT_SPEED * deltaTime)] === 0) {
      posY -= dirY * MOVEMENT_SPEED * deltaTime;
      // }
    }

    // These could use planeX and planeY rather than flipping these values.
    if (jDown) {
      // if (WORLD_MAP[Math.trunc(posX - dirY * MOVEMENT_SPEED * deltaTime)][Math.trunc(posY)] === 0) {
      posX -= dirY * MOVEMENT_SPEED * deltaTime;
      // }
      // if (WORLD_MAP[Math.trunc(posX)][Math.trunc(posY + dirX * MOVEMENT_SPEED * deltaTime)] === 0) {
      posY += dirX * MOVEMENT_SPEED * deltaTime;
      // }
    }

    if (lDown) {
      // if (WORLD_MAP[Math.trunc(posX + dirY * MOVEMENT_SPEED * deltaTime)][Math.trunc(posY)] === 0) {
      posX += dirY * MOVEMENT_SPEED * deltaTime;
      // }
      // if (WORLD_MAP[Math.trunc(posX)][Math.trunc(posY - dirX * MOVEMENT_SPEED * deltaTime)] === 0) {
      posY -= dirX * MOVEMENT_SPEED * deltaTime;
      // }
    }

    // rotate to the right
    if (rightDown) {
      // both camera direction and camera plane must be rotated
      const oldDirX = dirX;
      dirX = dirX * Math.cos(-ROTATION_SPEED * deltaTime) - dirY * Math.sin(-ROTATION_SPEED * deltaTime);
      dirY = oldDirX * Math.sin(-ROTATION_SPEED * deltaTime) + dirY * Math.cos(-ROTATION_SPEED * deltaTime);
      const oldPlaneX = planeX;
      planeX = planeX * Math.cos(-ROTATION_SPEED * deltaTime) - planeY * Math.sin(-ROTATION_SPEED * deltaTime);
      planeY = oldPlaneX * Math.sin(-ROTATION_SPEED * deltaTime) + planeY * Math.cos(-ROTATION_SPEED * deltaTime);
    }
    // rotate to the left
    if (leftDown) {
      // both camera direction and camera plane must be rotated
      const oldDirX = dirX;
      dirX = dirX * Math.cos(ROTATION_SPEED * deltaTime) - dirY * Math.sin(ROTATION_SPEED * deltaTime);
      dirY = oldDirX * Math.sin(ROTATION_SPEED * deltaTime) + dirY * Math.cos(ROTATION_SPEED * deltaTime);
      const oldPlaneX = planeX;
      planeX = planeX * Math.cos(ROTATION_SPEED * deltaTime) - planeY * Math.sin(ROTATION_SPEED * deltaTime);
      planeY = oldPlaneX * Math.sin(ROTATION_SPEED * deltaTime) + planeY * Math.cos(ROTATION_SPEED * deltaTime);
    }

    // This should either be a) a react element or b) be on a separate canvas - I need to be able to freeze the main stage.
    projectionCtx.font = '25px Arial';
    projectionCtx.fillStyle = 'white';
    projectionCtx.fillText("FPS: " + fps, 10, 30);
  }

  updateNetworkedPosition(lastPosX, lastPosY)

  window.requestAnimationFrame(gameLoop);
}

// const floorPixels = new Array(SCREEN_WIDTH * SCREEN_HEIGHT * 0.5 * 4).fill(0)
const floorPixels = new Array(SCREEN_WIDTH * SCREEN_HEIGHT * 4).fill(0)

const rayCastFloor = (tileZ) => {
  // const rayData = [];

  // rayDir for leftmost ray (x = 0) and rightmost ray (x = w)
  const rayDirX0 = dirX - planeX;
  const rayDirY0 = dirY - planeY;
  const rayDirX1 = dirX + planeX;
  const rayDirY1 = dirY + planeY;

  // let currentWallMap;
  // let renderCondition

  // if (tileZ === 0) {
    // currentWallMap = WORLD_MAP
    // acceptedCondition = value === 0
    // renderCondition = WORLD_MAP
  // } else if (tileZ === 1) {
    // currentWallMap = WALL_MAP2
    // acceptedCondition value === 0
  // } else if (tileZ === 2) {
    // currentWallMap = WALL_MAP2
  // }
  let i = 0;

  for (let x = 0; x < SCREEN_WIDTH; x++) {
    for (let y = 0; y < SCREEN_HEIGHT * 0.5; y++) {
      floorPixels[i++] = 0
      floorPixels[i++] = 0
      floorPixels[i++] = 0
      floorPixels[i++] = 255
    }
  }

  // let i = SCREEN_WIDTH * SCREEN_HEIGHT * 0.5 * 4;

  //FLOOR CASTING
  // for (let y = SCREEN_HEIGHT * 0.5; y < SCREEN_HEIGHT; y++) {
  const camZ = 0.5 * SCREEN_HEIGHT + posZ - tileZ * SCREEN_HEIGHT;

  for (let y = SCREEN_HEIGHT * 0.5; y < SCREEN_HEIGHT; y++) {
    // Current y position compared to the center of the screen (the horizon)
    const p =  y - SCREEN_HEIGHT / 2; /* - pitch; */

    // console.log('_TILE_Z_', tileZ)
    // Vertical position of the camera.
    // console.log('_TILE_Z_TIMES_SCREEN_HEIGHT_', tileZ * SCREEN_HEIGHT)


    // Horizontal distance from the camera to the floor for the current row.
    // 0.5 is the z position exactly in the middle between floor and ceiling.
    const rowDistance = camZ / p;

    // calculate the real world step vector we have to add for each x (parallel to camera plane)
    // adding step by step avoids multiplications with a weight in the inner loop
    const floorStepX = rowDistance * (rayDirX1 - rayDirX0) / SCREEN_WIDTH;
    const floorStepY = rowDistance * (rayDirY1 - rayDirY0) / SCREEN_WIDTH;

    // real world coordinates of the leftmost column. This will be updated as we step to the right.
    let floorX = posX + rowDistance * rayDirX0;
    let floorY = posY + rowDistance * rayDirY0;

    for (let x = 0; x < SCREEN_WIDTH; ++x) {
      // the cell coord is simply got from the integer parts of floorX and floorY
      const cellX = Math.trunc(floorX);
      const cellY = Math.trunc(floorY);

      // get the texture coordinate from the fractional part
      const tx = Math.trunc(TEXTURE_WIDTH * (floorX - cellX)) & (TEXTURE_WIDTH - 1);
      const ty = Math.trunc(TEXTURE_HEIGHT * (floorY - cellY)) & (TEXTURE_HEIGHT - 1);

      floorX += floorStepX;
      floorY += floorStepY;

      const floorTexture = cellY >= 0 && cellY < MAP_HEIGHT && cellX >= 0 && cellX < MAP_WIDTH && RENDER_FLOORS[tileZ][cellX][cellY] ? FLOOR_MAP[cellX][cellY] : -1;
      // rayData.push(...(floorTexture > -1 && floorTexture < floorsData.length ? floorsData[floorTexture][ty][tx] : [0, 0, 0, 255]));
      if (floorTexture > -1 && floorTexture < floorsData.length) {
        floorPixels[i++] = floorsData[floorTexture][ty][tx][0]
        floorPixels[i++] = floorsData[floorTexture][ty][tx][1]
        floorPixels[i++] = floorsData[floorTexture][ty][tx][2]
        floorPixels[i++] = floorsData[floorTexture][ty][tx][3]
      } else {
        if (tileZ === 0) {
          floorPixels[i++] = 0
          floorPixels[i++] = 0
          floorPixels[i++] = 0
          floorPixels[i++] = 255
        } else {
          i += 4
        }
      }

      // 0, 1, 2, 3
    }
  }

  // ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
  // ctx.fillRect( x, y, 1, 1 );
  // return rayData;
  return floorPixels
}

const getSpriteWidth = spriteOrderId => {
  const texNum = entities[spriteOrder[spriteOrderId]].texNum
  return texNum === 0 || texNum === 4 || texNum === 5  ? PILLAR_WIDTH : CHARACTER_WIDTH
}

const getSpriteHeight = spriteOrderId => {
  const texNum = entities[spriteOrder[spriteOrderId]].texNum
  return texNum === 0 || texNum === 4 || texNum === 5  ? PILLAR_HEIGHT : CHARACTER_WIDTH
}

const rayCastSprites = () => {
  for (let i = 0; i < entities.length; i++) {
    spriteOrder[i] = i;
    spriteDistance[i] = ((posX - entities[i].x) * (posX - entities[i].x) + (posY - entities[i].y) * (posY - entities[i].y)); //sqrt not taken, unneeded
  }

  const spritesData = entities.map((_, i) =>
    ({ distance: spriteDistance[i], rayData: [] }))
  spritesData.sort(compareDistance);

  // After sorting the sprites, do the projection and draw them
  for (let i = 0; i < entities.length; i++) {
    const spriteX = entities[spriteOrder[i]].x - posX;
    const spriteY = entities[spriteOrder[i]].y - posY;

    //transform sprite with the inverse camera matrix
    // [ planeX   dirX ] -1                                       [ dirY      -dirX ]
    // [               ]       =  1/(planeX*dirY-dirX*planeY) *   [                 ]
    // [ planeY   dirY ]                                          [ -planeY  planeX ]

    const invDet = 1.0 / (planeX * dirY - dirX * planeY); // required for correct matrix multiplication

    const transformX = invDet * (dirY * spriteX - dirX * spriteY);
    const transformY = invDet * (-planeY * spriteX + planeX * spriteY); //this is actually the depth inside the screen, that what Z is in 3D, the distance of sprite to player, matching sqrt(spriteDistance[i])

    const spriteScreenX = Math.trunc((SCREEN_WIDTH / 2) * (1 + transformX / transformY));

    //parameters for scaling and moving the sprites
    const uDiv = 1;
    const vDiv = 1;
    const vMove = 0.0;
    const vMoveScreen = Math.trunc(vMove / transformY) + posZ / transformY;

    //calculate height of the sprite on screen
    const spriteHeight = Math.abs(Math.trunc(SCREEN_HEIGHT / (transformY))) / vDiv; //using "transformY" instead of the real distance prevents fisheye
    //calculate lowest and highest pixel to fill in current stripe
    let drawStartY = Math.trunc(-spriteHeight / 2 + SCREEN_HEIGHT / 2 + vMoveScreen);
    if(drawStartY < 0) drawStartY = 0;
    let drawEndY = Math.trunc(spriteHeight / 2 + SCREEN_HEIGHT / 2 + vMoveScreen);
    if(drawEndY >= SCREEN_HEIGHT) drawEndY = SCREEN_HEIGHT - 1;

    //calculate width of the sprite
    const spriteWidth = Math.abs(Math.trunc (SCREEN_HEIGHT / (transformY))) / uDiv; // same as height of sprite, given that it's square
    let drawStartX = Math.trunc(-spriteWidth / 2 + spriteScreenX);
    if(drawStartX < 0) drawStartX = 0;
    let drawEndX = Math.trunc(spriteWidth / 2 + spriteScreenX);
    if (drawEndX > SCREEN_WIDTH) drawEndX = SCREEN_WIDTH;

    // drawStartY += posZ / perpWallDist;
    // drawEndY += posZ / perpWallDist;

    const textureWidth = getSpriteWidth(i);
    const textureHeight = getSpriteHeight(i);

    //loop through every vertical stripe of the sprite on screen
    for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
      let texX = Math.trunc(256 * (stripe - (-spriteWidth / 2 + spriteScreenX)) * textureWidth / spriteWidth) / 256;
      //the conditions in the if are:
      //1) it's in front of camera plane so you don't see things behind you
      //2) ZBuffer, with perpendicular distance
      // if (!zBuffer[stripe]) {
      //   console.log('_Z_BUFFER_STRIPE_', zBuffer[stripe]);
      // }
      if(transformY > 0.9 && transformY < zBuffer[stripe]) {
        // This is the individual column for a sprite
        // texNum, texX, x, drawStart, drawEnd
        spritesData[i].rayData.push({ x: stripe, texX, texNum: entities[spriteOrder[i]].texNum, drawStartY, drawEndY, textureWidth, textureHeight })

        // for (let y = drawStartY; y < drawEndY; y++) //for every pixel of the current stripe
        // {
          // let d = (y - vMoveScreen) * 256 - SCREEN_HEIGHT * 128 + spriteHeight * 128; //256 and 128 factors to avoid floats
          // let texY = ((d * TEXTURE_HEIGHT) / spriteHeight) / 256;
          // Uint32 color = texture[sprite[spriteOrder[i]].texture][texWidth * texY + texX]; //get current color from the texture
          // if((color & 0x00FFFFFF) != 0) buffer[y][stripe] = color; //paint pixel if it isn't black, black is the invisible color
        // }
        //
      }
    }
  }
  return spritesData;
}

const compareDistance = (a, b) => {
  if (a.distance < b.distance) {
    return 1;
  }
  if (a.distance > b.distance) {
    return -1;
  }
  // a must be equal to b
  return 0;
}

const rayCastWalls = (tileZ, wallMap) => {
  const rayData = []

  // length of ray from current position to next x or y-side
  let sideDistX;
  let sideDistY;

  for (let x = 0; x < SCREEN_WIDTH; x++) {
    // calculate ray position and direction
    const cameraX = 2 * x / SCREEN_WIDTH - 1; //x-coordinate in camera space
    const rayDirX = dirX + planeX * cameraX;
    const rayDirY = dirY + planeY * cameraX;
    // which box of the map we're in
    let mapX = Math.trunc(posX);
    let mapY = Math.trunc(posY);

    // length of ray from one x or y-side to next x or y-side
    // these are derived as:
    // deltaDistX = sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX))
    // deltaDistY = sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY))
    // which can be simplified to abs(|rayDir| / rayDirX) and abs(|rayDir| / rayDirY)
    // where |rayDir| is the length of the vector (rayDirX, rayDirY). Its length,
    // unlike (dirX, dirY) is not 1, however this does not matter, only the
    // ratio between deltaDistX and deltaDistY matters, due to the way the DDA
    // stepping further below works. So the values can be computed as below.
    // Division through zero is prevented, even though technically that's not
    // needed in C++ with IEEE 754 floating point values.
    const deltaDistX = (rayDirX === 0) ? 1e30 : Math.abs(1 / rayDirX);
    const deltaDistY = (rayDirY === 0) ? 1e30 : Math.abs(1 / rayDirY);

    let perpWallDist;

    // what direction to step in x or y-direction (either +1 or -1)
    let stepX;
    let stepY;

    // calculate step and initial sideDist
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (posX - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - posX) * deltaDistX;
    }
    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (posY - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - posY) * deltaDistY;
    }

    let first = true
    // This could be replaced with distance yeah?
    // let inside = true
    // while (inside) {
    let hit = 0; // was there a wall hit?
    let side; // was a NS or a EW wall hit?
    // This needs to push something into an array and keep going...
    // perform DDA
    while (hit === 0) {
      // jump to next map square, either in x-direction, or in y-direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (mapX < 0 || mapX > MAP_WIDTH -1 || mapY < 0 || mapY > MAP_HEIGHT - 1) {
        break;
      }
      // Check if ray has hit a wall
      if (wallMap[mapX][mapY] > 0) hit = 1;
    }

    if (hit === 0) {
    //   inside = false
      continue
    }

    // Calculate distance projected on camera direction. This is the shortest distance from the point where the wall is
    // hit to the camera plane. Euclidean to center camera point would give fisheye effect!
    // This can be computed as (mapX - posX + (1 - stepX) / 2) / rayDirX for side == 0, or same formula with Y
    // for size == 1, but can be simplified to the code below thanks to how sideDist and deltaDist are computed:
    // because they were left scaled to |rayDir|. sideDist is the entire length of the ray above after the multiple
    // steps, but we subtract deltaDist once because one step more into the wall was taken above.
    if (side === 0) {
      perpWallDist = (sideDistX - deltaDistX);
    } else {
      perpWallDist = (sideDistY - deltaDistY);
    }

    // Calculate height of line to draw on screen
    const lineHeight = (SCREEN_HEIGHT / perpWallDist);

    //calculate lowest and highest pixel to fill in current stripe
    let drawStart = -lineHeight / 2 + SCREEN_HEIGHT / 2;
    if (drawStart < 0) drawStart = 0;
    let drawEnd = lineHeight / 2 + SCREEN_HEIGHT / 2;
    if (drawEnd >= SCREEN_HEIGHT) drawEnd = SCREEN_HEIGHT - 1;

    const perspectiveLineHeight = Math.abs(drawEnd - drawStart)
    drawStart -= perspectiveLineHeight * tileZ
    drawEnd -= perspectiveLineHeight * tileZ

    drawStart += posZ / perpWallDist;
    drawEnd += posZ / perpWallDist;

    // drawStart += pitch
    // drawEnd += pitch

    //texturing calculations
    const texNum = wallMap[mapX][mapY] - 1; //1 subtracted from it so that texture 0 can be used!

    //calculate value of wallX
    let wallX; //where exactly the wall was hit
    if (side === 0) {
      wallX = posY + perpWallDist * rayDirY;
    } else {
      wallX = posX + perpWallDist * rayDirX;
    }
    wallX -= Math.floor((wallX));

    //x coordinate on the texture
    let texX = Math.trunc(wallX * TILE_WIDTH);
    if (side === 0 && rayDirX > 0) texX = TILE_WIDTH - texX - 1;
    if (side === 1 && rayDirY < 0) texX = TILE_WIDTH - texX - 1;

    rayData.push({
      texNum,
      texX,
      x,
      drawStart,
      drawEnd,
      mapX,
      mapY,
      side,
    })

    if (first) {
      //SET THE ZBUFFER FOR THE SPRITE CASTING
      zBuffer[x] = perpWallDist; //perpendicular distance is used
      first = false
    }
  }
  // }

  return rayData;
};

let floorImageData;

const createFloor = (floorRayData) => {
  for (let i = 0; i < floorRayData.length; i++) {
    floorImageData.data[i] = floorRayData[i];
  }
  // JUST FLOOR
  // projectionCtx.putImageData(floorImageData, 0, SCREEN_HEIGHT * 0.5);
  // FULL SCREEN
  projectionCtx.putImageData(floorImageData, 0, 0);
};

// This isn't just drawing, this is also calculating where to draw things...
// This should be split out into different functions for each of the chunks of rendering.
const drawWorld = () => {
  // projectionCtx.clearRect(0, 0, projectionCanvas.width, projectionCanvas.height);

  projectionCtx.fillStyle = roofColor;
  projectionCtx.fillRect(0, 0, projectionCanvas.width, projectionCanvas.height);

  // I don't know how to draw the floor at multiple heights?
  rayCastFloor(0);

  createFloor(floorPixels);
  // if (posZ > SCREEN_HEIGHT) {
  //   rayCastFloor(1);
  // }
  if (posZ > SCREEN_HEIGHT + SCREEN_HEIGHT * 0.5) {
    rayCastFloor(2);
  }
  // rayCastFloor(1);
  // rayCastFloor(2);
  createFloor(floorPixels);

  const rayData = rayCastWalls(0, WORLD_MAP);

  rayData.forEach(({ texNum, texX, x, drawStart, drawEnd }) => {
    projectionCtx.drawImage(wallImages[texNum], texX, 0, 1, TEXTURE_HEIGHT, x, drawStart, 1, Math.abs(drawEnd - drawStart));
  });

  const rayData2 = rayCastWalls(1, WALL_MAP2);

  rayData2.forEach(({ texNum, texX, x, drawStart, drawEnd }) => {
    projectionCtx.drawImage(wallImages[texNum], texX, 0, 1, TEXTURE_HEIGHT, x, drawStart, 1, Math.abs(drawEnd - drawStart));
  });

  rayData.forEach(({ mapX, mapY, side, x, drawStart, drawEnd }, i) => {
    // choose wall color
    let color = { r: 0, g: 0, b: 0, a: 0.5 }

    if (side === 1) {
      color = { ...color, a: 0 };
    }

    projectionCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    projectionCtx.fillRect(x, rayData2[i].drawStart, 1, Math.abs(drawEnd - rayData2[i].drawStart));
  });

  const raySpriteData = rayCastSprites();

  raySpriteData.forEach(spriteColumnsData => {
    spriteColumnsData.rayData.forEach(({ x, texX, texNum, drawStartY, drawEndY, textureWidth, textureHeight }) => {
      projectionCtx.drawImage(entityImages[texNum], texX, 0, 1, textureHeight, x, drawStartY, 1, Math.abs(drawEndY - drawStartY));
    });
  });
};
