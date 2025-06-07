
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("dblclick", e => e.preventDefault());
document.addEventListener("contextmenu", e => e.preventDefault());

// Simplified audio management
let audioUnlocked = false;
let userHasInteracted = false;

// Sound cooldown management
const soundCooldowns = {};
const SOUND_COOLDOWN = 1500; // 1.5 second delay for add item sounds only
const COLUMN_SOUND_COOLDOWN = 0; // No delay for column sounds
let soundsMuted = false;
let animationsDisabled = false;

function unlockAudioContext() {
  if (!audioUnlocked && userHasInteracted) {
    audioUnlocked = true;
    console.log('Audio context unlocked');
  }
}

// Audio initialization for web compatibility
document.addEventListener('DOMContentLoaded', () => {
  // No preloading since we removed sound files
});

// Unlock audio on first interaction
['touchstart', 'touchend', 'mousedown', 'click'].forEach(event => {
  document.addEventListener(event, () => { 
    userHasInteracted = true; 
    unlockAudioContext(); 
  }, { once: true, passive: true });
});

function playSound(id, column = null) {
  if (!userHasInteracted || soundsMuted) return;

  const now = Date.now();
  const isAddSound = id.includes('add');
  const cooldownTime = isAddSound ? SOUND_COOLDOWN : COLUMN_SOUND_COOLDOWN;
  
  if (soundCooldowns[id] && (now - soundCooldowns[id]) < cooldownTime) {
    return;
  }

  soundCooldowns[id] = now;

  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.volume = (window.systemVolume || 0.8);
    audio.play().catch(e => console.log('Audio play failed:', e));
  }
}

const FOH_CODES = [
  "C1", "C2", "C3", 
  "C4", 
  "CB1", "CB3", "CB5", 
  "B1", "B3", "B5",
  "F1", "F4", 
  "E1", "E2", "E3", 
  "M1", "R1", "R2", 
  "V"
];

const STIR_FRY_CODES = ["C2", "C3", "CB1", "B1", "B3", "F1"];

const NAME_MAP = {
  C1: "Orange Chk",
  C2: "Mushroom Chk",
  C3: "Kung Pao Chk",
  CB1: "String Bean CB",
  CB3: "Honey Sesame CB",
  CB5: "SweetFire CB",
  B1: "Broccoli Beef",
  B3: "Blk Pepper Steak",
  B5: "Beijing Beef",
  F1: "Wok Fired Shrimp",
  F4: "Honey Walnut Shrimp",
  E1: "Veg Spring Roll",
  E2: "Chk Egg Roll",
  E3: "Cheese Rangoons",
  M1: "Chow Mein",
  R1: "Fried Rice",
  R2: "White Rice",
  V: "Super Greens",
  C4: "Teriyaki Chk"
};

const fohPanel = document.getElementById("foh-panel");
const entreePanel = document.getElementById("entree-panel");
const sidePanel = document.getElementById("side-panel");

const activeItems = {};
const itemStatus = {};
const timers = {};


// Create buttons grid
const buttonsGrid = document.createElement("div");
buttonsGrid.className = "foh-buttons-grid";
fohPanel.appendChild(buttonsGrid);

// Menu Items title handler
const menuItemsTitle = fohPanel.querySelector('h2');
menuItemsTitle.style.cursor = 'pointer';

menuItemsTitle.addEventListener("click", (e) => {
  e.preventDefault();
  resetAllTimers();
});

// Initialize buttons with compact layout
const buttonLayout = [
  ["C1", "C2", "C3"],           // Row 1: C1, C2, C3
  ["C4"],                       // Row 2: C4 only (flush left, larger)
  ["CB1", "CB3", "CB5"],        // Row 3: CB1, CB3, CB5
  ["B1", "B3", "B5"],           // Row 4: B1, B3, B5
  ["F1", "F4"],                 // Row 5: F1, F4 (50% width each)
  ["E1", "E2", "E3"],           // Row 6: E1, E2, E3
  ["M1", "R1", "R2"],           // Row 7: M1, R1, R2
  ["V"]                         // Row 8: V only (flush left)
];

