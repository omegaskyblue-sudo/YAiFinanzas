import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { AppState, AppStateStatus, Platform } from "react-native";
import { initDatabase } from "@/lib/database";
import { processSyncQueue, pullRemoteData } from "@/lib/sync";
import { useAuthStore } from "@/stores/authStore";
import { useNetworkStore } from "@/stores/networkStore";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import "../global.css";

const queryClient = new QueryClient();

function DatabaseInitializer({ children }: { children: React.ReactNode }) {
  const coupleId = useAuthStore((s) => s.coupleId);
  const setOnline = useNetworkStore((s) => s.setOnline);

  useRealtimeSync();
  usePushNotifications();

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (!coupleId) return;

    pullRemoteData(coupleId);
    processSyncQueue();
  }, [coupleId]);

  useEffect(() => {
    function handleAppState(next: AppStateStatus) {
      const online = next === "active";
      setOnline(online);

      if (online && coupleId) {
        processSyncQueue();
        pullRemoteData(coupleId);
      }
    }

    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [coupleId]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <DatabaseInitializer>
        <Stack screenOptions={{ headerShown: false }} />
      </DatabaseInitializer>
    </QueryClientProvider>
  );
}
