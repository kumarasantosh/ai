"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { createCourseWithSectionsAndUnits } from "@/lib/action/companion.action";

// 🔹 Zod Schemas
const unitSchema = z.object({
  title: z.string().min(1, "Unit title required"),
  content: z.string().optional(),
  prompt: z.string().optional(),
});

const sectionSchema = z.object({
  title: z.string().min(1, "Section title required"),
  description: z.string().optional(),
  units: z.array(unitSchema).min(1, "Add at least one unit"),
});

const formSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  subject: z.string().min(1),
  topic: z.string().min(1),
  voice: z.string().min(1),
  style: z.string().min(1),
  duration: z.coerce.number().min(1, "Duration is required"),
  sections: z.array(sectionSchema).min(1, "At least one section required"),
  price: z.string().min(1),
});

type FormSchema = z.infer<typeof formSchema>;

export default function FullCourseForm() {
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      price: "",
      style: "",
      duration: 15,
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
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  // 🔹 Form Submission
  const onSubmit = async (data: FormSchema) => {
    try {
      await createCourseWithSectionsAndUnits(data);
      router.push("/companions"); // ✅ redirect after success
    } catch (error) {
      console.error("Course creation failed", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="teacher_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter The Teacher Name"
                  {...field}
                  className="input"
                  value={field.value || ""} // Ensure it's always a controlled value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter The Lesson Name"
                  {...field}
                  className="input"
                  value={field.value || ""} // Ensure it's always a controlled value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter The Sub Name"
                  {...field}
                  className="input"
                  value={field.value || ""} // Ensure it's always a controlled value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Syllabus</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter The Syllabus Name"
                  {...field}
                  className="input"
                  value={field.value || ""} // Ensure it's always a controlled value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="voice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voice</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""} // Ensure it's always a controlled value
                >
                  <SelectTrigger className="input capitalize">
                    <SelectValue placeholder="Select Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select The Style</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""} // Ensure it's always a controlled value
                >
                  <SelectTrigger className="input capitalize">
                    <SelectValue placeholder="Select The Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input
                  placeholder="15"
                  type="number"
                  {...field}
                  className="input"
                  value={field.value || ""} // Ensure it's always a controlled value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  placeholder="Price"
                  {...field}
                  className="input"
                  value={field.value || ""} // Ensure it's always a controlled value
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 🔹 Sections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sections</h3>
          {sectionFields.map((section, secIdx) => (
            <div
              key={section.id}
              className="border rounded-xl p-4 space-y-4 bg-gray-50"
            >
              <FormField
                control={form.control}
                name={`sections.${secIdx}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`sections.${secIdx}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🔹 Units inside section */}
              <UnitFields control={form.control} secIdx={secIdx} />

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeSection(secIdx)}
              >
                Remove Section
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={() =>
              appendSection({
                title: "",
                description: "",
                units: [{ title: "", content: "", prompt: "" }],
              })
            }
            variant="outline"
          >
            + Add Section
          </Button>
        </div>

        <Button type="submit" className="w-full mt-6">
          Submit Course
        </Button>
      </form>
    </Form>
  );
}

// 🔹 Modular Unit Form Logic
function UnitFields({ control, secIdx }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${secIdx}.units`,
  });

  return (
    <div className="space-y-2">
      <h4 className="text-md font-medium">Units</h4>
      {fields.map((unit, unitIdx) => (
        <div key={unit.id} className="bg-white p-3 border rounded-md space-y-2">
          <FormField
            control={control}
            name={`sections.${secIdx}.units.${unitIdx}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`sections.${secIdx}.units.${unitIdx}.content`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`sections.${secIdx}.units.${unitIdx}.prompt`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(unitIdx)}
          >
            Remove Unit
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append({ title: "", content: "", prompt: "" })}
        variant="secondary"
        size="sm"
      >
        + Add Unit
      </Button>
    </div>
  );
}