buttonLayout.forEach((row, rowIndex) => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "button-row";
  
  // Special styling for specific rows
  if (row.includes("C4")) {
    rowDiv.classList.add("c4-row");
  } else if (row.includes("F1")) {
    rowDiv.classList.add("fish-row");
  } else if (row.includes("V")) {
    rowDiv.classList.add("v-row");
  } else if (row.length === 1) {
    rowDiv.classList.add("single-button");
  }
  
  if (rowIndex > 0 && rowIndex < buttonLayout.length - 1) {
    rowDiv.classList.add("spaced-row");
  }
  
  row.forEach(code => {
    createFOHButton(code, rowDiv);
  });
  
  buttonsGrid.appendChild(rowDiv);
});

setInterval(updateTimers, 1000);


// Inactivity management
let inactivityTimer;
let timeoutWarningTimer;
let countdownTimer;
const INACTIVITY_TIME = 20 * 60 * 1000; // 20 minutes
const WARNING_TIME = 30 * 1000; // 30 seconds

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  clearTimeout(timeoutWarningTimer);
  clearTimeout(countdownTimer);
  closeTimeoutPopup();

  timeoutWarningTimer = setTimeout(() => {
    showTimeoutWarning();
  }, INACTIVITY_TIME - WARNING_TIME);

  inactivityTimer = setTimeout(() => {
    window.location.href = 'index.html';
  }, INACTIVITY_TIME);
}

function showTimeoutWarning() {
  const popup = document.getElementById('timeout-popup');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    let countdown = 30;
    const countdownElement = document.getElementById('timeout-countdown');

    countdownTimer = setInterval(() => {
      countdown--;
      countdownElement.textContent = countdown;

      if (countdown <= 0) {
        clearInterval(countdownTimer);
        window.location.href = 'index.html';
      }
    }, 1000);
  }
}

function closeTimeoutPopup() {
  const popup = document.getElementById('timeout-popup');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }
  clearInterval(countdownTimer);
}

// Activity tracking
['touchstart', 'touchend', 'mousedown', 'mousemove', 'keydown', 'scroll'].forEach(event => {
  document.addEventListener(event, resetInactivityTimer);
});

resetInactivityTimer();

document.addEventListener('DOMContentLoaded', () => {
  const stayActiveBtn = document.getElementById('stay-active-btn');
  if (stayActiveBtn) {
    stayActiveBtn.addEventListener('click', () => {
      resetInactivityTimer();
    });
  }
});

function createFOHButton(code, container = buttonsGrid) {
  const btn = document.createElement("button");
  btn.className = "code-button";
  btn.dataset.code = code;

  const codeSpan = document.createElement("span");
  codeSpan.className = "button-code";
  codeSpan.textContent = code;

  const nameSpan = document.createElement("span");
  nameSpan.className = "button-name";
  nameSpan.textContent = NAME_MAP[code] || code;

  btn.appendChild(codeSpan);
  btn.appendChild(nameSpan);

  // Double-click tracking
  let clickCount = 0;
  let clickTimer = null;

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    clickCount++;

    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        // Single click
        handleButtonClick(code);
        clickCount = 0;
      }, 300);
    } else if (clickCount === 2) {
      // Double click
      clearTimeout(clickTimer);
      if (activeItems[code]) {
        removeItem(code);
      }
      clickCount = 0;
    }
  });

  btn.addEventListener("touchend", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Use same logic for touch
    btn.click();
  });

  container.appendChild(btn);
}

function handleButtonClick(code) {
  if (!activeItems[code]) {
    addItem(code);
    // Use different sounds for different panels
    const isSide = ["M1", "R1", "R2", "C4"].includes(code);
    if (isSide) {
      playSound("sound-add-sides");
    } else {
      playSound("sound-add");
    }
  } else {
    // Flash the button instead of playing sound
    flashButton(code);
    if (itemStatus[code] === "normal") {
      prioritizeItem(code);
    } else if (itemStatus[code] === "priority") {
      downgradeItem(code);
    }
  }
}

