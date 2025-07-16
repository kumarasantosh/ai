"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { createCompanion } from "@/lib/action/companion.action";
import { redirect } from "next/navigation";
import { generateRandomPastelColor } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Companion is required",
  }),
  subject: z.string().min(1, {
    message: "subject is required",
  }),
  topic: z.string().min(1, {
    message: "message is required",
  }),
  voice: z.string().min(1, {
    message: "voice is required",
  }),
  style: z.string().min(1, {
    message: "style is required",
  }),
  duration: z.coerce.number().min(1, {
    message: "duration is required",
  }),
});

const CompanionForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      topic: "",
      voice: "",
      style: "",
      duration: 15,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const companionData = { ...values, color: generateRandomPastelColor() };
    const companion = await createCompanion(companionData);
    if (companion) {
      redirect(`/companions/${companion.id}`);
    } else {
      console.log("Error creating companion");
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          <Button type="submit" className="w-full cursor-pointer">
            Upload
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CompanionForm;
