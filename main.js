const moaButton = document.getElementById("moa-button");
const vrButton = document.getElementById("vr-button");
const collapseButton = document.getElementById("collapse-button");
const fullscreenButton = document.getElementById("fullscreen-button");
const menuButton = document.getElementById("menu-button");
const sharingButton = document.getElementById("sharing-button");

var isExpanded = true;
var tourIsActive = true;

// Function to check if the device is a PC or laptop
function isPCorLaptop() {
    const userAgent = navigator.userAgent.toLowerCase();
    return /windows nt|macintosh/.test(userAgent) && !/iphone|ipad|android/.test(userAgent);
}

document.addEventListener('DOMContentLoaded', function() {
    let currentDesignStyle = 1;
    const designOptionsTrigger = document.getElementById('design-options-trigger');
    const designOptionsDropdown = document.getElementById('design-options-dropdown');
    const floorplanOptionsTrigger = document.getElementById('floorplan-options-trigger');
    const floorplanOptionsDropdown = document.getElementById('floorplan-options-dropdown');
    const dropdownContainers = document.getElementsByClassName('design-options-container');

    const allDropdowns = [designOptionsDropdown, floorplanOptionsDropdown];
    const allTriggers = [designOptionsTrigger, floorplanOptionsTrigger];

    allTriggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        const currentDropdown = this === designOptionsTrigger ? designOptionsDropdown : floorplanOptionsDropdown;
        closeOtherDropdowns(currentDropdown);
        toggleDropdown(currentDropdown, this, null);
      });
    });

    function closeOtherDropdowns(currentDropdown) {
        allDropdowns.forEach(function (dropdown, i) {
          if (dropdown !== currentDropdown && dropdown.style.display === 'block') {
            dropdown.style.opacity = '0';
            setTimeout(() => {
              dropdown.style.display = 'none';
            }, 500);
            allTriggers[i].classList.toggle('rotate-icon');
          }
          else if (tourIsActive) {
            if (document.getElementById('design-options-trigger').classList.toggle('rotate-icon'))
            {
                document.getElementById('design-options-trigger').classList.toggle('rotate-icon');
            }
            designOptionsDropdown.style.opacity = '0';
            setTimeout(() => {
                designOptionsDropdown.style.display = 'none';
            }, 500);
          }
        });
      }
    
      function toggleDropdown(dropdown, trigger, guide) {
        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
          dropdown.style.display = 'block';
          setTimeout(() => {
            dropdown.style.opacity = '1';
            allDropdowns.forEach(function (drop, i) {
              if (drop != dropdown && drop != allDropdowns.at(0)) {
                  dropdownContainers[i].style.transform = `translateY(${dropdown.offsetHeight}px)`;
              } 
            });
            if (tourIsActive) guide.next();
          }, 10);
        } else {
          dropdown.style.opacity = '0';
          setTimeout(() => {
            dropdown.style.display = 'none';
          }, 500);
        }
        allDropdowns.forEach(function (drop, i) {
          dropdownContainers[i].style.transform = `translateY(0px)`;
        });
        trigger.classList.toggle('rotate-icon');
      }

    // User position and matrix setup
    class UserPosition {
        constructor(matrix) {
            this.matrix = matrix;
            this.row = 0;
            this.col = 0;
            this.newRow = this.row;
            this.newCol = this.col;
            this.currentTexture = null;
            this.textureLoadSuccess = false;
            console.log('UserPosition initialized at row 0, col 0');
        }

        normalizeRotation(rotationY) {
            return ((rotationY % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI); // Normalize to range [0, 2π]
        }

        determineDirection(rotationY, clickCount) {
            const normalizedY = this.normalizeRotation(rotationY);
            const angleDeg = (normalizedY * 180 / Math.PI); // Convert radians to degrees
            console.log(`Normalized Rotation Y: ${normalizedY} radians, ${angleDeg} degrees`);
            let direction = null;

            if (angleDeg >= 22.5 && angleDeg < 67.5) {
                direction = 'northeast';
            } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
                direction = 'east';
            } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
                direction = 'southeast';
            } else if (angleDeg >= 157.5 && angleDeg < 202.5) {
                direction = 'south';
            } else if (angleDeg >= 202.5 && angleDeg < 247.5) {
                direction = 'southwest';
            } else if (angleDeg >= 247.5 && angleDeg < 292.5) {
                direction = 'west';
            } else if (angleDeg >= 292.5 && angleDeg < 337.5) {
                direction = 'northwest';
            } else {
                direction = 'north';
            }

            console.log(`Determined direction: ${direction}`);
            this.move(direction, clickCount);
        }

        move(direction, clickCount) {
            const dirMap = {
                'east': [0, 1],
                'west': [0, -1],
                'north': [-1, 0],
                'south': [1, 0],
                'northeast': [-1, 1],
                'northwest': [-1, -1],
                'southeast': [1, 1],
                'southwest': [1, -1]
            };
            const [dRow, dCol] = dirMap[direction];
            console.log(`MOVE ${dirMap[direction]}`);
            console.log(clickCount);
            let moveCount = clickCount - 1;
            console.log(moveCount);

            let newRow = this.row;
            let newCol = this.col;

            for (let i = 0; i < moveCount; i++) {
                const tempRow = newRow + dRow;
                const tempCol = newCol + dCol;
                if (tempRow >= 0 && tempRow < this.matrix.length && tempCol >= 0 && tempCol < this.matrix[0].length) {
                    newRow = tempRow;
                    newCol = tempCol;
                } else {
                    console.log(`Move blocked at step ${i + 1}: target position out of bounds.`);
                    break;
                }
            }

            console.log(`Attempting to move from [${this.row}, ${this.col}] to [${newRow}, ${newCol}]`);
            if (this.row !== newRow || this.col !== newCol) {
                this.updateSphereTexture(newRow, newCol, null);
                // Wait for the texture to load
                setTimeout(() => {
                    if (this.textureLoadSuccess) {
                        this.row = newRow;
                        this.col = newCol;
                        console.log(`Move successful to [${newRow}, ${newCol}]`);
                        console.log(this.row);
                        console.log(this.col);
                    } else {
                        console.log(`Move failed: texture update unsuccessful.`);
                    }
                }, 500); // Adjust timeout as needed to ensure texture load status is updated
            } else {
                console.log(`Move failed: texture update unnecessary.`);
            }
        }

        updateSphereTexture(newRow, newCol, guide) {
            let imageUrl = this.matrix[newRow][newCol];
            if (Array.isArray(imageUrl)) {
                // Select the appropriate style
                imageUrl = imageUrl[currentDesignStyle - 1];
            }
            console.log(`Attempting to load texture from ${imageUrl}`);
            this.textureLoadSuccess = false;

            textureLoader.load(imageUrl, texture => {
                // Dispose of the old texture
                if (sphere.material.map) {
                    sphere.material.map.dispose();
                }
                // Dispose of the current texture if it's different from the new one
                if (this.currentTexture && this.currentTexture !== sphere.material.map) {
                    this.currentTexture.dispose();
                }

                sphere.material.map = texture;
                sphere.material.needsUpdate = true;
                this.currentTexture = texture; // Store reference to the current texture

                console.log(`Texture successfully updated to ${imageUrl}`);
                this.textureLoadSuccess = true;
            }, undefined, err => {
                console.error(`Error loading texture from ${imageUrl}:`, err);
            });

            if (tourIsActive && guide != null) guide.next();
        }
    }

    // Example matrix with URLs
    const panoramaMatrix = [
        [['panoramas/1_3.webp','panoramas/2_3.webp'], ['panoramas/1_2.webp','panoramas/2_2.webp'], ['panoramas/1_1.webp','panoramas/2_1.webp']],
        [['panoramas/1_6.webp','panoramas/2_6.webp'], ['panoramas/1_5.webp','panoramas/2_5.webp'], 0],
    ];

    /*
    [0, 0]: ['panoramas/1_6.jpg', 'panoramas/2_6.jpg']
    [0, 1]: 'panoramas/1_5.jpg'
    [0, 2]: 0
    [1, 0]: 'panoramas/1_3.jpg'
    [1, 1]: 'panoramas/1_2.jpg'
    [1, 2]: 'panoramas/1_1.jpg'
    */

    const userPosition = new UserPosition(panoramaMatrix);
    userPosition.updateSphereTexture(0, 0, null); // Initial texture update

    // Handle multiple clicks to move based on sphere rotation
    let clickCount = 0;
    let clickTimeout;

    window.addEventListener('mousedown', event => {
        clickCount++;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            if (clickCount > 1) {
                userPosition.determineDirection(sphere.rotation.y, clickCount);
            }
            clickCount = 0;
        }, 300); // Adjust timeout as needed
    });

    // Buttons to change design styles
    document.getElementById('style1-button').addEventListener('click', () => {
        currentDesignStyle = 1;
        userPosition.updateSphereTexture(userPosition.row, userPosition.col, null);
    });

    document.getElementById('style2-button').addEventListener('click', () => {
        currentDesignStyle = 2;
        userPosition.updateSphereTexture(userPosition.row, userPosition.col, null);
    });

    const steps = [
        {
            "selector": '#main-content',
            "step": 1,
            "title": "Welcome!",
            "content": "Welcome to the Welcome Home platform! This tour will guide<br/>you through some of the basic functions of the platform. Click the arrow to get started!",
        },
        {
            "selector": '#main-content',
            "step": 2,
            "title": "Movement",
            "content": "To move around, double click anywhere. To look around,<br/>click and drag the screen.",
        },
        {
            "selector": '#menu-button',
            "step": 3,
            "title": "Menu",
            "content": "The menu is used to control various parts of the platform<br/>as well. Click the menu icon to open the menu.",
        },
        {
            "selector": '#design-options-container',
            "step": 4,
            "title": "Design Center",
            "content": "The Design Center allows you to view different designs.",
        },
        {
            "selector": '#design-options-trigger',
            "step": 5,
            "title": "Design Center",
            "content": "Click the icon below to open the Design Center.",
        },
        {
            "selector": '#style2-button',
            "step": 6,
            "title": "Design Center",
            "content": "Click the option below to change the current design.",
        },
        {
            "selector": '#floorplan-options-container',
            "step": 7,
            "title": "Floor Plans",
            "content": "Floor Plans allow you to view different floor plans.",
        },
        {
            "selector": '#floorplan-options-trigger',
            "step": 8,
            "title": "Floor Plans",
            "content": "Click the icon below to open Floor Plans.",
        },
        {
            "selector": '#plan2-button',
            "step": 9,
            "title": "Floor Plans",
            "content": "Click the option below to change the current floor plan and<br/>complete the tour!",
        },
    ];
    
    var tourguide = new Tourguide({
        steps: steps,
        onStep: function(currentstep, type) {
            if (currentstep.index == 3) {
                currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                currentstep.highlight.nodes[0].addEventListener('click', function() {
                    toggleShareModal(tourguide);
                    currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                });
            }
            else if (currentstep.index == 5) {
                currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                currentstep.highlight.nodes[0].addEventListener('click', function() {
                    toggleDropdown(designOptionsDropdown, designOptionsTrigger, tourguide);
                    currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                });
            }
            else if (currentstep.index == 6) {
                currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                currentstep.highlight.nodes[0].addEventListener('click', function() {
                    currentDesignStyle = 2;
                    userPosition.updateSphereTexture(userPosition.row, userPosition.col, tourguide);
                    currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                });
            }
            else if (currentstep.index == 8) {
                currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                closeOtherDropdowns(designOptionsDropdown);
                currentstep.highlight.nodes[0].addEventListener('click', function() {
                    toggleDropdown(floorplanOptionsDropdown, floorplanOptionsTrigger, tourguide);
                    currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                });
            }
            else if (currentstep.index == 9) {
                currentstep.container.nodes[0].childNodes[1].children[0].childNodes[2].children[1].classList.toggle('display-as-none');
                currentstep.highlight.nodes[0].addEventListener('click', function() {
                    tourguide.stop();
                });
            }
        },
        onComplete: function() {
            tourIsActive = false;
        },
        onStop: function(options) {
            tourIsActive = false;
        }
    });

    function startTour() {
        tourguide.start();
    }
    
    function setLocalStorage(key, val) {
        window.localStorage.setItem(key, val)
    }
      
    function hasLocalStorage(key) {
        let val = window.localStorage.getItem(key);
        if (val) return true;
        return false;
    }
    
    if (!hasLocalStorage('hasCompletedTour') && isPCorLaptop) {
        setLocalStorage('hasCompletedTour', true);
        startTour();
    }

});