function addItem(code) {
  const isSide = ["M1", "R1", "R2", "C4"].includes(code);
  const isStirFry = STIR_FRY_CODES.includes(code);

  const wrapper = document.createElement("div");
  wrapper.className = isSide ? "side-item" : "entree-item";

  const label = document.createElement("div");
  label.className = "code-label";
  label.textContent = code;

  const name = document.createElement("div");
  name.className = "item-name";
  name.textContent = NAME_MAP[code] || code;

  const time = document.createElement("div");
  time.className = "item-timer";
  time.textContent = "0:00";

  const waitingText = document.createElement("div");
  waitingText.className = "waiting-text";
  waitingText.textContent = "Waiting";
  waitingText.style.display = "none";

  wrapper.append(label, name, waitingText, time);

  if (isSide) {
    sidePanel.appendChild(wrapper);
  } else if (isStirFry) {
    const stirFrySection = document.getElementById("stir-fry-section");
    stirFrySection.style.display = "block";
    const stirFryItems = document.getElementById("stir-fry-items");
    stirFryItems.appendChild(wrapper);
  } else {
    const stirFrySection = document.getElementById("stir-fry-section");
    entreePanel.insertBefore(wrapper, stirFrySection);
  }

  activeItems[code] = wrapper;
  timers[code] = Date.now();
  itemStatus[code] = "normal";
  wrapper.dataset.status = "green";

  setupItemClick(wrapper, code);
  setupSwipeToRemove(wrapper, code);
  updateButton(code, "green");
}

function prioritizeItem(code) {
  itemStatus[code] = "priority";
  const node = activeItems[code];

  if (node) {
    const currentStatus = node.dataset.status;
    node.classList.add("priority");
    if (currentStatus) {
      node.classList.add(currentStatus);
    }

    const waitingText = node.querySelector(".waiting-text");
    if (waitingText) {
      waitingText.style.display = "block";
    }

    // Move to top of respective column
    const isSide = ["M1", "R1", "R2", "C4"].includes(code);
    const isStirFry = STIR_FRY_CODES.includes(code);
    
    if (isSide) {
      const firstChild = sidePanel.querySelector('.side-item, .stir-fry-section');
      if (firstChild && firstChild !== node) {
        sidePanel.insertBefore(node, firstChild);
      }
    } else if (isStirFry) {
      const stirFryItems = document.getElementById("stir-fry-items");
      const firstStirFryItem = stirFryItems.firstElementChild;
      if (firstStirFryItem && firstStirFryItem !== node) {
        stirFryItems.insertBefore(node, firstStirFryItem);
      }
    } else {
      const stirFrySection = document.getElementById("stir-fry-section");
      const firstEntreeItem = entreePanel.querySelector('.entree-item');
      if (firstEntreeItem && firstEntreeItem !== node) {
        entreePanel.insertBefore(node, firstEntreeItem);
      } else if (!firstEntreeItem) {
        entreePanel.insertBefore(node, stirFrySection);
      }
    }
  }

  const btn = [...fohPanel.querySelectorAll("button")].find(b => {
    const codeSpan = b.querySelector(".button-code");
    return codeSpan && codeSpan.textContent === code;
  });
  if (btn) {
    btn.classList.add("priority");
  }

  // Play priority sound and flash column
  playSound("priority");
  const isSide = ["M1", "R1", "R2", "C4"].includes(code);
  if (isSide) {
    flashColumnOrange(sidePanel);
  } else {
    flashColumnOrange(entreePanel);
  }
}

function downgradeItem(code) {
  itemStatus[code] = "normal";
  const node = activeItems[code];
  if (node) {
    node.classList.remove("priority");

    const waitingText = node.querySelector(".waiting-text");
    if (waitingText) {
      waitingText.style.display = "none";
    }
  }

  const btn = [...fohPanel.querySelectorAll("button")].find(b => {
    const codeSpan = b.querySelector(".button-code");
    return codeSpan && codeSpan.textContent === code;
  });
  if (btn) btn.classList.remove("priority");
}

function removeItem(code) {
  const node = activeItems[code];
  if (node) {
    node.remove();
    delete activeItems[code];
    delete itemStatus[code];
    delete timers[code];
    playSound("sound-remove");

    const button = [...fohPanel.querySelectorAll("button")].find(b => {
      const codeSpan = b.querySelector(".button-code");
      return codeSpan && codeSpan.textContent === code;
    });
    if (button) {
      button.className = "code-button";
    }

    if (STIR_FRY_CODES.includes(code)) {
      updateStirFrySection();
    }
  }
}

function updateStirFrySection() {
  const stirFrySection = document.getElementById("stir-fry-section");
  const hasActiveStirFryItems = STIR_FRY_CODES.some(code => activeItems[code]);

  if (hasActiveStirFryItems) {
    stirFrySection.style.display = "block";
  } else {
    stirFrySection.style.display = "none";
  }
}

