const vrButton = document.getElementById("moa-button");
vrButton.addEventListener('click', function() {
    // Only proceed if the DeviceOrientationEvent is supported and the permission is needed/granted.
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceMotionEvent !== 'undefined') {
        let permissionsGranted = false;

        const requestOrientationPermission = () => {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        permissionsGranted = true;
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        motionAndOrientationActive = true;
                    } else {
                        alert('Permission to access device orientation was denied.');
                    }
                })
                .catch(console.error);
            } else {
                // Automatically assume permission is granted if no requestPermission method exists
                permissionsGranted = true;
                window.addEventListener('deviceorientation', handleOrientation, true);
                motionAndOrientationActive = true;
            }
        };

        const requestMotionPermission = () => {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        permissionsGranted = true;
                        window.addEventListener('devicemotion', handleMotion, true);
                        motionAndOrientationActive = true;
                    } else {
                        alert('Permission to access device motion was denied.');
                    }
                })
                .catch(console.error);
            } else {
                // Automatically assume permission is granted if no requestPermission method exists
                permissionsGranted = true;
                window.addEventListener('devicemotion', handleMotion, true);
                motionAndOrientationActive = true;
            }
        };

        // Request permissions
        requestOrientationPermission();
        requestMotionPermission();

        // Hide the button after requesting permissions
        if (permissionsGranted) {
            this.style.display = 'none';
        }
    } else {
        console.log("Device does not support DeviceOrientationEvent or DeviceMotionEvent.");
    }
});

function toggleShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal.style.display === "flex") {
        modal.style.display = "none";
        allowSphereInteraction = true; // Enable sphere interaction
    } else {
        modal.style.display = "flex";
        allowSphereInteraction = false; // Disable sphere interaction
    }
}
  
// Function to share to specific platforms
function shareToPlatform(platform) {
    const url = encodeURIComponent(window.location.href);
    let shareUrl = "";

    switch(platform) {
        case 'email':
            shareUrl = `mailto:?subject=Check this out&body=Check out this virtual tour: ${url}`;
            break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;          
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=Check out this virtual tour: ${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=Check out this virtual tour`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}`;
            break;
        // Add more cases for other platforms
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank').focus();
    }
}
  
// Function to copy the current URL to the clipboard
function copyLink() {
navigator.clipboard.writeText(window.location.href)
    .then(() => alert('Link copied to clipboard!'))
    .catch(err => console.error('Error copying link: ', err));
}

// Event listeners
document.getElementById('share-button').addEventListener('click', toggleShareModal);
document.querySelector('.close-button').addEventListener('click', toggleShareModal);

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
let lastUpdateTime = 0;
const updateThreshold = 20; // milliseconds
let lastDragTime = Date.now();
let usingDeviceOrientation = false;
let motionAndOrientationActive = false;
let allowSphereInteraction = true;

var promise = new FULLTILT.getDeviceOrientation({ 'type': 'world' });

// FULLTILT.DeviceOrientation instance placeholder
var deviceOrientation;

promise
.then(function(controller) {
    // Store the returned FULLTILT.DeviceOrientation object
    deviceOrientation = controller;
})
.catch(function(message) {
    console.error(message);

    // Optionally set up fallback controls...
    // initManualControls();
});

function dynamicSlerp(currentQuat, targetQuat, deltaTime) {
    let angle = currentQuat.angleTo(targetQuat);
    let factor = Math.min(deltaTime * angle * 0.5, 1); // Example calculation
    currentQuat.slerp(targetQuat, 0.5);
}

function handleOrientation(event) {
    // Check if device orientation should control the camera
    if (!motionAndOrientationActive) return;

    // Activate device orientation control and disable manual control
    usingDeviceOrientation = true;

    let currentTime = Date.now();
    // if (currentTime - lastUpdateTime < updateThreshold) return;

    lastUpdateTime = currentTime;

    let fulltiltEuler = deviceOrientation.getScreenAdjustedEuler();

    let alpha = THREE.Math.degToRad(fulltiltEuler.alpha);
    let beta = -Math.PI / 2 + THREE.Math.degToRad(fulltiltEuler.beta); // Adjusting beta
    let gamma = THREE.Math.degToRad(fulltiltEuler.gamma);

    //let targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(beta, alpha, gamma, 'XYZ'));
    let targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(beta, alpha, 0, 'YXZ'));

    // Smoothly interpolate the camera's current quaternion towards the target
    dynamicSlerp(camera.quaternion, targetQuaternion, 0.05); // The slerp factor can be adjusted for smoothing
}

// Function to disable manual controls when device orientation is active
function disableManualControls() {
    if (usingDeviceOrientation) {
        isDragging = false; // Disable dragging
        // Optionally, disable other manual controls here
    }
}

function onMouseDown(event) {
    if (!allowSphereInteraction || usingDeviceOrientation) return;
    isDragging = true;
    usingDeviceOrientation = false;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
}

function onTouchStart(event) {
    if (!allowSphereInteraction || usingDeviceOrientation) return;
    isDragging = true;
    usingDeviceOrientation = false;
    previousMouseX = event.touches[0].clientX;
    previousMouseY = event.touches[0].clientY;
}

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
    const sensitivity = event.touches ? 0.005 : 0.0025; //mobile : desktop (decreasing value - greater resistance)

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
        event.preventDefault();
    }
}

// Add event listener for device orientation
window.addEventListener('deviceorientation', handleOrientation, true);

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
