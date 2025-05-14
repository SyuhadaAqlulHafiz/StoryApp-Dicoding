import HomePage from '../pages/home/home-view.js';
import RegisterPage from '../pages/auth/register/regiter-view.js';
import LoginPage from '../pages/auth/login/login-view.js';
import DetailPage from '../pages/detail/detail-view.js';
import AddNewStoryPage from '../pages/add/add-view.js';
import BookmarkPage from '../pages/bookmark/bookmark-view.js';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth.js';

export const routes = {
  // UnAuthentification
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),

  // Authentification
  '/': ()=> checkAuthenticatedRoute(new HomePage()),
  '/add': () => checkAuthenticatedRoute(new AddNewStoryPage()),
  '/story/:id': () => checkAuthenticatedRoute(new DetailPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
};