// Hide the buttons if the device is a PC or laptop before the DOM is fully loaded
if (isPCorLaptop()) {
    moaButton.style.display = 'none';
    vrButton.style.display = 'none';
}

function nativeSharing() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out this virtual home tour provided by Welcome Home:',
            url: window.location.href
        })
        .then(() => console.log('Successfully shared'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
        console.log('Web Share API is not supported in this browser.');
    }
}

sharingButton.addEventListener('click', nativeSharing);

// Function to request motion and orientation permissions
function requestMotionAndOrientationPermissions() {
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
}

function hideAllButtons() {
    moaButton.style.fontSize = '0px';
    moaButton.style.opacity = '0';
    moaButton.style.visibility = 'hidden';
    vrButton.style.fontSize = '0px';
    vrButton.style.opacity = '0';
    vrButton.style.visibility = 'hidden';
    fullscreenButton.style.fontSize = '0px';
    fullscreenButton.style.opacity = '0';
    fullscreenButton.style.visibility = 'hidden';
    menuButton.style.fontSize = '0px';
    menuButton.style.opacity = '0';
    menuButton.style.visibility = 'hidden';
    sharingButton.style.fontSize = '0px';
    sharingButton.style.opacity = '0';
    sharingButton.style.visibility = 'hidden';
}

