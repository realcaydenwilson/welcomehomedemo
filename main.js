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

document.addEventListener('mousedown', function(event) {
    isDragging = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
    lastDragTime = Date.now();
  });
  
  document.addEventListener('mouseup', function() {
    isDragging = false;
  });
  
  document.addEventListener('mouseleave', function() {
    isDragging = false;
  });

document.addEventListener('mousemove', function (event) {
    if (!isDragging) return;
  
    const now = Date.now();
    const deltaTime = now - lastDragTime;
    const deltaX = event.clientX - previousMouseX;
    const deltaY = event.clientY - previousMouseY;
  
    // Calculate rotation speed based on movement and time
    rotationSpeedY = deltaX / deltaTime * 0.01;
    rotationSpeedX = deltaY / deltaTime * 0.01;

    // Apply rotation while dragging
    sphere.rotation.y += deltaX * 0.005;
    sphere.rotation.x += deltaY * 0.005;
  
    // Update last positions and time
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
    lastDragTime = now;
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
