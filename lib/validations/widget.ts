import { z } from "zod";

// Color theme validation
export const colorThemeSchema = z.enum(['blue', 'violet', 'green', 'red']);

// Widget creation/update schema
export const widgetFormSchema = z.object({
  name: z.string()
    .min(1, "Widget name is required")
    .max(50, "Widget name must be 50 characters or less")
    .trim(),
  compact: z.boolean(),
  colorTheme: colorThemeSchema,
  showProfile: z.boolean(),
  faceitUsername: z.string()
    .min(1, "Faceit username is required")
    .max(30, "Faceit username must be 30 characters or less")
    .trim()
    .optional(),
});

// Widget creation schema (includes type)
export const createWidgetSchema = widgetFormSchema.extend({
  type: z.literal('faceit-stats'),
});

// Widget update schema (all fields optional except what's being updated)
export const updateWidgetSchema = widgetFormSchema.partial();

// Widget URL parameters schema
export const widgetUrlParamsSchema = z.object({
  userId: z.string()
    .min(1, "User ID is required")
    .optional(),
  compact: z.string()
    .default('false')
    .transform((val) => val === 'true'),
  theme: colorThemeSchema.default('blue'),
  showProfile: z.string()
    .default('true')
    .transform((val) => val !== 'false'),
});

// Types derived from schemas
export type WidgetFormData = z.infer<typeof widgetFormSchema>;
export type CreateWidgetData = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetData = z.infer<typeof updateWidgetSchema>;
export type WidgetUrlParams = z.infer<typeof widgetUrlParamsSchema>; 