import { convertBase64ToUint8Array } from "./index.js";
import  CONFIG  from '../config.js';
import {
    subcribe,
    unsubscribe,
} from "../data/api.js";
import Swal from "sweetalert2";

export function isNotificationAvailable() {
    return 'Notification' in window;
}

export function isNotificationGranted() {
    return Notification.permission === 'granted';
}

export async function requestPermission() {
    if (!isNotificationAvailable()) {
        console.error('Notification API unsupported.');
        return false;
    }

    if (isNotificationGranted()) {
        return true;
    }

    const status = await Notification.requestPermission();

    if  (status === 'denied') {
        Swal.fire({
            title: 'Gagal!',
            icon: 'error',
            text: 'Izin notifikasi ditolak.',
            showConfirmButton: false,
            timer: 1600,
        });
        return false;
    }

    if (status === 'default') {
        Swal.fire({
            title: 'Gagal!',
            icon: 'error',
            text: 'Izin notifikasi ditutup atau diabaikan.',
            showConfirmButton: false,
            timer: 1600,
        });
        return false;
    }

    return true;
}

export async function getPush() {
    const regist = await navigator.serviceWorker.getRegistration();
    return await regist.pushManager.getSubscription();
}

export async function isCurrentPushSubsciptionAvailable() {
    return !!(await getPush());
}

export function generateSubsOptions() {
    return {
        userVisibleOnly: true,
        applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    };
}

export async function subscribe() {
    if (!(await requestPermission())) {
        return;
    }

    if (await isCurrentPushSubsciptionAvailable()) {
        const message ='Sudah berlangganan push notification.';
        Swal.fire({
            title: 'Gagal!',
            icon: 'error',
            text: `${message}`,
            showConfirmButton: false,
            timer: 1600,
        });
        return;
    }

    console.log('Mulai berlangganan push notification...');

    const subsFail = 'Langganan push notification gagal diaktifkan.';
    const subsSuccess = 'Langganan push notification berhasil diaktifkan';

    let pushSubs;

    try {
        const regist = await navigator.serviceWorker.getRegistration();
        pushSubs = await regist.pushManager.subscribe(generateSubsOptions());

        const { endpoint, keys } = pushSubs.toJSON();
        const response = await subcribe({ endpoint, keys });

        if(!response.ok) {
            console.error('subscribe: response: ',response);
            Swal.fire({
                title: 'Gagal!',
                icon: 'error',
                text: `${subsFail}`,
                showConfirmButton: false,
                timer: 1600,
            });

            await pushSubs.unsubscribe();
            return;
        }
        
        Swal.fire({
            title: 'Berhasil!',
            icon: 'success',
            text: `${subsSuccess}`,
            showConfirmButton: false,
            timer: 1600,
        });
    } catch (error) {
        console.error('subscribe: error: ',error);
        Swal.fire({
            title: 'Gagal!',
            icon: 'error',
            text: `${subsFail}`,
            showConfirmButton: false,
            timer: 1600,
        });

        await pushSubs.unsubscribe();
    }
}

export async function unsubs() {
    const failUnsubs = 'Langganan push notification gagal dinonaktifkan.';
    const successUnsubs = 'Langganan push notification berhasil dinonaktifkan.';

    try {
        const push = await getPush();

        if (!push) {
            const message ='Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.';
            Swal.fire({
                title: 'Gagal!',
                icon: 'error',
                text: `${message}`,
                showConfirmButton: false,
                timer: 1600,
            });
            return;
        }

        const { endpoint, keys } = push.toJSON();
        const response = await unsubscribe({ endpoint });

        if (!response.ok) {
            Swal.fire({
                title: 'Gagal!',
                icon: 'error',
                text: `${failUnsubs}`,
                showConfirmButton: false,
                timer: 1600,
            });
            console.error('unsubscribe: response: ',response);

            return;
        }

        const unsubs = await push.unsubscribe();

        if(!unsubs) {
            Swal.fire({
                title: 'Gagal!',
                icon: 'error',
                text: `${failUnsubs}`,
                showConfirmButton: false,
                timer: 1600,
            });
            await subcribe({ endpoint, keys });

            return;
        }

        Swal.fire({
            title: 'Berhasil!',
            icon: 'success',
            text: `${successUnsubs}`,
            showConfirmButton: false,
            timer: 1600,
        });
    } catch (error) {
        Swal.fire({
            title: 'Gagal!',
            icon: 'error',
            text: `${failUnsubs}`,
            showConfirmButton: false,
            timer: 1600,
        });
        console.error('unsubscribe: error: ',error);
    }
}