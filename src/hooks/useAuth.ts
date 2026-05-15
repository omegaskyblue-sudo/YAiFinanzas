import { useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const {
    session,
    user,
    coupleId,
    isLoading,
    setSession,
    setUser,
    setCoupleId,
    setLoading,
    reset,
  } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleSession(session: any) {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      fetchCoupleId(session.user.id);
    } else {
      setCoupleId(null);
    }
  }

  async function fetchCoupleId(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", userId)
      .single();

    setCoupleId(data?.couple_id ?? null);
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { data, error };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    reset();
    router.replace("/(auth)/login");
  }

  async function createCouple(): Promise<string | null> {
    const code = generateCode();
    const { data, error } = await supabase.rpc("create_couple", {
      invite_code: code,
    });

    if (error || !data) return null;

    const { error: profileError } = await supabase.rpc(
      "set_profile_couple_id",
      { p_couple_id: data.id },
    );

    if (profileError) return null;

    setCoupleId(data.id);
    return data.invite_code;
  }

  async function joinCouple(code: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("find_couple_by_code", {
      code,
    });

    if (error || !data) return false;

    const { error: profileError } = await supabase.rpc(
      "set_profile_couple_id",
      { p_couple_id: data.id },
    );

    if (profileError) return false;

    setCoupleId(data.id);
    return true;
  }

  return {
    session,
    user,
    coupleId,
    isLoading,
    signUp,
    signIn,
    signOut,
    createCouple,
    joinCouple,
  };
}

let codeCounter = 0;
function generateCode(): string {
  codeCounter++;
  const ts = Date.now().toString(36).slice(-4);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${ts}${rand}`.toUpperCase();
}
