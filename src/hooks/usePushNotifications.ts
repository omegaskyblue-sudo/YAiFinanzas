import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  if (!Device.isDevice) {
    console.log("Push notifications: must use physical device");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("Push notifications: permission not granted");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({});
  return tokenData.data;
}

async function savePushToken(token: string) {
  const user = supabase.auth.getSession();
  const { data: session } = await user;
  if (!session?.session?.user) return;

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: session.session.user.id,
      token,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.warn("Failed to save push token:", error.message);
  }
}

export function usePushNotifications() {
  const session = useAuthStore((s) => s.session);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    if (!session || Platform.OS === "web") return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        savePushToken(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {});

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "transaction" && data?.id) {
          router.push(`/(tabs)/transactions/${data.id}`);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [session]);
}
