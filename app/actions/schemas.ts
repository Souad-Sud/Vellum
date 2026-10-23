
import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters."),
  username: z
    .string()
    .trim()
    .min(6, "Username must be at least 6 characters."),
  image_url_profile: z.string().nullable().optional(),
  address: z.string().trim().min(1, "Address is required."),
  zip_code: z.string().trim().min(1, "Zip code is required."),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional(),
  date_of_birth: z.iso.date("Enter a valid date of birth."),
  role: z.enum(["seller", "buyer"]),
  city: z.string().trim().min(1, "City is required."),
  phone_number: z
    .string()
    .trim()
    .min(5, "Enter a valid phone number."),
});
