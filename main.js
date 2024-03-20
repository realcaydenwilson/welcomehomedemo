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
const dampingFactor = 1; 
let reengageDelay = 1000;
let lastDragTime = Date.now();
let usingDeviceOrientation = false;
let motionAndOrientationActive = false;
let allowSphereInteraction = true;
let baseOrientation = { x: 0, y: 0 };

texture.matrixAutoUpdate = false;
screen.orientation.addEventListener('change', function() {
    // You can access screen.orientation.type and screen.orientation.angle here
    const orientationType = screen.orientation.type; // e.g., "landscape-primary"
    handleOrientationChange(orientationType);
});

function handleOrientationChange(orientationType) {
    // Reset or adjust baseOrientation and other relevant variables here
    // based on the new orientation type.
    // This might include logic to adjust how you interpret beta and gamma values.
    console.log(`Orientation changed to ${orientationType}`);
    // Example adjustment
    baseOrientation = { x: 0, y: 0 }; // Adjust based on actual needs
}
/*
window.addEventListener('deviceorientation', function(event) {
    // Check if event data is available
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        usingMotionAndOrientation = true;

        // Apply the 90-degree rotation when motion and orientation data are first used
        // This condition prevents the rotation from being applied repeatedly
        if (sphere.rotation.x !== Math.PI / 2) {
            sphere.rotation.x = Math.PI / 2;
        }
    }
});
*/
function handleOrientation(event) {
    if (!motionAndOrientationActive || isDragging) return;

    if (motionAndOrientationActive) {
        // Apply a 90-degree rotation to the texture
        // Assuming 'texture' is the texture applied to your sphere
        texture.matrix.identity();
        texture.matrix.translate(-0.5, -0.5); // Move texture to center
        texture.matrix.rotate(Math.PI / 2); // Rotate 90 degrees
        texture.matrix.translate(0.5, 0.5); // Move texture back to original position
        texture.needsUpdate = true; // Flag the texture to be updated
    }
    const alpha = event.alpha ? THREE.Math.degToRad(event.alpha) : 0; // Z-axis rotation (in radians)
    let beta = event.beta ? THREE.Math.degToRad(event.beta) : 0; // X-axis rotation (in radians)
    let gamma = event.gamma ? THREE.Math.degToRad(event.gamma) : 0; // Y-axis rotation (in radians)

    // Adjust orientation data based on the screen orientation
    switch(screen.orientation.type) {
        case 'portrait-primary':
            // No additional rotation needed
            break;
        case 'landscape-primary':
            // Adjust for landscape orientation
            [beta, gamma] = [gamma, -beta];
            break;
        case 'landscape-secondary':
            // Adjust for reverse landscape orientation
            [beta, gamma] = [-gamma, beta];
            break;
        case 'portrait-secondary':
            // Adjust for upside-down portrait orientation
            beta = -beta;
            gamma = -gamma;
            break;
    }

    // Apply the orientation data directly to the sphere's rotation, 
    // assuming the device's beta and gamma map to the sphere's x and y rotations.
    sphere.rotation.x = beta * dampingFactor + baseOrientation.x;
    sphere.rotation.y = gamma * dampingFactor + baseOrientation.y;
}

// Event listener for device orientation
window.addEventListener('deviceorientation', handleOrientation);

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

    // Introduce a delay before re-enabling device orientation control
    // to ensure a smooth transition from manual to automatic control
    setTimeout(() => {
        if (motionAndOrientationActive) {
            usingDeviceOrientation = true; // Re-enable device orientation control
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
