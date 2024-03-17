
import { Scene } from 'three/src/scenes/Scene.js';
import { SphereGeometry } from 'three/src/geometries/SphereGeometry.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial.js';
import { Mesh } from 'three/src/objects/Mesh.js';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
// import { ACESFilmicToneMapping } from 'three/src/constants.js';

function setupDeviceOrientationListeners() {
  // Function to add the deviceorientation event listener
  const addOrientationListener = () => {
    window.addEventListener('deviceorientation', handleOrientation, true);
  };

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    // Request permission for iOS 13+ devices
    DeviceOrientationEvent.requestPermission().then(permissionState => {
      if (permissionState === 'granted') {
        addOrientationListener();
      } else {
        console.error('DeviceOrientation permission not granted.');
      }
    }).catch(console.error);
  } else {
    // Automatically listen if permission request is not necessary
    addOrientationListener();
  }
}

// Set up renderer
var renderer = new WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = ACESFilmicToneMapping;
// renderer.toneMappingExposure = 0.5; // Decrease to make the scene darker

// Set up scene
var scene = new Scene();

// Create a sphere
const sphereGeometry = new SphereGeometry(500, 64, 32);
sphereGeometry.scale(-1, 1, 1); // invert the geometry inside out

const textureLoader = new TextureLoader();
let texture;
let material;
let sphere;

texture = textureLoader.load('/assets/panoramas/mainHub.jpg');
// texture.minFilter = LinearFilter;
// texture.magFilter = LinearFilter;
// texture.generateMipmaps = true;
// texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
material = new MeshBasicMaterial({ map: texture })
sphere = new Mesh(sphereGeometry, material);
scene.add(sphere);

document.body.appendChild(renderer.domElement);

// Set up camera
var camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
//camera.target = new Vector3(0, 0, 0);
camera.position.set(0, 0, 0);
scene.add(camera);

// Handle window resizing
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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

// Get vr button
const vrButton = document.getElementById("vr-button");
fullscreenButton.addEventListener('click', toggleFullScreen);
document.body.appendChild(vrButton);

// Allow user interaction to control sphere rotation
var isDragging = false;
var previousMouseX = 0;
var previousMouseY = 0;
let rotationSpeedX = 0;
let rotationSpeedY = 0;
let lastDragTime = Date.now();

// Function to handle device orientation
function handleOrientation(event) {
  if (isDragging) {
    usingDeviceOrientation = false;
    return; // Skip updating from orientation if dragging
  }

  // Mark that we're using device orientation data
  usingDeviceOrientation = true;

  const gamma = event.gamma || 0; // Rotation around the y-axis (tilt left/right)
  const beta = event.beta || 0;   // Rotation around the x-axis (tilt front/back)

  // Normalize and adjust rotation speed
  rotationSpeedY = gamma / 90 * 0.001;
  rotationSpeedX = beta / 90 * 0.001;

  // Directly apply rotation based on orientation
  sphere.rotation.y += rotationSpeedY;
  sphere.rotation.x += rotationSpeedX;
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
  usingDeviceOrientation = false;
}

// Function to handle touch start event
function onTouchStart(event) {
  isDragging = true;
  previousMouseX = event.touches[0].clientX;
  previousMouseY = event.touches[0].clientY;
  usingDeviceOrientation = false;
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
  const sensitivity = event.touches ? 0.004 : 0.006; //mobile : desktop (decreasing value - greater resistance)

  // Calculate rotation speed based on movement and time
  rotationSpeedY = deltaX / deltaTime * sensitivity;
  rotationSpeedX = deltaY / deltaTime * sensitivity;

  // Apply rotation while dragging
  sphere.rotation.y += deltaX * 0.001;
  sphere.rotation.x += deltaY * 0.001;

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

if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  // Request permission for iOS 13+ devices
  DeviceOrientationEvent.requestPermission().then(permissionState => {
    if (permissionState === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }).catch(console.error);
} else {
  // For non-iOS 13 devices, just add the event listener
  window.addEventListener('deviceorientation', handleOrientation);
}

setupDeviceOrientationListeners();

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
