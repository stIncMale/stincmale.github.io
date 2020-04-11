"use strict";

updateSiteNavigation(false);

scrollWindowToAnchor();//this call scrolls the window when a user enters a page with a hash-URL
window.addEventListener('click', event => {
  if (notNullOrUndefined(event.toElement) && notNullOrUndefined(event.toElement.hash)) {//this event listener scrolls the window when a user clicks a hash-link
    scrollWindowToAnchor();
  }
});

/**
 * Modifies DOM so that the current state of the site-navigation is rendered properly.
 *
 * @toggle When true, changes the current state to the opposite.
 * Either "closes" the site-navigation by hiding it amd moving the toolbar and the right-side-area to the left,
 * or "opens" it by doing the opposite. The state is saved to window.sessionStorage to be preserved if the window is reloaded.
 */
function updateSiteNavigation(toggle) {
  const siteNavigation = document.getElementById("site-navigation");
  const rightSideArea = document.getElementById("right-side-area");
  const toolbar = document.getElementById("toolbar");
  const siteNavigationVisibleKey = "siteNavigationVisible";
  const siteNavigationVisible = toBool(window.sessionStorage.getItem(siteNavigationVisibleKey), true);
  const siteNavigationWidthKey = "siteNavigationWidth";
  let siteNavigationWidth = window.sessionStorage.getItem(siteNavigationWidthKey);
  if (siteNavigationWidth === null) {
    if (!siteNavigationVisible) {
      throw "Expected siteNavigationVisible === true";
    }
    siteNavigationWidth = siteNavigation.style.width;
    window.sessionStorage.setItem(siteNavigationWidthKey, siteNavigationWidth);
  }
  let newSiteNavigationVisible = toggle ? !siteNavigationVisible : siteNavigationVisible;
  if (newSiteNavigationVisible) {
    window.sessionStorage.setItem(siteNavigationVisibleKey, true);
    siteNavigation.style.display = "block";
    rightSideArea.style.marginLeft = siteNavigationWidth;
    toolbar.style.marginLeft = siteNavigationWidth;
  } else {
    window.sessionStorage.setItem(siteNavigationVisibleKey, false);
    siteNavigation.style.display = "none";
    rightSideArea.style.marginLeft = "0em";
    toolbar.style.marginLeft = "0em";
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