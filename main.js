const vrButton = document.getElementById("moa-button");
vrButton.addEventListener('click', function() {
    // Check if DeviceOrientationEvent and DeviceMotionEvent are supported
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Request permission for device orientation
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                } else {
                    alert('Permission to access device orientation was denied.');
                }
            })
            .catch(console.error);
    } else {
        // Handle devices that do not support DeviceOrientationEvent.requestPermission
        window.addEventListener('deviceorientation', handleOrientation, true);
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        // Request permission for device motion
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion, true);
                } else {
                    alert('Permission to access device motion was denied.');
                }
            })
            .catch(console.error);
    } else {
        // Handle devices that do not support DeviceMotionEvent.requestPermission
        window.addEventListener('devicemotion', handleMotion, true);
    }

    // Hide the button after requesting permissions
    this.style.display = 'none';
});

// Get fullscreen button
const fullscreenButton = document.getElementById("fullscreen-button");
fullscreenButton.addEventListener('click', toggleFullScreen);

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

// Allow user interaction to control sphere rotation
var isDragging = false;
var previousMouseX = 0;
var previousMouseY = 0;
let rotationSpeedX = 0;
let rotationSpeedY = 0;
let lastDragTime = Date.now();
let usingDeviceOrientation = false;
let baseOrientation = { x: 0, y: 90 };

// Function to handle device orientation
function handleOrientation(event) {
    if (isDragging) return;

    const gamma = event.gamma || 0; // Rotation around the y-axis (tilt left/right)
    const beta = event.beta || 0;   // Rotation around the x-axis (tilt front/back)

    // Assuming gamma and beta map directly to y and x rotations:
    // Calculate the deltas based on the base orientation
    let deltaY = (gamma / 90) * Math.PI / 2 - baseOrientation.y;
    let deltaX = (beta / 90) * Math.PI / 2 - baseOrientation.x;

    // Apply rotation
    sphere.rotation.y += deltaY;
    sphere.rotation.x += deltaX;

    // Update the base orientation for continuous movement
    baseOrientation.x += deltaX;
    baseOrientation.y += deltaY;
}

// Event listener for device orientation
window.addEventListener('deviceorientation', handleOrientation);

// When manual drag starts, capture the current orientation as the base
function onManualStart() {
    baseOrientation.x = sphere.rotation.x;
    baseOrientation.y = sphere.rotation.y;
}


function onMouseDown(event) {
    isDragging = true;
    usingDeviceOrientation = false;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
}

function onTouchStart(event) {
    isDragging = true;
    usingDeviceOrientation = false;
    previousMouseX = event.touches[0].clientX;
    previousMouseY = event.touches[0].clientY;
}

// Function to handle pointer up event
function onPointerUp() {
    isDragging = false;
    baseOrientation.x = sphere.rotation.x;
    baseOrientation.y = sphere.rotation.y;
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
