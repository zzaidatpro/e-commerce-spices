"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilisateur non authentifié.");
  }

  // Concaténation pour adresse_livraison
  const numero = formData.get("numero") as string;
  const rue = formData.get("rue") as string;
  const cite = formData.get("cite") as string;
  const ville = formData.get("ville") as string;
  const codePostal = formData.get("codePostal") as string;
  const lieu = (formData.get("lieu") as "maison" | "magasin" | "depot") || "maison";
  const urlGoogleMap = formData.get("urlGoogleMap") as string;

  const adresse_concatenee = [
    numero ? `N° ${numero}` : null,
    rue,
    cite ? `Cité ${cite}` : null,
    ville,
    codePostal,
  ]
    .filter(Boolean)
    .join(", ");

  // Mise à jour profiles :
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      telephone: formData.get("telephone"),
      whatsapp: formData.get("whatsapp"),
      date_naissance: formData.get("dateNaissance") || null,
    })
    .eq("id", user.id);

  if (updateError) {
    throw new Error(`Erreur mise à jour : ${updateError.message}`);
  }
  // mise a jour adresse_livrason :
  if (adresse_concatenee.trim()) {
    const { data: existingAddress } = await supabase
      .from("adresses_livraison")
      .select("id")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingAddress) {
      const { error: addressError } = await supabase
        .from("adresses_livraison")
        .update({
          type_lieu: lieu,
          adresse_complete: adresse_concatenee,
          url_google_maps: urlGoogleMap || null,
        })
        .eq("id", existingAddress.id);

      if (addressError) {
        throw new Error(`Erreur adresse : ${addressError.message}`);
      }
    } else {
      const { error: addressError } = await supabase.from("adresses_livraison").insert({
        profile_id: user.id,
        type_lieu: lieu,
        adresse_complete: adresse_concatenee,
        url_google_maps: urlGoogleMap || null,
      });

      if (addressError) {
        throw new Error(`Erreur adresse : ${addressError.message}`);
      }
    }
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Profile mis à jour avec succès !" };
}