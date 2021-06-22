let root = document.documentElement;

let getCSSValue = function (varName) {
  return getComputedStyle(root).getPropertyValue(varName);
};

function debounce(func, timeout = 10){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

let dock     = root.querySelector(".dock-container");
let icons    = root.querySelectorAll(".icon-container");
let iconSize = parseFloat(getCSSValue("--icon-size"));
let space    = 250;
let scale    = 1;
let scaleMagnificent = 2;
let lastMouseX = 0;

let refreshIconSize = function (e, iconContainer) {
  let icon = iconContainer.children[0];
  let mouseX = e.clientX;
  let iconX = icon.getBoundingClientRect().x; //left of icon
  iconX += icon.getBoundingClientRect().width / 2; //centered icon
  let diffpx = Math.abs(mouseX - iconX);
  let aditionalScale = diffpx < space ? (space - diffpx) / space : 0;
  aditionalScale *= scaleMagnificent;
  let iconScale = scale + (aditionalScale > 0 ? aditionalScale : 0);



  iconContainer.style.width = iconScale * iconSize + "px";
  icon.style.transform = "scale(" + iconScale + ")";
};

let refreshDock = function (e) {
  console.log("refreshDock")
  let mouseX = e.clientX;
  if(mouseX != lastMouseX){
    dock.style.paddingTop = iconSize * scaleMagnificent + "px";
    lastMouseX = mouseX;

    //dock.style.paddingLeft = mouseX  + "px";
    //dock.style.paddingRight = iconSize * scaleMagnificent*0.5 + "px";
    icons.forEach((iconContainer) => refreshIconSize(e, iconContainer));
  setTimeout(() => {
    dock.classList.remove("clear");
  },1000);
  }
  e.stopPropagation();
};


let clearDock = function (e) {
  dock.style.transform = "scaleY(1)";
  icons.forEach((iconContainer) => {
    let icon = iconContainer.children[0];
    iconContainer.style.width = iconSize + "px";
    icon.style.transform = "scale(1)";
    dock.style.paddingTop = "0px";
    dock.style.paddingLeft = "0px";
    dock.style.paddingRight = "0px";
  });
    dock.classList.add("clear");

};

let refreshDockDebounced = null;

dock.addEventListener("mouseenter", (e) => {
  //refreshDockDebounced = debounce(() => refreshDock(e));
  refreshDock(e);
});
dock.addEventListener("mousemove", (e) => {
  //refreshDockDebounced();
  refreshDock(e);
});
dock.addEventListener("mouseleave", (e) => clearDock(e));









let draggableWindows = root.querySelectorAll(".window[is-draggable]");
let activeWindow = null;

function setActiveWindow(elem){
  activeWindow = elem;
  draggableWindows.forEach(elem => {
    elem.classList.remove("active");
  })
  elem.classList.add("active");
}

function isDraggableSection(e){
  let rect = activeWindow.getBoundingClientRect();
  let mouseXOnWindow = e.clientX - rect.x;
  let mouseYOnWindow = e.clientY - rect.y;

  if(mouseXOnWindow > rect.width - 30) return false;
  if(mouseYOnWindow > rect.height - 30) return false;

  return true
}

function onDrag(e) {
  if(isDraggableSection(e)){
    let targetStyle = window.getComputedStyle(activeWindow)
    activeWindow.style.left = parseInt(targetStyle .left) + e.movementX + 'px'
    activeWindow.style.top = parseInt(targetStyle .top) + e.movementY + 'px'
  }
  e.stopPropagation();
}

function onLetGo() {
	document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', onLetGo)
}

function onGrab() {
	document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', onLetGo)
}


draggableWindows.forEach(elem => {
  elem.addEventListener("mousedown", e => setActiveWindow(elem));
  elem.addEventListener("mousedown", onGrab);
  let disableDraggable = elem.querySelectorAll("[disable-draggable]");
  disableDraggable.forEach(elem => {
    elem.addEventListener("mousedown",e => e.stopPropagation());
  })
});








let toggleWidget = root.querySelector("[toggle-widget]");
let widgets = root.querySelector(".widgets");

toggleWidget.addEventListener("click", (e) => {
  let isHidden = widgets.classList.contains("hide");
  if (isHidden) {
    widgets.classList.remove("hide");
  } else {
    widgets.classList.add("hide");
  }
});






let toggleControlPanel = root.querySelector("[toggle-control-panel]");
let controlPanel = root.querySelector(".control-panel");

toggleControlPanel.addEventListener("click", (e) => {
  let isHidden = controlPanel.classList.contains("hide");
  if (isHidden) {
    controlPanel.classList.remove("hide");
  } else {
    controlPanel.classList.add("hide");
  }
});



let toggleSpotlight = root.querySelector("[toggle-spotlight]");
let spotlight = root.querySelector(".spotlight");

toggleSpotlight.addEventListener("click", (e) => {
  let isHidden = spotlight.classList.contains("hide");
  if (isHidden) {
    spotlight.classList.remove("hide");
    toggleSpotlight.classList.remove("active");
  } else {
    spotlight.classList.add("hide");
    toggleSpotlight.classList.add("active");
  }
});











let toggleMenuItem = function (dropdownButton, e) {
  let dropdown = dropdownButton.querySelector(".dropdown");
  if (dropdown.classList.contains("hide")) {
    dropdown.classList.remove("hide");
    dropdownButton.classList.add("active");
  } else {
    dropdown.classList.add("hide");
    dropdownButton.classList.remove("active");
  }
};

let dropdownButtons = root.querySelectorAll("[has-dropdown]");
dropdownButtons.forEach((ddb) => {
  ddb.addEventListener("click", (e) => toggleMenuItem(ddb, e));
});

