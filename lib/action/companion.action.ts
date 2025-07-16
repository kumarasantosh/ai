"use server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select("*");

  if (error) {
    throw new Error(`Error creating companion: ${error.message}`);
  }

  return data[0];
};

export const getallcompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const supabase = createSupabaseClient();

  let query = supabase.from("companions").select("*");

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
  const supabase = createSupabaseClient();
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
  const { userId, has } = await auth();
  const supabase = createSupabaseClient();
  let limit = 0;
  if (has({ plan: "pro" })) {
    return true;
  } else if (has({ feature: "limited_companions" })) {
    limit = 3;
  } else if (has({ feature: "10_companion_limit" })) {
    limit = 10;
  }
  const { data, error } = await supabase
    .from("companions")
    .select("id", { count: "exact" })
    .eq("author", userId);
  if (error) {
    throw new Error(`Error fetching companions: ${error.message}`);
  }
  const companionCount = data.length;
  if (companionCount < limit) {
    return true;
  }
  if (companionCount >= limit) {
    return false;
  }
};
export const CoursePermission = async (id) => {
  const { has } = await auth();
  const supabase = createSupabaseClient();

  let CourseAccess =
    has({ plan: "pro" }) ||
    has({ plan: "core" }) ||
    has({ feature: "ai_teaching_assistant" });
  const { data } = await supabase
    .from("companions")
    .select("id", { count: "exact" })
    .eq("id", id);
  if (data[0].id === "b04a7e47-f41d-43e4-9c88-3ffe9d496e20") {
    CourseAccess = true;
  }

  return CourseAccess;
};

export const UserPermisson = async () => {
  const { has } = await auth();

  const CourseAccess =
    has({ plan: "pro" }) ||
    has({ plan: "core" }) ||
    has({ feature: "ai_teaching_assistant" });

  return CourseAccess;
};
