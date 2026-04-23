// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8hX9NvKCP3iQWUAFPWFUflHMAW5bnRww",
  authDomain: "musica-7e89d.firebaseapp.com",
  projectId: "musica-7e89d",
  storageBucket: "musica-7e89d.firebasestorage.app",
  messagingSenderId: "165429222650",
  appId: "1:165429222650:web:0bff17cd1c8e26f655fd43"
};

const VAPID_KEY = "BLHW1YV-s7u3NlaBlh0bAwiyBd1Jos5vzZ3coYGMH3C0Mb1QHVZZyFhqP-XSesmHHWCU4yo7bc4XVUJuK8-6o1U";

// Convertir clave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Registrar Service Worker y suscribirse
async function initPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push no soportado');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/dj/sw.js');
    console.log('SW registrado');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permiso denegado');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
    });

    // Guardar suscripción en Firebase Firestore
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const subJson = JSON.parse(JSON.stringify(subscription));
    const id = btoa(subJson.endpoint).slice(-20);

    await setDoc(doc(db, 'subscriptions', id), {
      subscription: subJson,
      createdAt: new Date().toISOString()
    });

    console.log('Suscripción guardada ✅');
  } catch (err) {
    console.error('Error push:', err);
  }
}

initPush();
