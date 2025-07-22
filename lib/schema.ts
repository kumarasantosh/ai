import { z } from "zod";

export const courseFormSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  style: z.enum(["formal", "informal"]),
  voice: z.enum(["male", "female"]),
  duration: z.coerce.number().min(1, "Duration is required"),
  teacher: z.string().optional(),
  author: z.string().optional(),
  color: z.string().optional(),
  price: z.number().optional(),
  is_free: z.boolean().optional(),
});
