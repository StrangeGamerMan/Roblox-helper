// Run when on roblox.com

// Add a glowing border animation to the Roblox logo as an example
const logo = document.querySelector('a.nav-logo'); 
if (logo) {
  logo.style.animation = "glow 2s infinite alternate";
}

// Create a floating button to toggle animations
const btn = document.createElement("button");
btn.innerText = "Toggle Animations";
btn.style.position = "fixed";
btn.style.bottom = "20px";
btn.style.right = "20px";
btn.style.padding = "10px 20px";
btn.style.backgroundColor = "#00bfff";
btn.style.color = "#fff";
btn.style.border = "none";
btn.style.borderRadius = "8px";
btn.style.cursor = "pointer";
btn.style.zIndex = "9999";

document.body.appendChild(btn);

let animationsOn = true;
btn.onclick = () => {
  animationsOn = !animationsOn;
  if (animationsOn) {
    logo.style.animationPlayState = "running";
    btn.innerText = "Disable Animations";
  } else {
    logo.style.animationPlayState = "paused";
    btn.innerText = "Enable Animations";
  }
};