function showButtons() {
    if (!isPCorLaptop()) {
        moaButton.style.fontSize = '1.25em';
        moaButton.style.opacity = '1';
        moaButton.style.visibility = 'visible';
        vrButton.style.fontSize = '1.25em';
        vrButton.style.opacity = '1';
        vrButton.style.visibility = 'visible';
    } 
    fullscreenButton.style.fontSize = '1.25em';
    fullscreenButton.style.opacity = '1';
    fullscreenButton.style.visibility = 'visible';
    menuButton.style.fontSize = '1.25em';
    menuButton.style.opacity = '1';
    menuButton.style.visibility = 'visible';
    sharingButton.style.fontSize = '1.25em';
    sharingButton.style.opacity = '1';
    sharingButton.style.visibility = 'visible';
}

collapseButton.addEventListener('click', function() {
    if (isExpanded) {
        hideAllButtons();
        collapseButton.style.marginTop = '0px';
        collapseButton.style.transform = 'rotate(180deg)';
    }
    else {
        showButtons();
        collapseButton.style.marginTop = '9px';
        collapseButton.style.transform = 'rotate(0deg)';
    }
    isExpanded = !isExpanded;
});

// Add event listener to the motion and orientation button
moaButton.addEventListener('click', function() {
    // Check if the device is a PC or laptop
    if (isPCorLaptop()) {
        alert('Motion and orientation features are not supported on PC or laptop devices.');
        return;
    }

    // Request motion and orientation permissions
    requestMotionAndOrientationPermissions();
});

