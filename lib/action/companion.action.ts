"use server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient, createSupabaseServerClient } from "../supabase";
import { courseFormSchema } from "../schema";
import { z } from "zod";
import { generateRandomPastelColor } from "../utils";

export const createCourseWithSectionsAndUnits = async (
  formData: z.infer<typeof courseFormSchema>
) => {
  const supabase = createSupabaseServerClient();

  // 1. Create the course
  const { data: courseData, error: courseError } = await supabase
    .from("companions")
    .insert({
      name: formData.name,
      subject: formData.subject,
      topic: formData.topic,
      style: formData.style,
      voice: formData.voice,
      duration: formData.duration,
      teacher: formData.teacher,
      author: formData.author,
      color: generateRandomPastelColor(),
      price: formData.price,
    })
    .select()
    .single();

  if (courseError || !courseData) {
    throw new Error("Error creating course: " + courseError?.message);
  }

  const courseId = courseData.id;

  // 2. For each section, insert with course_id
  for (const section of formData.sections ?? []) {
    const { data: sectionData, error: sectionError } = await supabase
      .from("sections")
      .insert({
        title: section.title,
        description: section.description,
        companion_id: courseId,
      })
      .select()
      .single();

    if (sectionError || !sectionData) {
      throw new Error("Error creating section: " + sectionError?.message);
    }

    const sectionId = sectionData.id;

    // 3. Insert units if present
    const units = section.units?.map((unit) => ({
      section_id: sectionId,
      title: unit.title,
      content: unit.content,
      prompt: unit.prompt,
    }));

    if (units && units.length > 0) {
      const { error: unitError } = await supabase.from("units").insert(units);
      if (unitError) {
        throw new Error("Error creating units: " + unitError.message);
      }
    }
  }

  return courseData;
};

export const getallcompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const supabase = createSupabaseClient();

  let query = supabase.from("companions").select("*");

  query = query.order("created_at", { ascending: false });
  if (subject && topic) {
    query = query.ilike("subject", `%${subject}%`).ilike("topic", `%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.ilike("topic", `%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching companions: ${error.message}`);
  }

  return data;
};
export const getCompanion = async (id: string) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching companion: ${error.message}`);
  }

  return data;
};
export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const getRecentSessions = async () => {
  const supabase = createSupabaseClient();
  const { userId } = await auth();
  const { data, error } = await supabase
    .from("session_history")
    .select("companion:companion_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) {
    throw new Error(`${error.message}`);
  }
  return data.map(({ companion }) => companion);
};

export const getUserSession = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("session_history")
    .select("companion:companion_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) {
    throw new Error(`${error.message}`);
  }
  return data.map(({ companion }) => companion);
};

export const newCampanionPermission = async () => {
  return true;
};
export const CoursePermission = async (id: string): Promise<boolean> => {
  const supabase = createSupabaseServerClient();
  const { userId } = await auth();

  if (!userId) return false;

  const { data: companionData, error: companionError } = await supabase
    .from("companions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (companionError || !companionData) {
    console.log("Error fetching companion:", companionError);
    return false;
  }

  if (companionData.is_free) return true;

  // 2. Otherwise, check if the user purchased it
  const { data: purchaseData, error: purchaseError } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("companion_id", id)
    .maybeSingle();
  if (!purchaseData) {
    return false;
  }
  const expiry = purchaseData.access_expires_at
    ? new Date(purchaseData.access_expires_at)
    : null;

  if (expiry && expiry < purchaseData.purchased_at) {
    console.log("Purchase expired on", expiry.toISOString());
    return false;
  }

  if (purchaseError || !purchaseData) {
    console.log("No purchase found or error:", purchaseError);
    return false;
  }

  return true;
};
export const getSectionsByCompanionId = async (companionId: string) => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("companion_id", companionId);

  if (error) {
    throw new Error(`Error fetching sections: ${error.message}`);
  }

  return data;
};

export const getRecentPurchase = async () => {
  const supabase = createSupabaseServerClient();
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("purchases")
    .select("*, companion:companion_id(*)") // full purchase row + joined companion
    .eq("user_id", userId)
    .order("purchased_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase Error: ${error.message}`);
  }

  return data; // full purchase row, with companion embedded
};

export const getUnit = async (id: string) => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.from("units").select("*").eq("id", id);

  if (error) {
    throw new Error(`Error fetching sections: ${error.message}`);
  }

  return data;
};

export const getUnitsBySectionId = async (sectionId: string) => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("section_id", sectionId);
  if (error) {
    throw new Error(`Error fetching units: ${error.message}`);
  }

  return data;
};