function setupItemClick(element, code) {
  element.addEventListener("click", (e) => {
    if (itemStatus[code] === "normal") {
      prioritizeItem(code);
    } else if (itemStatus[code] === "priority") {
      downgradeItem(code);
    }
  });

  element.style.cursor = "pointer";
}

function updateTimers() {
  const now = Date.now();

  Object.keys(activeItems).forEach(code => {
    const elapsed = Math.floor((now - timers[code]) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const display = `${min}:${sec.toString().padStart(2, "0")}`;
    const timerElement = activeItems[code].querySelector(".item-timer");
    timerElement.textContent = display;

    let previousStatus = activeItems[code].dataset.status || "green";
    let status;

    let yellowThreshold, redThreshold;

    if (code === "C4") {
      yellowThreshold = 600; // 10 minutes
      redThreshold = 720; // 12 minutes
    } else if (["C1", "CB5", "E2"].includes(code)) {
      yellowThreshold = 480; // 8 minutes
      redThreshold = 600; // 10 minutes
    } else {
      yellowThreshold = 180; // 3 minutes
      redThreshold = 300; // 5 minutes
    }

    if (elapsed >= redThreshold) {
      status = "red";
      if (previousStatus !== "red") {
        playSound("sound-warning");
        if (!animationsDisabled) {
          flashScreen();

          const isSide = ["M1", "R1", "R2", "C4"].includes(code);
          if (isSide) {
            flashColumnRed4Sec(sidePanel);
          } else {
            flashColumnRed4Sec(entreePanel);
          }
        }
      }
    } else if (elapsed >= yellowThreshold) {
      status = "orange";
    } else {
      status = "green";
    }

    activeItems[code].dataset.status = status;

    const isPriority = itemStatus[code] === "priority";
    const baseClass = activeItems[code].className.split(" ")[0];
    activeItems[code].className = baseClass + " " + status;
    if (isPriority) {
      activeItems[code].classList.add("priority");
    }

    updateButton(code, status);
  });
}

function updateButton(code, status) {
  const button = [...fohPanel.querySelectorAll("button")].find(b => {
    const codeSpan = b.querySelector(".button-code");
    return codeSpan && codeSpan.textContent === code;
  });
  if (button) {
    const isPriority = button.classList.contains("priority");
    button.className = "code-button";
    if (status) button.classList.add(status);
    if (isPriority) button.classList.add("priority");
  }
}

function resetAllTimers() {
  const itemsToRemove = Object.keys(activeItems);

  if (itemsToRemove.length === 0) return;

  playSound("sound-remove");

  // Flash menu column yellow and glow header
  flashColumnYellow4Sec(fohPanel);
  const menuTitle = fohPanel.querySelector('h2');
  glowTitle(menuTitle, 'yellow');

  itemsToRemove.forEach(code => {
    const node = activeItems[code];
    if (node) {
      node.remove();
    }

    const button = [...fohPanel.querySelectorAll("button")].find(b => {
      const codeSpan = b.querySelector(".button-code");
      return codeSpan && codeSpan.textContent === code;
    });
    if (button) {
      button.className = "code-button";
    }
  });

  Object.keys(activeItems).forEach(code => delete activeItems[code]);
  Object.keys(itemStatus).forEach(code => delete itemStatus[code]);
  Object.keys(timers).forEach(code => delete timers[code]);

  updateStirFrySection();
}

function flashScreen() {
  if (animationsDisabled) return;
  const screenFlash = document.getElementById('screen-flash');
  if (screenFlash) {
    screenFlash.classList.add('screen-flash-active');
    setTimeout(() => {
      screenFlash.classList.remove('screen-flash-active');
    }, 2100); // Increased from 600ms to 2100ms (1.5 seconds longer)
  }
}

function flashColumn(panelElement) {
  if (animationsDisabled) return;
  panelElement.classList.add('column-glow');
  setTimeout(() => {
    panelElement.classList.remove('column-glow');
  }, 2000);
}

function setupSwipeToRemove(element, code) {
  let startX = 0;
  let startTime = 0;

  element.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startTime = Date.now();
    }
  }, { passive: false });

  element.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - startX;
      const timeDelta = Date.now() - startTime;

      if (deltaX < -120 && timeDelta > 150 && timeDelta < 1200) {
        e.preventDefault();
        // Reset timer instead of removing item
        timers[code] = Date.now();
        // Use different sounds for different panels
        const isSide = ["M1", "R1", "R2", "C4"].includes(code);
        if (isSide) {
          playSound("sound-add-sides");
        } else {
          playSound("sound-add");
        }
      } else if (deltaX > 120 && timeDelta > 150 && timeDelta < 1200) {
        e.preventDefault();
        removeItem(code);
      }
    }
  }, { passive: false });
}

