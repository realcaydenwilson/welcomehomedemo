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
let reengageDelay = 1000;
let lastDragTime = Date.now();
let usingDeviceOrientation = false;
let motionAndOrientationActive = false;
let allowSphereInteraction = true;
let baseOrientation = { x: Math.PI / 2, y: 0 };

function handleOrientation(event) {
    if (isDragging || !motionAndOrientationActive) return;

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

window.addEventListener('orientationchange', function() {
    // Reset or adjust baseOrientation based on the new orientation
    // You might need to adjust the logic here based on the specific behavior you observe
    // after an orientation change.
    baseOrientation = { x: Math.PI / 2, y: 0 };
    // You might also want to recalculate or adjust any relevant variables here
    // to ensure a smooth transition between orientations.
});

// Event listener for device orientation
window.addEventListener('deviceorientation', handleOrientation);

// When manual drag starts, capture the current orientation as the base
function onManualStart() {
    baseOrientation.x = sphere.rotation.x;
    baseOrientation.y = sphere.rotation.y;
}

function onMouseDown(event) {
    if (!allowSphereInteraction) return;
    isDragging = true;
    usingDeviceOrientation = false;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
}

function onTouchStart(event) {
    if (!allowSphereInteraction) return;
    isDragging = true;
    usingDeviceOrientation = false;
    previousMouseX = event.touches[0].clientX;
    previousMouseY = event.touches[0].clientY;
}

function onPointerUp() {
    isDragging = false;
    // Update base orientation immediately after drag ends to capture the new neutral.
    baseOrientation.x = sphere.rotation.x;
    baseOrientation.y = sphere.rotation.y;
    
    setTimeout(() => {
        if (motionAndOrientationActive) { 
            // Only re-enable device orientation handling after the delay,
            // ensuring any immediate adjustments post-drag are manual.
            usingDeviceOrientation = true;
        }
    }, reengageDelay);
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
