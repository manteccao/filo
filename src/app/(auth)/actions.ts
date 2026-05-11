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
  if (fullName.length > 100) {
    errorRedirect("/register", "Il nome non può superare i 100 caratteri.");
  }
  if (city.length > 100) {
    errorRedirect("/register", "La città non può superare i 100 caratteri.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
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
    // Map auth errors to user-friendly messages without leaking internals
    const msg =
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already exists") ||
      error.message.toLowerCase().includes("duplicate")
        ? "Email già registrata. Accedi o usa un'altra email."
        : "Registrazione non riuscita. Riprova o contatta il supporto.";
    errorRedirect("/register", msg);
  }

  // Best-effort profile creation. If email confirmation is enabled,
  // `data.user` can be null here until the user verifies.
  if (data.user?.id) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      city,
    });

    // Ignore duplicates (e.g., if a trigger already created it)
    if (profileError && profileError.code !== "23505") {
      errorRedirect("/register", "Errore durante la registrazione. Riprova.");
    }
  }

  redirect("/onboarding");
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
    errorRedirect("/login", "Credenziali non valide. Riprova.");
  }

  // After successful login, redirect server-side to the protected feed.
  redirect("/feed");
}

