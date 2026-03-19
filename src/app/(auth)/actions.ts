"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function errorRedirect(path: string, message: string) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("error", message);
  redirect(`${url.pathname}?${url.searchParams.toString()}`);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!email || !password || !fullName || !city) {
    errorRedirect("/register", "Compila tutti i campi.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        city,
      },
    },
  });

  if (error) {
    errorRedirect("/register", error.message);
  }

  redirect("/feed");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    errorRedirect("/login", "Inserisci email e password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    errorRedirect("/login", error.message);
  }

  // After successful login, redirect server-side to the protected feed.
  redirect("/feed");
}

