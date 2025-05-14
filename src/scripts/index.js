import '../styles/styles.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';
import Camera from './utils/camera.js';
import App from './pages/app.js';
import { registerServiceWorker } from './utils/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  app.renderPage();
  
  registerServiceWorker();
  
  window.addEventListener('hashchange', async() => {
    await app.renderPage();

    Camera.stopAllStreams();
  });
});
