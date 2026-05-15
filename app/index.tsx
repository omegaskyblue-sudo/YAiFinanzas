import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { session, coupleId, isLoading } = useAuth();

  if (isLoading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (!coupleId) return <Redirect href="/(onboarding)/create-couple" />;
  return <Redirect href="/(tabs)" />;
}
