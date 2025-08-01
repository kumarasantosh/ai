"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus } from "lucide-react";
import SectionForm from "./Sectionform";
import {
  createCourseWithSectionsAndUnits,
  updateCourseWithSectionsAndUnits,
} from "@/lib/action/companion.action";

// --- SCHEMA ---
const unitSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Unit title required"),
  content: z.string().optional(),
  prompt: z.string().optional(),
});

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Section title required"),
  description: z.string().optional(),
  units: z.array(unitSchema).min(1, "At least one unit is required"),
});

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Course name is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  voice: z.string().min(1, "Voice is required"),
  style: z.string().min(1, "Style is required"),
  duration: z.coerce.number().min(1, "Duration is required"),
  price: z.coerce.number().min(0, "Price is required"),
  teacher: z.string().optional(),
  author: z.string().optional(),
  sections: z.array(sectionSchema).min(1, "At least one section is required"),
});

export type FormSchema = z.infer<typeof formSchema>;

interface FullCourseFormProps {
  defaultValues?: Partial<FormSchema>;
  mode?: "create" | "update";
}

export default function UpdateForm({
  defaultValues,
  mode = "create",
}: FullCourseFormProps) {
  const router = useRouter();

  const methods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      price: 0,
      duration: 15,
      teacher: "",
      author: "",
      sections: [
        {
          title: "",
          description: "",
          units: [{ title: "", content: "", prompt: "" }],
        },
      ],
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = methods;

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  // Fix 1: Better handling of defaultValues with proper structure
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      // Ensure sections and units have proper structure
      const processedValues = {
        ...defaultValues,
        sections: defaultValues.sections?.map((section) => ({
          ...section,
          units:
            section.units?.length > 0
              ? section.units
              : [{ title: "", content: "", prompt: "" }],
        })) || [
          {
            title: "",
            description: "",
            units: [{ title: "", content: "", prompt: "" }],
          },
        ],
      };

      console.log("Resetting form with processed values:", processedValues);
      reset(processedValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: FormSchema) => {
    try {
      console.log("Submitting form data:", data);
      console.log("Mode:", mode);

      // Fix 2: Ensure ID is present for update mode
      if (mode === "update") {
        if (!data.id && !defaultValues?.id) {
          throw new Error("Course ID is required for update operation");
        }

        // Make sure ID is included in the data
        const updateData = {
          ...data,
          id: data.id || defaultValues?.id,
        };

        console.log("Update data with ID:", updateData);
        const result = await updateCourseWithSectionsAndUnits(updateData);
        console.log("Update result:", result);
      } else {
        const result = await createCourseWithSectionsAndUnits(data);
        console.log("Create result:", result);
      }

      router.push("/companions");
    } catch (err) {
      console.error("Submission error:", err);
      // Fix 3: Add user feedback for errors
      alert(
        `Error ${mode === "update" ? "updating" : "creating"} course: ${
          err.message || err
        }`
      );
    }
  };

  // Fix 4: Add validation error display
  const renderFieldError = (fieldName: string) => {
    const error = errors[fieldName];
    if (error) {
      return <span className="text-red-500 text-sm">{error.message}</span>;
    }
    return null;
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          {mode === "update" ? "Update Course" : "Create New Course"}
        </h1>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
            <p>
              <strong>Mode:</strong> {mode}
            </p>
            <p>
              <strong>Course ID:</strong> {defaultValues?.id || "Not set"}
            </p>
            <p>
              <strong>Has Default Values:</strong>{" "}
              {defaultValues ? "Yes" : "No"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Fix 5: Include hidden ID field for updates */}
          {mode === "update" && (defaultValues?.id || methods.watch("id")) && (
            <input
              type="hidden"
              {...register("id")}
              value={defaultValues?.id || methods.watch("id")}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input {...register("name")} placeholder="Course Name" />
              {renderFieldError("name")}
            </div>

            <div>
              <Input {...register("subject")} placeholder="Subject" />
              {renderFieldError("subject")}
            </div>

            <div>
              <Input {...register("topic")} placeholder="Topic" />
              {renderFieldError("topic")}
            </div>

            <div>
              <Input {...register("voice")} placeholder="Voice" />
              {renderFieldError("voice")}
            </div>

            <div>
              <Input {...register("style")} placeholder="Style" />
              {renderFieldError("style")}
            </div>

            <div>
              <Input
                {...register("price", { valueAsNumber: true })}
                type="number"
                placeholder="Price"
              />
              {renderFieldError("price")}
            </div>

            <div>
              <Input
                {...register("duration", { valueAsNumber: true })}
                type="number"
                placeholder="Duration (mins)"
              />
              {renderFieldError("duration")}
            </div>

            <div>
              <Input {...register("teacher")} placeholder="Teacher Name" />
              {renderFieldError("teacher")}
            </div>

            <div className="md:col-span-2">
              <Input {...register("author")} placeholder="Author ID" />
              {renderFieldError("author")}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Course Sections</h2>
            {sectionFields.map((section, index) => (
              <SectionForm
                key={section.id || `section-${index}`}
                sectionIndex={index}
                removeSection={removeSection}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendSection({
                  title: "",
                  description: "",
                  units: [{ title: "", content: "", prompt: "" }],
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>

          {errors.sections && (
            <div className="text-red-500 text-sm">
              {errors.sections.message}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "update"
                  ? "Updating..."
                  : "Creating..."
                : mode === "update"
                ? "Update Course"
                : "Create Course"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/companions")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
