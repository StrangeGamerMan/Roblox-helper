// Function to apply animations to elements on the page
function applyAnimations() {
  // --- Define which elements to animate and with which animation class ---
  // This makes it super easy to add more! Just find a selector and add it.
  const elementsToAnimate = {
    // Glow effect for key navigation and branding
    glow: [
      'a.nav-logo', // Roblox Logo
      '#nav-robux', // Robux icon/balance
      '#nav-friends', // Friends Icon
      '#nav-messages' // Messages Icon
    ],
    // Pulse effect for primary action buttons
    pulse: [
      '.btn-common-play-game-lg', // The big green "Play" button on game pages
      '.btn-growth-sm.btn-fixed-width-sm', // The small green play button on game lists
      '#purchase-button', // Buy button on item pages
      '.btn-primary-md.friends-request-accept-button' // Accept friend request button
    ]
  };

  // Apply the "glow" class to all specified elements
  const glowElements = document.querySelectorAll(elementsToAnimate.glow.join(', '));
  glowElements.forEach(el => el.classList.add('rblx-alive-glow'));

  // Apply the "pulse" class to all specified elements
  const pulseElements = document.querySelectorAll(elementsToAnimate.pulse.join(', '));
  pulseElements.forEach(el => el.classList.add('rblx-alive-pulse'));
}

// Function to create the toggle button
function createToggleButton() {
  const btn = document.createElement("button");
  btn.innerText = "Pause Animations";
  
  // Style the button (you can move this to styles.css for cleaner code)
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px 20px",
    backgroundColor: "#0074AB", // A slightly different blue
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    zIndex: "9999",
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  });

  document.body.appendChild(btn);

  // Set initial state
  let animationsPaused = false;

  // Handle clicks
  btn.onclick = () => {
    animationsPaused = !animationsPaused;
    
    // Toggle a single class on the body. CSS handles the rest!
    document.body.classList.toggle('animations-paused', animationsPaused);
    
    // Update button text
    btn.innerText = animationsPaused ? "Resume Animations" : "Pause Animations";
    btn.style.backgroundColor = animationsPaused ? "#585858" : "#0074AB";
  };
}

// --- Run the code ---
applyAnimations();
createToggleButton();
