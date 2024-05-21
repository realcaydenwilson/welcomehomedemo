<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>Welcome Home Immersive Tour</title>
    <link
      rel="icon"
      type="image/x-icon"
      href="./images/favicon.png"
    />
    <link rel="stylesheet" type="text/css" href="style.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://unpkg.com/webxr-polyfill@latest"></script>
  </head>
  <body> 
    <div id="main-content">
      <!-- All your main content goes here -->
      <div id="info-box">
        <img id="client-logo" src="./images/welcome_home_logo.png" alt="Client Logo" />
        <hr>
        <h3 id="project-name"><b>Custom Home Demo</b></h3>
        <p id="client-name">by Welcome Home</p>
      </div>

      <div id="button-container">
        <button type="button" id="moa-button" title="Motion and Orientation"><i class="fas fa-compass"></i></button>
        <button type="button" id="vr-button" title="Virtual Reality"><i class="fas fa-vr-cardboard"></i></button>
        <button type="button" id="share-button" title="Share"><i class="fas fa-share-alt"></i></button>
        <button type="button" id="fullscreen-button" title="Fullscreen"><i class="fas fa-expand"></i></button>
      </div>

      <div id="scene-container">
        <canvas id="three-canvas"></canvas>
        <script src="main.js"></script>
      </div>
    </div>

    <div id="share-modal" class="modal">
      <div class="modal-content">
        <button id="close-modal-button" class="close-modal-button">X</button>
        <h1>ABOUT THIS PROPERTY</h1>
        <p class="about">Struggling to close deals because clients can't visualize their dream home? Imagine turning simple blueprints into interactive, life-like spaces. Welcome Home does just that. Our immersive tours, created from your floor plans, offer “to-scale”, photorealistic renderings accessible on any device. Say goodbye to design uncertainties and hello to faster sales and satisfied clients.</p>
        <h3>SHARE THIS TOUR</h3>
        <div class="share-icons-container"> <!-- Container for icons -->
          <a href="#" onclick="shareToPlatform('facebook')" title="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" onclick="shareToPlatform('whatsapp')" title="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
          <a href="#" onclick="shareToPlatform('twitter')" title="Share on Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" onclick="shareToPlatform('linkedin')" title="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" onclick="copyLink()" title="Copy Link"><i class="fas fa-copy"></i></a>
        </div>
        <hr>
        <h2>GET IN TOUCH</h2>
        <div class="contact-rep">
          <img src="./images/profile-image.jpg" alt="Rep Name" class="rep-image" loading="lazy">
          <div class="rep-info">
            <h2>cayden wilson</h2>
            <h4>WELCOME HOME</h4>
            <p><span class="label"><i class="fas fa-envelope icon"></i></span><a href="mailto:cayden@saywelcomehome.com">cayden@saywelcomehome.com</a></p>
            <p><span class="label"><i class="fas fa-phone icon"></i></span>+1(614) 205-0799</p>
            <p><span class="label"><i class="fas fa-globe icon"></i></span><a href="https://saywelcomehome.com" target="_blank">saywelcomehome.com</a></p>
          </div>
        </div>
        <div id="design-options-container">
          <button id="design-options-trigger">
            <i class="fas fa-plus"></i>
        </button>
        <h3 for="design-options-trigger">DESIGN CENTER</h3>
          <div id="design-options-dropdown" class="dropdown-content">
            <button id="style1-button">
              <img src="./images/style1.jpg" alt="Style 1" loading="lazy">
              <div>
                  <h2>Coastal Design</h2>
                  <p>Beachy inspiration and soft, tranquil hues create a welcoming, relaxing space.</p>
              </div>
          </button>
          <button id="style2-button">
              <img src="./images/style2.jpg" alt="Style 2">
              <div>
                  <h2>Traditional Design</h2>
                  <p>Historically inspired colors create a warm and homey escape.</p>
              </div>
          </button>
              <!-- More links can be added similarly -->
          </div>
      </div>
      <div id="design-options-container">
          <button id="floorplan-options-trigger">
            <i class="fas fa-plus"></i>
        </button>
      <h3 for="floorplan-options-trigger">FLOORPLANS</h3>
          <div id="floorplan-options-dropdown" class="dropdown-content">
              <button href="https://saywelcomehome.com" target="_blank">
                  <img src="./images/style1.jpg" alt="Style 1" loading="lazy">
                  <div>
                      <h2>STUDIO</h2>
                      <p>264 SF<br>Private Balcony<br>Modern Finishes</p>
                  </div>
              </button>
              <button href="https://saywelcomehome.com" target="_blank">
                  <img src="./images/style2.jpg" alt="Style 2">
                  <div>
                      <h2>SINGLE BEDROOM</h2>
                      <p>413 SF<br>Private Balcony<br>Spacious Design</p>
                  </div>
              </button>
              <!-- More links can be added similarly -->
          </div>
      </div>
      </div>
    </div>  
  </body>
</html>
