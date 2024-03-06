"use strict";

// update the window each time it is opened
updateWindowAccordingToOrientation(false);
// These event listeners update the window either before printing or when orientation changes.
// I have to do this because I change some elements from a script,
// and as a result they are not automatically updated with accordance to CSS @display rules
// when orientation changes.
window.matchMedia("print").addListener(()=> {
  updateWindowAccordingToOrientation(false);
});
window.matchMedia("(orientation: landscape)").addListener(()=> {
  updateWindowAccordingToOrientation(false);
});
window.matchMedia("(orientation: portrait)").addListener(()=> {
  updateWindowAccordingToOrientation(false);
});

function toggleNavigationMenu() {
  updateWindowAccordingToOrientation(true);
  const siteNavigationMenuToggle = window.document.getElementById("site-navigation-menu-toggle");
  siteNavigationMenuToggle.blur();
}

/**
 * Modifies DOM so that the current state of the window with regard to site-navigation toggled
 * on/off is rendered properly.
 *
 * @toggleMenu Works only in landscape orientation.
 * When true, changes the current state to the opposite.
 *
 * Landscape orientation.
 * Either "closes" the site-navigation by hiding it and moving the toolbar and the right-side-area
 * to the left, or "opens" it by doing the opposite. The state is saved to window.sessionStorage to
 * be preserved if the window is reloaded.
 *
 * Portrait orientation.
 * The state is not saved to window.sessionStorage because I want it to be off by default
 * and as soon as an element from the menu is clicked.
 */
function updateWindowAccordingToOrientation(toggleMenu) {
  const siteNavigation = window.document.getElementById("site-navigation");
  if (window.matchMedia("(orientation: landscape)").matches) {
    const rightSideArea = window.document.getElementById("right-side-area");
    const toolbar = window.document.getElementById("toolbar");
    const siteNavigationOpenedKey = "siteNavigationOpened";
    const siteNavigationOpened = toBool(window.sessionStorage.getItem(siteNavigationOpenedKey), true);
    const newSiteNavigationOpened = toggleMenu
        ? !siteNavigationOpened
        : siteNavigationOpened;
    if (newSiteNavigationOpened) {
      window.sessionStorage.setItem(siteNavigationOpenedKey, true);
      siteNavigation.style.display = displayOrNoneIfMediaPrint("block");
      // Writing an empty string results in CSS values being used,
      // I have no idea if this is a behaviour I can rely on.
      rightSideArea.style.marginLeft = "";
      toolbar.style.marginLeft = "";
    } else {
      window.sessionStorage.setItem(siteNavigationOpenedKey, false);
      siteNavigation.style.display = "none";
      rightSideArea.style.marginLeft = "0em";
      toolbar.style.marginLeft = "0em";
    }
    const siteNavigationMenu = window.document.getElementById("site-navigation-portrait-menu");
    // we modify its displayability via script, thus we have to hide it via script also
    siteNavigationMenu.style.display = "none";
  } else {
    // portrait
    const siteNavigationMenu = window.document.getElementById("site-navigation-portrait-menu");
    const siteNavigationMenuVisible = toggleMenu
        ? siteNavigationMenu.style.display === "none"
            || siteNavigationMenu.style.display === ""
            || siteNavigationMenu.style.display === null
        : false;
    siteNavigation.style.display = displayOrNoneIfMediaPrint("block");
    if (siteNavigationMenuVisible) {
      siteNavigationMenu.style.display = displayOrNoneIfMediaPrint("block");
    } else {
      siteNavigationMenu.style.display = "none";
    }
  }
}

function displayOrNoneIfMediaPrint(display) {
  if (window.matchMedia("print").matches) {
    return "none";
  } else {
    return display;
  }
}
