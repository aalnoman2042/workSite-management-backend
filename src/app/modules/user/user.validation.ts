import { z } from "zod";

export const UserValidation = {
  workerSchema: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string(),
    position: z.string(),
    nidNumber: z.string()
  }),

  siteEngineerSchema: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string(),
  }),

  chiefEngineerSchema: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string(),
  }),

  adminSchema: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string(),
  }),
};
