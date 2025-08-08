"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
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
    .upsert({
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
      .upsert({
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
      const { error: unitError } = await supabase.from("units").upsert(units);
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
  const user = await currentUser();
  if (user?.publicMetadata?.role === "admin") {
    return true;
  }
  return false;
};
export const CoursePermission = async (id: string): Promise<boolean> => {
  const supabase = createSupabaseServerClient();
  const { userId } = await auth();
  const user = await currentUser();

  if (
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "all_courses"
  ) {
    return true;
  }

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

  const { data: purchaseData, error: purchaseError } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("companion_id", id)
    .maybeSingle();

  const expiry = user?.publicMetadata?.freetrailend
    ? new Date(user?.publicMetadata?.freetrailend as string)
    : null;

  if (expiry && expiry > new Date()) {
    console.log(expiry.toISOString());
    return true;
  }
  if (expiry && expiry < new Date()) {
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

// Get existing summaries
export const getUnitSummaries = async () => {
  const supabase = createSupabaseServerClient();
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("unit_summary")
    .select("*, companion:companion_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase Error: ${error.message}`);
  }

  return data;
};

export const createUnitSummary = async (summaryData) => {
  const supabase = createSupabaseServerClient();
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("unit_summary")
    .insert({
      unit_id: summaryData.unitId,
      summary: summaryData.summaryContent,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create summary: ${error.message}`);
  }

  return data;
};

export const updateUnitSummary = async (
  unitId: string,
  summaryContent: string
) => {
  const supabase = createSupabaseServerClient();
  const { userId, sessionClaims } = await auth();

  if (!userId || sessionClaims?.metadata?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can update summaries");
  }

  const { data, error } = await supabase
    .from("unit_summary")
    .update({
      summary: summaryContent,
      updated_at: new Date().toISOString(), // Optional: timestamp update
    })
    .eq("unit_id", unitId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update summary: ${error.message}`);
  }

  return data;
};

// Upsert (insert or update) unit summary
export const upsertUnitSummary = async (summaryData) => {
  const supabase = createSupabaseServerClient();
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("unit_summary")
    .upsert(
      {
        unit_id: summaryData.unitId,
        summary: summaryData.summaryContent,
        original: summaryData.originalContent,
      },
      {
        onConflict: "unit_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save summary: ${error.message}`);
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
export const updateCourseWithSectionsAndUnits = async (
  formData: z.infer<typeof courseFormSchema>
) => {
  const supabase = createSupabaseServerClient();

  if (!formData.id) throw new Error("Missing course ID for update");

  // 1. Update course
  const { error: courseError } = await supabase
    .from("companions")
    .update({
      name: formData.name,
      subject: formData.subject,
      topic: formData.topic,
      style: formData.style,
      voice: formData.voice,
      duration: formData.duration,
      teacher: formData.teacher,
      author: formData.author,
      price: formData.price,
    })
    .eq("id", formData.id);

  if (courseError) {
    throw new Error("Error updating course: " + courseError.message);
  }

  // 2. Get existing sections and units to compare
  const { data: existingSections, error: fetchError } = await supabase
    .from("sections")
    .select(
      `
      id,
      units (id)
    `
    )
    .eq("companion_id", formData.id);

  if (fetchError) {
    throw new Error("Error fetching existing sections: " + fetchError.message);
  }

  // Track which sections and units should be kept
  const keptSectionIds = new Set<string>();
  const keptUnitIds = new Set<string>();

  // 3. Update or insert each section
  for (const section of formData.sections ?? []) {
    let sectionId = section.id;

    if (sectionId) {
      // Update existing section
      keptSectionIds.add(sectionId);

      const { error: sectionError } = await supabase
        .from("sections")
        .update({
          title: section.title,
          description: section.description,
        })
        .eq("id", sectionId);

      if (sectionError)
        throw new Error("Error updating section: " + sectionError.message);
    } else {
      // Insert new section
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .insert({
          title: section.title,
          description: section.description,
          companion_id: formData.id,
        })
        .select()
        .single();

      if (sectionError || !sectionData)
        throw new Error("Error inserting section");

      sectionId = sectionData.id;
      keptSectionIds.add(sectionId);
    }

    // 4. Update or insert units for this section
    for (const unit of section.units ?? []) {
      if (unit.id) {
        // Update existing unit
        keptUnitIds.add(unit.id);

        const { error: unitError } = await supabase
          .from("units")
          .update({
            title: unit.title,
            content: unit.content,
            prompt: unit.prompt,
          })
          .eq("id", unit.id);

        if (unitError)
          throw new Error("Error updating unit: " + unitError.message);
      } else {
        // Insert new unit
        const { data: unitData, error: unitError } = await supabase
          .from("units")
          .insert({
            section_id: sectionId,
            title: unit.title,
            content: unit.content,
            prompt: unit.prompt,
          })
          .select()
          .single();

        if (unitError || !unitData)
          throw new Error("Error inserting unit: " + unitError.message);

        keptUnitIds.add(unitData.id);
      }
    }
  }

  // 5. Delete units that are no longer in the form
  const allExistingUnitIds =
    existingSections?.flatMap(
      (section) => section.units?.map((unit) => unit.id) || []
    ) || [];

  const unitIdsToDelete = allExistingUnitIds.filter(
    (id) => !keptUnitIds.has(id)
  );

  if (unitIdsToDelete.length > 0) {
    const { error: deleteUnitsError } = await supabase
      .from("units")
      .delete()
      .in("id", unitIdsToDelete);

    if (deleteUnitsError) {
      throw new Error("Error deleting units: " + deleteUnitsError.message);
    }
  }

  // 6. Delete sections that are no longer in the form
  const existingSectionIds =
    existingSections?.map((section) => section.id) || [];
  const sectionIdsToDelete = existingSectionIds.filter(
    (id) => !keptSectionIds.has(id)
  );

  if (sectionIdsToDelete.length > 0) {
    const { error: deleteSectionsError } = await supabase
      .from("sections")
      .delete()
      .in("id", sectionIdsToDelete);

    if (deleteSectionsError) {
      throw new Error(
        "Error deleting sections: " + deleteSectionsError.message
      );
    }
  }

  return { success: true };
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

export const getUnitSummary = async (unitId: string) => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("unit_summary")
    .select("*")
    .eq("unit_id", unitId);
  if (error) {
    throw new Error(`Error fetching units: ${error.message}`);
  }

  return data;
};
export const deleteCompanion = async (companionId: string) => {
  const supabase = createSupabaseServerClient();
  const { userId } = await auth();
  const user = await currentUser();

  if (user?.publicMetadata?.role !== "admin") {
    throw new Error("Not Authorized");
  }
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("companions")
    .delete()
    .eq("id", companionId);

  if (error) {
    throw new Error(`Failed to delete companion: ${error.message}`);
  }

  return { success: true };
};