// Add event listener to the VR button
vrButton.addEventListener('click', function() {
    // Check if motion and orientation data permissions are granted and enabled
    if (!motionAndOrientationActive) {
        // If not, request motion and orientation permissions
        requestMotionAndOrientationPermissions();
        return; // Exit function to avoid proceeding further
    }

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
});

function toggleShareModal(guide) {
    const modal = document.getElementById('share-modal');
    const mainContent = document.getElementById('main-content');
    // const allCanvasses = document.getElementsByTagName('canvas');
    // const canvas = allCanvasses[1];
    const canvas = document.getElementsByTagName('canvas');

    // Toggle the 'show' class to either show or hide the modal
    modal.classList.toggle('show');

    // Toggle the width of mainContent based on modal visibility
    if (modal.classList.contains('show')) {
        const modalWidth = modal.offsetWidth; // Get the width of the modal
        mainContent.style.width = `${window.innerWidth - modalWidth}px`; // Set the width of mainContent
        document.body.classList.add('modal-active'); // Indicate that the modal is active
        if (tourIsActive) guide.next();
    } else {
        mainContent.style.width = '100vw'; // Reset the width of mainContent
        document.body.classList.remove('modal-active'); // Indicate that the modal is no longer active
        canvas.forEach((c, index) => {
            if (index == 0) {
                c.width = `${window.innerWidth} !important`;
                c.style.width = `${window.innerWidth} !important`;
            }
        });
    }

    // Update renderer size after container resize
    updateRenderer();
}

