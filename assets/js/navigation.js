"use strict";

updateWindowAccordingToOrientation(false);//update the window each time it is opened
/*
 * These event listeners update the window either before printing or when orientation changes.
 * I have to do this because I change some elements from a script,
 * and as a result they are not automatically updated with accordance to CSS @display rules when orientation changes.
 */
window.matchMedia("print").addListener(()=> {
  updateWindowAccordingToOrientation(false);
});
window.matchMedia("(orientation: landscape)").addListener(()=> {
  updateWindowAccordingToOrientation(false);
});
window.matchMedia("(orientation: portrait)").addListener(()=> {
  updateWindowAccordingToOrientation(false);
});

scrollWindowToAnchor();//this call scrolls the window when a user enters a page with a hash-URL
window.addEventListener("click", event => {//this event listener scrolls the window when a user clicks a hash-link
  if (notNullOrUndefined(event.toElement) && notNullOrUndefined(event.toElement.hash)) {
    scrollWindowToAnchor();
  }
});

function toggleNavigationMenu() {
  updateWindowAccordingToOrientation(true);
  const siteNavigationMenuToggle = window.document.getElementById("site-navigation-menu-toggle");
  siteNavigationMenuToggle.blur();
}

/**
 * Modifies DOM so that the current state of the window with regard to site-navigation toggled on/off is rendered properly.
 *
 * @toggleMenu Works only in landscape orientation. When true, changes the current state to the opposite.
 *
 * Landscape orientation.
 * Either "closes" the site-navigation by hiding it and moving the toolbar and the right-side-area to the left,
 * or "opens" it by doing the opposite. The state is saved to window.sessionStorage to be preserved if the window is reloaded.
 * 
 * Portrait orientation.
 * The state is not saved to window.sessionStorage because I want it to be off by default and as soon as an element from the menu is clicked.
 */
function updateWindowAccordingToOrientation(toggleMenu) {
  const siteNavigation = window.document.getElementById("site-navigation");
  if (window.matchMedia("(orientation: landscape)").matches) {
    const rightSideArea = window.document.getElementById("right-side-area");
    const toolbar = window.document.getElementById("toolbar");
    const siteNavigationVisibleKey = "siteNavigationVisible";
    const siteNavigationVisible = toBool(window.sessionStorage.getItem(siteNavigationVisibleKey), true);
    const newSiteNavigationVisible = toggleMenu
        ? !siteNavigationVisible
        : siteNavigationVisible;
    if (newSiteNavigationVisible) {
      window.sessionStorage.setItem(siteNavigationVisibleKey, true);
      siteNavigation.style.display = displayOrNoneIfMediaPrint("block");
      /*
       * Writing an empty string results in CSS values being used, I have no idea if this is a behaviour I can rely on.
       */
      rightSideArea.style.marginLeft = "";
      toolbar.style.marginLeft = "";
    } else {
      window.sessionStorage.setItem(siteNavigationVisibleKey, false);
      siteNavigation.style.display = "none";
      rightSideArea.style.marginLeft = "0em";
      toolbar.style.marginLeft = "0em";
    }
    const siteNavigationMenu = window.document.getElementById("site-navigation-portrait-menu");
    siteNavigationMenu.style.display = "none";//we modify its displayability via script, thus we have to hide it via script also
  } else {//portrait
    const siteNavigationMenu = window.document.getElementById("site-navigation-portrait-menu");
    const siteNavigationMenuVisible = toggleMenu
        ? siteNavigationMenu.style.display === "none" || siteNavigationMenu.style.display === "" || siteNavigationMenu.style.display === null
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

/**
 * The toolbar hovers over the right-page-area and covers a part of it. This is fine until a user navigates to an element via hash-link,
 * and the browser scrolls the window to the minimum possible position to make that element wholly visible within the viewport.
 * So if an element if covered by the toolbar but is within the viewport, the browser decides that this is fine.
 *
 * This function scrolls the window so that the element a user jumped to appears right under the toolbar.
 * Some solutions to the problem: https://css-tricks.com/hash-tag-links-padding/, I used this one https://stackoverflow.com/a/17535094/1285873.
 *
 * Note that for some reason window.scrollTo has to be called with a timeout (even if the timeout is 0). I do not know whether this is a robust
 * solution or (more likely) a kludge that appear to do the trick at least in my experiments.
 */
function scrollWindowToAnchor() {
  window.setTimeout(() => {
    if(notNullOrUndefined(window.location.hash) && window.location.hash.length !== 0) {
      window.scrollTo(window.scrollX, window.scrollY - window.document.getElementById("toolbar").offsetHeight);
    }
  }, 0);
}
