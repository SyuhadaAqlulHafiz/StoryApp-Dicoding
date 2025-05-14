import { getAccessToken } from '../utils/auth.js';
import CONFIG from '../config';

const ENDPOINTS = {
  REGIST: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_ALL: `${CONFIG.BASE_URL}/stories`,
  DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,

  SUBS: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBS: `${CONFIG.BASE_URL}/notifications/subscribe`,

  SEND_NEW_TO_ALL_USER: (id) => `${CONFIG.BASE_URL}/stories/${id}/notify-all`,
};


export async function getRegister({ name, email, password}) {
  const response = JSON.stringify({ name, email, password});

  const fetchResponse = await fetch(ENDPOINTS.REGIST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: response,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  }
}


export async function getLogin({ email, password }) {
  const response = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: response,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  }
}


export async function getAllStory() {
  const access = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.GET_ALL, {
    headers: { Authorization: `Bearer ${access}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  }
}


export async function getDetailStory(id) {
  const access = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.DETAIL(id), {
    method: 'GET',
    headers: { Authorization: `Bearer ${access}` },    
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse,
  }
}


export async function addNewStory({
  desc, 
  img, 
  lat, 
  lon
}) {
  const access = getAccessToken();

  const dataBody = new FormData();
  dataBody.set('description', desc);
  dataBody.append('photo', img);
  dataBody.set('lat', lat);
  dataBody.set('lon', lon);

  const fetchResponse = await fetch(ENDPOINTS.ADD_NEW_STORY, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access}` },
    body: dataBody,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  }
}

export async function subcribe({ 
  endpoint,
  keys: {
    p256dh,
    auth,
  }}) {
    const access = getAccessToken();
    const data = JSON.stringify({
      endpoint,
      keys: { p256dh, auth },
    });

    const fetchResponse = await fetch(ENDPOINTS.SUBS, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${access}`,
      },
      body: data,
    });
    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
    };
}

export async function unsubscribe({ endpoint }) {
  const access = getAccessToken();
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBS, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access}`,
    },
    body: data,
  });

  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  }
}