// Check if the browser supports the Permissions API for fullscreen
if (typeof document.documentElement.requestFullscreen === 'undefined' &&
    typeof document.documentElement.webkitRequestFullscreen === 'undefined' &&
    typeof document.documentElement.mozRequestFullScreen === 'undefined' &&
    typeof document.documentElement.msRequestFullscreen === 'undefined') {
    // Hide the fullscreen button if fullscreen permissions are not supported
    fullscreenButton.style.display = 'none';
}

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

fullscreenButton.addEventListener('click', toggleFullScreen);

// Set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

document.addEventListener('DOMContentLoaded', function() {
    const closeModalButton = document.getElementById('close-modal-button');

    if (menuButton) {
        menuButton.addEventListener('click', function() {
            toggleShareModal(null);
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            toggleShareModal(null);
        });
    }

    function updateRenderer() {
        const modal = document.getElementById('share-modal');
        const mainContent = document.getElementById('main-content');
        const canvas = document.querySelector('canvas');
        const containerWidth = modal.classList.contains('show') ? mainContent.offsetWidth : window.innerWidth;

        if (renderer && camera) {
            renderer.setSize(containerWidth, window.innerHeight);
            camera.aspect = containerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            // Update canvas width and height attributes
            canvas.width = containerWidth;
            canvas.height = window.innerHeight;
        } else {
            console.error('Renderer or camera not defined');
        }
    }

    window.addEventListener('load', function() {
        updateRenderer();  // This will set everything up correctly on initial load
    });
});

/*Testing was performed. It appears that the modal resizes efficiently when shrinking, but when expanding the window, it ends up exposing part of the background as the modal moves faster than the THREE.js application can render. This may be a timing or a render issue. Code needs optimization for this reason. Also, buttons appear along with inf-box, which we only want the buttons when in mobile.*/
/* The above error is fixed now. */

window.addEventListener('resize', function () {
    const modal = document.getElementById('share-modal');
    const mainContent = document.getElementById('main-content');
    const modalWidth = modal.offsetWidth;
    const modalIsActive = modal.classList.contains('show');

    // Calculate the width of the main content based on modal visibility
    if (modalIsActive) {
        // If modal is active, subtract modal width from window width
        mainContent.style.width = `${window.innerWidth - modalWidth}px`;
    } else {
        // If modal is not active, use full window width for main content
        mainContent.style.width = `${window.innerWidth}px`;
    }

    // Update renderer size after container resize
    updateRenderer();
});

// Create a sphere
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a sphere
const sphereGeometry = new THREE.SphereGeometry(100, 256, 128);
sphereGeometry.scale(-1, 1, 1); // invert the geometry inside out

const textureLoader = new THREE.TextureLoader();

// Placeholder texture
const placeholderTexture = new THREE.TextureLoader().load('./panoramas/1_5.webp');

const material = new THREE.MeshBasicMaterial({
    map: placeholderTexture,
});

const sphere = new THREE.Mesh(sphereGeometry, material);
scene.add(sphere);

camera.position.set(0, 0, 0);
scene.add(camera);


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

document.addEventListener('mousedown', function(event) {
    if (event.target.closest('#scene-container')) {
        onMouseDown(event);
    }
});

document.addEventListener('mouseup', function(event) {
    if (event.target.closest('#scene-container')) {
        onPointerUp(event);
    }
});

document.addEventListener('mousemove', function(event) {
    if (event.target.closest('#scene-container')) {
        onPointerMove(event);
    }
});

document.addEventListener('touchstart', function(event) {
    if (event.target.closest('#scene-container')) {
        onTouchStart(event);
    }
});

document.addEventListener('touchend', function(event) {
    if (event.target.closest('#scene-container')) {
        onPointerUp(event);
    }
});

document.addEventListener('touchmove', function(event) {
    if (event.target.closest('#scene-container')) {
        onPointerMove(event);
    }
});

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
