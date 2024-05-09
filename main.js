const moaButton = document.getElementById("moa-button");
const vrButton = document.getElementById("vr-button");

// Function to check if the device is a PC or laptop
function isPCorLaptop() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /windows nt|macintosh/.test(userAgent) && !/iphone|ipad|android/.test(userAgent);
}

// Check if the browser supports the Permissions API and if it's not a PC or laptop
if (typeof navigator.permissions === 'undefined' || isPCorLaptop()) {
    // Hide the buttons if the Permissions API is not supported or if the device is a PC or laptop
    moaButton.style.display = 'none';
    vrButton.style.display = 'none';
} else {
    // Add event listener to the motion and orientation button
    moaButton.addEventListener('click', function() {
        // Function to request motion and orientation permissions
        const requestMotionAndOrientationPermissions = () => {
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

            // Hide the motion and orientation button after requesting permissions
            if (permissionsGranted) {
                moaButton.style.display = 'none';
            }
        };

        // Request motion and orientation permissions
        requestMotionAndOrientationPermissions();
    });

    // Check if the browser supports the WebXR API
    if (navigator.xr && typeof navigator.xr.isSessionSupported === 'function') {
        // Add event listener to the VR button
        vrButton.addEventListener('click', function() {
            // Check if motion and orientation data permissions are granted and enabled
            if (!motionAndOrientationActive) {
                // If not, request motion and orientation permissions
                requestMotionAndOrientationPermissions();
                return; // Exit function to avoid proceeding further
            }

            // Function to check and request landscape mode
            const requestLandscapeMode = () => {
                if (screen.orientation && typeof screen.orientation.lock === 'function') {
                    // Check if the device is already in landscape mode
                    if (screen.orientation.type.startsWith('landscape')) {
                        // Proceed to load VR environment
                        loadVREnvironment();
                    } else {
                        // Request landscape mode
                        screen.orientation.lock('landscape')
                        .then(() => {
                            // Once the device is in landscape mode, load VR environment
                            loadVREnvironment();
                        })
                        .catch(error => {
                            console.error('Failed to lock screen orientation:', error);
                        });
                    }
                } else {
                    // Screen orientation API not supported, cannot request landscape mode
                    alert('Screen orientation lock is not supported on this device.');
                }
            };

            // Function to load VR environment
            function loadVREnvironment() {
                // Check if WebXR is supported
                navigator.xr.isSessionSupported('immersive-vr')
                .then(supported => {
                    if (supported) {
                        // Request a WebXR session
                        navigator.xr.requestSession('immersive-vr')
                        .then(session => {
                            // Set up the XR environment
                            const xrReferenceSpaceType = 'local'; // Or 'local-floor' depending on your preference
                            session.requestReferenceSpace(xrReferenceSpaceType)
                            .then(referenceSpace => {
                                // Create the XRLayer for rendering
                                const xrLayer = new XRWebGLLayer(session, renderer);
            
                                // Create the XR Space for rendering
                                const xrSpace = new XRRigidTransform();
            
                                // Set up the XR Session
                                session.updateRenderState({ baseLayer: xrLayer });
            
                                // Enter the XR Session
                                session.requestAnimationFrame((time, frame) => {
                                    // Render the scene in VR mode
                                    renderer.xr.enabled = true;
                                    renderer.setAnimationLoop(() => {
                                        renderer.render(scene, camera);
                                    });
                                });
            
                                // Handle session end
                                session.addEventListener('end', () => {
                                    // Reset XR-related settings
                                    renderer.xr.enabled = false;
                                    renderer.setAnimationLoop(null);
                                });
            
                                // Handle session errors
                                session.addEventListener('error', (event) => {
                                    console.error('XR Session Error:', event);
                                });
                            })
                            .catch(error => {
                                console.error('Failed to create XR reference space:', error);
                            });
                        })
                        .catch(error => {
                            console.error('Failed to request XR session:', error);
                        });
                    } else {
                        alert('WebXR is not supported in this browser.');
                    }
                })
                .catch(error => {
                    console.error('Error checking WebXR support:', error);
                });
            }

            // Check if the WebXR API is supported
            navigator.xr.isSessionSupported('immersive-vr')
            .then(supported => {
                if (supported) {
                    // Check and request landscape mode
                    requestLandscapeMode();
                } else {
                    alert('WebXR API is not supported in this browser.');
                }
            })
            .catch(error => {
                console.error('Error checking WebXR support:', error);
            });
        });
    } else {
        // WebXR API not supported, hide the VR button
        vrButton.style.display = 'none';
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

// Toggle share modal and adjust scene container width
document.getElementById('share-button').addEventListener('click', function() {
    toggleShareModal();
});

function toggleShareModal() {
    const modal = document.getElementById('share-modal');
    const sceneContainer = document.getElementById('scene-container');

    // Toggle the 'show' class to either show or hide the modal
    modal.classList.toggle('show');

    // Toggle the 'narrow' class on sceneContainer based on modal visibility
    if (modal.classList.contains('show')) {
        sceneContainer.classList.add('narrow'); // Apply narrow class
        document.body.classList.add('modal-active'); // Indicate that the modal is active
    } else {
        sceneContainer.classList.remove('narrow'); // Remove narrow class
        document.body.classList.remove('modal-active'); // Indicate that the modal is no longer active
    }

    // Update renderer size after container resize
    updateRenderer(sceneContainer);
}

function updateRenderer(container) {
    if (renderer && camera) {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    } else {
        console.error('Renderer or camera not defined');
    }
}

// Get fullscreen button
const fullscreenButton = document.getElementById("fullscreen-button");

// Check if the browser supports the Permissions API for fullscreen
if (typeof document.documentElement.requestFullscreen === 'undefined' &&
    typeof document.documentElement.webkitRequestFullscreen === 'undefined' &&
    typeof document.documentElement.mozRequestFullScreen === 'undefined' &&
    typeof document.documentElement.msRequestFullscreen === 'undefined') {
    // Hide the fullscreen button if fullscreen permissions are not supported
    fullscreenButton.style.display = 'none';
}

fullscreenButton.addEventListener('click', toggleFullScreen);

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

// Set up scene
var scene = new THREE.Scene();

// Create a sphere
const sphereGeometry = new THREE.SphereGeometry(100, 256, 128);
sphereGeometry.scale(-1, 1, 1); // invert the geometry inside out
const textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load('./panoramas/ThomasPano.webp');

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
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Allow user interaction to control sphere rotation
var isDragging = false;
var previousMouseX = 0;
var previousMouseY = 0;
let rotationSpeedX = 0;
let rotationSpeedY = 0;
let lastUpdateTime = 0;
const updateThreshold = 100; // milliseconds
let lastDragTime = Date.now();
let usingDeviceOrientation = false;
let motionAndOrientationActive = false;
let allowSphereInteraction = true;

function dynamicSlerp(currentQuat, targetQuat, deltaTime) {
    let angle = currentQuat.angleTo(targetQuat);
    let factor = Math.min(deltaTime * angle * 0.5, 1); // Example calculation
    currentQuat.slerp(targetQuat, factor);
}

function handleOrientation(event) {
    // Check if device orientation should control the camera
    if (!motionAndOrientationActive) return;

    // Activate device orientation control and disable manual control
    usingDeviceOrientation = true;

    let currentTime = Date.now();
    // if (currentTime - lastUpdateTime < updateThreshold) return;

    lastUpdateTime = currentTime;

    let alpha = THREE.Math.degToRad(event.alpha);
    let beta = -Math.PI / 2 + THREE.Math.degToRad(event.beta); // Adjusting beta
    let gamma = THREE.Math.degToRad(event.gamma);

    //let targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(beta, alpha, gamma, 'XYZ'));
    let targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(beta, alpha, 0, 'YXZ'));//

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