// Column click handlers
const entreesTitle = entreePanel.querySelector('h2');
entreesTitle.style.cursor = 'pointer';
entreesTitle.addEventListener('click', () => {
  playSound("sound-page", "entrees");
  flashColumnPink4Sec(entreePanel);
  glowTitle(entreesTitle, 'pink');
});

const sidesTitle = sidePanel.querySelector('h2');
sidesTitle.style.cursor = 'pointer';
sidesTitle.addEventListener('click', () => {
  playSound("sides-page", "sides");
  flashColumnLightBlue4Sec(sidePanel);
  glowTitle(sidesTitle, 'lightblue');
});

// Mute sounds function
function toggleMuteSounds(enabled) {
  soundsMuted = enabled;
  console.log(`Sounds ${enabled ? 'muted' : 'unmuted'}`);
}

function flashButton(code) {
  const button = document.querySelector(`[data-code="${code}"]`);
  if (button && !animationsDisabled) {
    button.style.animation = 'buttonFlash 0.6s ease-in-out';
    setTimeout(() => {
      button.style.animation = '';
    }, 600);
  }
}



function flashColumnOrange(panelElement) {
  panelElement.classList.add('column-flash-orange');
  setTimeout(() => {
    panelElement.classList.remove('column-flash-orange');
  }, 2400); // 3 flashes * 0.8s each
}

function flashColumnYellow4Sec(panelElement) {
  if (animationsDisabled) return;
  panelElement.classList.add('column-flash-yellow-4sec');
  setTimeout(() => {
    panelElement.classList.remove('column-flash-yellow-4sec');
  }, 4000);
}

function flashColumnRed4Sec(panelElement) {
  if (animationsDisabled) return;
  panelElement.classList.add('column-flash-red-4sec');
  setTimeout(() => {
    panelElement.classList.remove('column-flash-red-4sec');
  }, 4000);
}

function flashColumnPink4Sec(panelElement) {
  if (animationsDisabled) return;
  panelElement.classList.add('column-flash-pink-4sec');
  setTimeout(() => {
    panelElement.classList.remove('column-flash-pink-4sec');
  }, 4000);
}

function flashColumnLightBlue4Sec(panelElement) {
  if (animationsDisabled) return;
  panelElement.classList.add('column-flash-lightblue-4sec');
  setTimeout(() => {
    panelElement.classList.remove('column-flash-lightblue-4sec');
  }, 4000);
}

function glowTitle(titleElement, color) {
  if (animationsDisabled) return;
  titleElement.classList.add(`title-glow-${color}`);
  setTimeout(() => {
    titleElement.classList.remove(`title-glow-${color}`);
  }, 4000);
}

function testPriorityFlash() {
  flashColumnOrange(entreePanel);
  setTimeout(() => {
    flashColumnOrange(sidePanel);
  }, 1000);
}

// How To Guide functions
function openHowToGuide() {
  const popup = document.getElementById('how-to-popup');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeHowToGuide() {
  const popup = document.getElementById('how-to-popup');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Close popups
document.addEventListener('click', (e) => {
  const howToPopup = document.getElementById('how-to-popup');

  if (howToPopup && e.target === howToPopup) {
    closeHowToGuide();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeHowToGuide();
  }
});

// Language toggle
let isSpanish = false;

function toggleLanguage() {
  isSpanish = !isSpanish;
  const translateBtn = document.getElementById('translate-btn');
  const popupTitle = document.getElementById('popup-title');

  if (isSpanish) {
    translateBtn.textContent = 'EN';
    popupTitle.textContent = 'Guía del Sistema';

    const translatableElements = document.querySelectorAll('[data-es]');
    translatableElements.forEach(element => {
      element.innerHTML = element.getAttribute('data-es');
    });
  } else {
    translateBtn.textContent = 'ES';
    popupTitle.textContent = 'System Guide';

    const translatableElements = document.querySelectorAll('[data-en]');
    translatableElements.forEach(element => {
      element.innerHTML = element.getAttribute('data-en');
    });
  }
}