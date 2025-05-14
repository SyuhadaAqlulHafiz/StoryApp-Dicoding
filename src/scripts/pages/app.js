import { getActiveRoute } from '../routes/url-parser.js';
import {
  generateAuthenticatedNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateMainNavigationListTemplate,
} from '../template.js';
import { 
  setupSkipToContent,
  transitionHelper,
  isServiceWorkerAvailable, 
} from '../utils';
import { getAccessToken, askLogout } from '../utils/auth';
import { routes } from '../routes/routes.js';
import {
  subscribe,
  unsubs,
  isCurrentPushSubsciptionAvailable,
} from '../utils/notification.js';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#drawerNavigation.children.namedItem('navlist');
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');

    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      askLogout();
    });
  }

  async #setupPushNotification() {
    const isLogin = !!getAccessToken();
    const navList = this.#drawerNavigation.children.namedItem('navlist');
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');

    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    const push = document.getElementById('push-notification-tools');
    const isSubs = await isCurrentPushSubsciptionAvailable();

    if (isSubs) {
      push.innerHTML = generateUnsubscribeButtonTemplate();

      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubs().finally(() => {
          this.#setupPushNotification();
        })
      });

      return;
    }

    push.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];
  
    const page = route();
  
    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });
  
    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}
