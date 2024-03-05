// Enhanced check for webkit and other browsers' fullscreen support
const isFullscreenSupported = 'requestFullscreen' in document.documentElement || 
                              'webkitRequestFullscreen' in document.documentElement || 
                              'mozRequestFullScreen' in document.documentElement || 
                              'msRequestFullscreen' in document.documentElement;

console.log(isFullscreenSupported ? 'Fullscreen is supported.' : 'Fullscreen is not supported.');

// Check for motion and orientation event support without webkit prefix
const isMotionOrientationSupported = 'DeviceOrientationEvent' in window || 
                                     'DeviceMotionEvent' in window;

console.log(isMotionOrientationSupported ? 'Motion and orientation data is supported.' : 'Motion and orientation data is not supported.');

// Set up scene
var scene = new THREE.Scene();

// Create a sphere
const sphereGeometry = new THREE.SphereGeometry(500, 64, 32);
sphereGeometry.scale(-1, 1, 1); // invert the geometry inside out
const textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load('./panoramas/Panorama.jpg');
//texture.encoding = THREE.sRGBEncoding;
var material = new THREE.MeshBasicMaterial({
  map: texture,
})
var sphere = new THREE.Mesh(sphereGeometry, material);
scene.add(sphere);

// Set up camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
//camera.target = new THREE.Vector3(0, 0, 0);
camera.position.set(0, 0, 0);
scene.add(camera);

// Set up renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Handle window resizing
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Allow user interaction to control sphere rotation
var isDragging = false;
var previousMouseX = 0;
var previousMouseY = 0;
let rotationSpeedX = 0;
let rotationSpeedY = 0;
let lastDragTime = Date.now();

// Function to handle device orientation
function handleOrientation(event) {
  if (!isDragging) return;

  const now = Date.now();
  const deltaTime = now - lastDragTime;
  const gamma = event.gamma || 0; // Rotation around the y-axis (tilt left/right)
  const beta = event.beta || 0;   // Rotation around the x-axis (tilt front/back)

  rotationSpeedY = gamma / 90 * 0.01; // Normalize and adjust rotation speed
  rotationSpeedX = beta / 90 * 0.01;

  sphere.rotation.y += gamma * 0.0015;
  sphere.rotation.x += beta * 0.0015;

  lastDragTime = now;
}

// Event listener for device orientation
window.addEventListener('deviceorientation', handleOrientation);

var isDragging = false;
var previousMouseX = 0;
var previousMouseY = 0;

// Function to handle mouse down event
function onMouseDown(event) {
    isDragging = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
    lastDragTime = Date.now();
}

// Function to handle touch start event
function onTouchStart(event) {
    isDragging = true;
    previousMouseX = event.touches[0].clientX;
    previousMouseY = event.touches[0].clientY;
    lastDragTime = Date.now();
}

// Function to handle pointer up event
function onPointerUp() {
    isDragging = false;
}

// Function to handle pointer move event
function onPointerMove(event) {
    if (!isDragging) return;

    const now = Date.now();
    const deltaTime = now - lastDragTime;
    const clientX = event.clientX || event.touches[0].clientX;
    const clientY = event.clientY || event.touches[0].clientY;
    const deltaX = clientX - previousMouseX;
    const deltaY = clientY - previousMouseY;

    // Adjust sensitivity for touch devices
    const sensitivity = event.touches ? 0.005 : 0.015;

    // Calculate rotation speed based on movement and time
    rotationSpeedY = deltaX / deltaTime * sensitivity;
    rotationSpeedX = deltaY / deltaTime * sensitivity;

    // Apply rotation while dragging
    sphere.rotation.y += deltaX * 0.0015;
    sphere.rotation.x += deltaY * 0.0015;

    // Update last positions and time
    previousMouseX = clientX;
    previousMouseY = clientY;
    lastDragTime = now;

    if (event.touches) {
        event.preventDefault(); // Prevent default touchmove behavior (scrolling)
    }
}

// Add event listeners for mouse interaction
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onPointerUp);
document.addEventListener('mousemove', onPointerMove);

// Add event listeners for touch interaction
document.addEventListener('touchstart', onTouchStart);
document.addEventListener('touchend', onPointerUp);
document.addEventListener('touchmove', onPointerMove);

function toggleFullScreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, Opera
          document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) { // Firefox
          document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
          document.documentElement.msRequestFullscreen();
      }
  } else {
      if (document.exitFullscreen) {
          document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
          document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
          document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) { // IE/Edge
          document.msExitFullscreen();
      }
  }
}

// Get fullscreen button
const fullscreenButton = document.getElementById("fullscreen-button");
fullscreenButton.addEventListener('click', toggleFullScreen);
document.body.appendChild(fullscreenButton);

function animate() {
  requestAnimationFrame(animate);
  
  if (!isDragging) {
    // Apply inertia
    sphere.rotation.y += rotationSpeedY;
    sphere.rotation.x += rotationSpeedX;

    // Slow down rotation
    rotationSpeedY *= 0.95;
    rotationSpeedX *= 0.95;
  }

  renderer.render(scene, camera);
}

animate();
