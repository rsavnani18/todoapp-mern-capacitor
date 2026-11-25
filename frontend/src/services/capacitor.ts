import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';

const isNative = () => Capacitor.isNativePlatform();

// Safe positive 32-bit integer hash from MongoDB ObjectId (prevents negative ID bug)
function objectIdToNotificationId(objectId: string, prefix = 1): number {
  let hash = prefix;
  for (let i = 0; i < objectId.length; i++) {
    hash = (hash * 31 + objectId.charCodeAt(i)) & 0x7fffffff;
  }
  return hash === 0 ? prefix : hash;
}

export const nativeHaptics = {
  light: async () => {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  },
  medium: async () => {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
  },
  success: async () => {
    if (!isNative()) return;
    await Haptics.notification({ type: NotificationType.Success }).catch(
      () => {}
    );
  },
};

export const nativeStatusBar = {
  syncTheme: async (isDark: boolean) => {
    if (!isNative()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light,
      });
    } catch {
      // Ignore on unsupported devices
    }
  },
};

export const nativeNotifications = {
  scheduleReminder: async (params: {
    id: string;
    title: string;
    body: string;
    targetDateIso?: string;
    kind: 'todo' | 'note';
  }) => {
    if (!isNative() || !params.targetDateIso) return;

    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }

      const notifId = objectIdToNotificationId(
        params.id,
        params.kind === 'todo' ? 1 : 2
      );

      // Cancel existing alarm for this item before rescheduling
      await LocalNotifications.cancel({
        notifications: [{ id: notifId }],
      }).catch(() => {});

      const targetMs = new Date(params.targetDateIso).getTime();
      const nowMs = Date.now();
      if (Number.isNaN(targetMs) || targetMs <= nowMs) return;

      // Bug Fix: If due date is less than 15 mins away, trigger 1 min before due date instead of in the past
      const fifteenMins = 15 * 60 * 1000;
      const fireAtMs =
        targetMs - nowMs > fifteenMins
          ? targetMs - fifteenMins
          : Math.max(nowMs + 5000, targetMs - 60 * 1000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: params.title,
            body: params.body,
            schedule: { at: new Date(fireAtMs), allowWhileIdle: true },
          },
        ],
      });
    } catch {
      // Fail silently if exact alarms restricted
    }
  },

  cancelReminder: async (id: string, kind: 'todo' | 'note') => {
    if (!isNative()) return;
    const notifId = objectIdToNotificationId(id, kind === 'todo' ? 1 : 2);
    await LocalNotifications.cancel({
      notifications: [{ id: notifId }],
    }).catch(() => {});
  },
};
