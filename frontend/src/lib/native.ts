import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import type { Todo } from '../types';

const isNative = () => Capacitor.isNativePlatform();

// MongoDB ObjectId (hex string) ko deterministic 32-bit integer ID mein convert karta hai
function getNotificationId(todoId: string): number {
  let hash = 0;
  for (let i = 0; i < todoId.length; i++) {
    hash = (hash << 5) - hash + todoId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

export const native = {
  // 1. Native Edge-to-Edge Status Bar Theme Sync
  async syncStatusBar(theme: 'dark' | 'light') {
    if (!isNative()) return;
    try {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({
        style: theme === 'dark' ? Style.Dark : Style.Light,
      });
    } catch {
      // Ignore on unsupported webviews
    }
  },

  // 2. Tactile Haptic Feedback
  async hapticImpact(style: 'light' | 'medium' = 'light') {
    if (!isNative()) return;
    try {
      await Haptics.impact({
        style: style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light,
      });
    } catch {
      // Ignore
    }
  },

  async hapticSuccess() {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Ignore
    }
  },

  async hapticWarning() {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      // Ignore
    }
  },

  // 3. Schedule Native Reminder (15 mins before Due Time)
  async scheduleTaskReminder(todo: Todo) {
    if (!isNative()) return;
    const notifId = getNotificationId(todo._id);

    try {
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] });

      if (!todo.dueDate || todo.completed) return;

      const dueMs = new Date(todo.dueDate).getTime();
      const fifteenMinsMs = 15 * 60 * 1000;
      const triggerTime = new Date(dueMs - fifteenMinsMs);

      if (triggerTime.getTime() <= Date.now()) return;

      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: `⏰ Due in 15 mins: ${todo.title}`,
            body: todo.description || 'Tap to view or mark your task complete.',
            schedule: { at: triggerTime, allowWhileIdle: true },
            smallIcon: 'ic_launcher',
            extra: { todoId: todo._id },
          },
        ],
      });
    } catch (err) {
      console.warn('Notification schedule skipped:', err);
    }
  },

  async cancelTaskReminder(todoId: string) {
    if (!isNative()) return;
    try {
      const notifId = getNotificationId(todoId);
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    } catch {
      // Ignore
    }
  },
};
