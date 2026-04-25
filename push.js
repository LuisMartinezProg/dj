const NTFY_TOPIC = 'musica-luis-2026';

async function initPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    await navigator.serviceWorker.register('/dj/sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    console.log('Notificaciones activadas ✅');
  } catch (err) {
    console.error('Error:', err);
  }
}

initPush();
