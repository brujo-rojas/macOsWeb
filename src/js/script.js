let root = document.documentElement;

let getCSSValue = function (varName) {
  return getComputedStyle(root).getPropertyValue(varName);
};

function debounce(func, timeout = 50){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

let dock             = root.querySelector(".dock-container");
let icons            = root.querySelectorAll(".icon-container");
let iconSize         = parseFloat(getCSSValue("--icon-size"));
let space            = 250;
let scale            = 1;
let scaleMagnificent = 2;
let lastMouseX       = 0;
let isMouseOnDock    = false;

let scaleMultiplier = 1;
let radMultiplier = 1;

let refreshIconSize = function (e, iconContainer) {
  let icon = iconContainer.children[0];
  let mouseX = e.clientX;
  let iconX = icon.getBoundingClientRect().x; //left of icon
  iconX += icon.getBoundingClientRect().width / 2; //centered icon
  let diffpx = mouseX - iconX;
  let scale = 1;
  let rad = 1;
  
  if(Math.abs(diffpx) <  (5*iconSize * radMultiplier) ){
    rad =  diffpx / iconSize * 0.5 / radMultiplier;
    scale = 1 + Math.cos(rad);
    scale *= scaleMultiplier;
    scale = scale > 1 ? scale : 1;
  }


  iconContainer.style.width = scale * iconSize + "px";
  icon.style.transform = "scale(" + Math.abs(scale) + ")";
}

/*
let refreshIconSize = function (e, iconContainer) {
  let icon            = iconContainer.children[0];
  let mouseX          = e.clientX;
  let iconX           = icon.getBoundingClientRect().x; //left of icon
  iconX              += icon.getBoundingClientRect().width / 2; //centered icon
  let diffpx = Math.abs(mouseX - iconX);
  let aditionalScale  = diffpx < space ? (space - diffpx) / space : 0;
  //aditionalScale = Math.sqrt(aditionalScale);
  aditionalScale     *= scaleMagnificent;
  let iconScale       = scale + (aditionalScale > 0 ? aditionalScale : 0);

  iconContainer.style.width = "calc("+iconScale * iconSize + "px + "+ (iconScale * 0.5 )+"rem)"; 

  icon.style.transform = "scale(" + iconScale + ")";
};*/





let refreshDock = function (e) {
  let mouseX = e.clientX;
  if(mouseX != lastMouseX){
    /*
    let dockX = dock.getBoundingClientRect().x;
    let dockWidth = dock.getBoundingClientRect().width;
    let diffMax = space ;

    let diffLeft = diffMax - (mouseX - dockX);
    diffLeft = diffLeft >  diffMax ?   diffMax : diffLeft;
    diffLeft = diffLeft > 0 ? diffLeft : 0;

    let diffRight =  diffMax - ((dockX + dockWidth) - mouseX);
    diffRight = diffRight >  diffMax ?  diffMax : diffRight;
    diffRight = diffRight > 0 ? diffRight : 0;

    lastMouseX = mouseX;

    let marginLeft =  diffLeft/2 + "px";
    let marginRight =  diffRight/2 + "px";
    let paddingTop = iconSize * scaleMagnificent + "px";
    dock.style.cssText = "margin-left:"+marginLeft+"; margin-right:"+marginRight+"; padding-top:"+paddingTop;
    //dock.style.paddingRight = iconSize * scaleMagnificent*0.5 + "px";
    //*/
    icons.forEach((iconContainer) => refreshIconSize(e, iconContainer));
    /*setTimeout(() => {
      dock.classList.remove("clear");
    },1000);*/
  }
  e.stopPropagation();
};


let clearDock = function () {
  if(isMouseOnDock) return false;
  dock.style.transform = "scaleY(1)";
  icons.forEach((iconContainer) => {
    let icon = iconContainer.children[0];
    iconContainer.style.width = "calc("+iconSize + "px )";
    icon.style.transform = "scale(1)";
    dock.style.paddingTop = "0px";
    dock.style.marginLeft = "0px";
    dock.style.marginRight = "0px";
  });
    dock.classList.add("clear");
};

let refreshDockDebounced = null;

dock.addEventListener("mouseenter", (e) => {
  //refreshDockDebounced = debounce(() => refreshDock(e));
  isMouseOnDock = true;
  refreshDock(e);
});

dock.addEventListener("mousemove", (e) => {
  //refreshDockDebounced();
  refreshDock(e);
});


let clearDockDebounce = debounce(() => clearDock());
dock.addEventListener("mouseleave", (e) => {
  isMouseOnDock = false;
  clearDockDebounce(e)
});









let draggableWindows = root.querySelectorAll(".window[is-draggable]");
let activeWindow = null;
let eventDraggWindows= null;

function setActiveWindow(elem){
  activeWindow = elem;
  draggableWindows.forEach(elem => {
    elem.classList.remove("active");
  })
  elem.classList.add("active");
}

function isDraggable(e){
  let rect = activeWindow.getBoundingClientRect();
  let mouseXOnWindow = e.clientX - rect.x;
  let mouseYOnWindow = e.clientY - rect.y;

  //deshabilitado drag en borde inferior y derecho, para permitir resize
  if(mouseXOnWindow > rect.width - 30) return false;
  if(mouseYOnWindow > rect.height - 30) return false;

  if(activeWindow.classList.contains("maximize")) return false;
  if(eventDraggWindows.target.closest("[disable-draggable]")) return false;

  return true
}

function onDrag(e) {
  if(e.button !== 0) return;

  if(eventDraggWindows === null){
    eventDraggWindows = e;
    eventDraggWindows.target.closest(".window").classList.add("dragging");
  }
  if( isDraggable(e)){
    let targetStyle = window.getComputedStyle(activeWindow)

    //activeWindow.style.transform = "translate( "+ e.clientX+ 'px,'+ e.clientY+ 'px)'

    let left =  parseInt(targetStyle.left) + e.movementX;
    let top =  parseInt(targetStyle.top) + e.movementY;

    activeWindow.style.left = (left > 0 ? left : 0 ) + 'px';
    activeWindow.style.top = (top > 0 ? top : 0 ) + 'px';

  }
  e.stopPropagation();
}

function onLetGo() {
	document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', onLetGo)
  if(eventDraggWindows){
    let dragWindows = eventDraggWindows.target.closest(".window");
    if(dragWindows){
      dragWindows.classList.remove("dragging");
    }
    eventDraggWindows = null;
  }
}

function onGrab() {
	document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', onLetGo)
}


draggableWindows.forEach(elem => {
  elem.addEventListener("mousedown", e => setActiveWindow(elem));
  elem.addEventListener("mousedown", onGrab);
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






let toggleSpotlightButtons = root.querySelectorAll("[toggle-spotlight]");
let spotlightContainer = root.querySelector(".spotlight-container");
let spotlight = spotlightContainer.querySelector(".spotlight");

spotlight.addEventListener("click" , e => e.stopPropagation());

toggleSpotlightButtons.forEach(toggleSpotlight=> {
  toggleSpotlight.addEventListener("click", (e) => {
    let isHidden = spotlightContainer.classList.contains("hide");
    if (isHidden) {
      spotlightContainer.classList.remove("hide");
      toggleSpotlight.classList.remove("active");
    } else {
      spotlightContainer.classList.add("hide");
      toggleSpotlight.classList.add("active");
    }
  });
});











let isMenuActive = false;
let toggleMenuActive = function (dropdownButton, e) {
  isMenuActive = !isMenuActive;
  if(isMenuActive){
    showMenu(dropdownButton, e);
  }else{
    hideMenu(dropdownButton, e);
  }
}

let showMenu = function (dropdownButton, e) {
  if(isMenuActive){

    let dropdown = dropdownButton.querySelector(".dropdown");

    dropdownButtons.forEach(d => d != dropdownButton ? hideMenu(d) : null );

    if (dropdown.classList.contains("hide")) {
      dropdown.classList.remove("hide");
      dropdownButton.classList.add("active");
    }
  }
};

let hideMenu = function (dropdownButton, e) {
    let dropdown = dropdownButton.querySelector(".dropdown");
    if (!dropdown.classList.contains("hide")) {
      dropdown.classList.add("hide");
      dropdownButton.classList.remove("active");
    }
};

let dropdownButtons = root.querySelectorAll("[has-dropdown]");
dropdownButtons.forEach((ddb) => {
  ddb.addEventListener("click", (e) => toggleMenuActive(ddb, e));
  ddb.addEventListener("mouseover", (e) => showMenu(ddb, e));
});









let toggleMaximizeWindow = root.querySelectorAll("[maximize-window]");

toggleMaximizeWindow.forEach(btn => {
  let elemWindow = btn.closest(".window");
  if(elemWindow){
    btn.addEventListener("click", (e) => {
      elemWindow.classList.toggle("maximized");
    })
  }
})




let minimizeWindowButtons = root.querySelectorAll("[minimize-window]");

minimizeWindowButtons.forEach(btn => {
  let elemWindow = btn.closest(".window");
  if(elemWindow){
    btn.addEventListener("click", (e) => {
      elemWindow.classList.toggle("minimized");
    })
  }
})

let dropTops= root.querySelectorAll(".drop-top");

dropTops.forEach(btn => {
  let elemWindow = btn.closest(".window");
  if(elemWindow){
    btn.addEventListener("click", (e) => {
      elemWindow.classList.toggle("minimized");
    })
  }
})




let closeWindowButtons = root.querySelectorAll("[close-window]");

closeWindowButtons.forEach(btn => {
  let elemWindow = btn.closest(".window");
  if(elemWindow){
    btn.addEventListener("click", (e) => {
      elemWindow.classList.add("closed");
    })
  }
})


let openWindowButtons = root.querySelectorAll("[open]");

openWindowButtons.forEach(btn => {
  let elemWindow = root.querySelector(btn.getAttribute("open"));
  if(elemWindow){
    btn.addEventListener("click", (e) => {
      if(elemWindow.classList.contains("closed")){
      elemWindow.classList.remove("closed");
      }else{
        elemWindow.classList.toggle("minimized");
      }

      setActiveWindow(elemWindow);
    })
  }
})


let windowTabs = root.querySelectorAll(".window-tabs");

windowTabs.forEach(windowTab => {
    let tabs = windowTab.querySelectorAll(".tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
      })
    })
})



