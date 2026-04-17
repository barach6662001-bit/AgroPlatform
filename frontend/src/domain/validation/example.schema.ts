import { z } from 'zod/v3'

export const exampleSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'manager', 'operator']),
  notify: z.boolean().default(false),
})

export type ExampleInput = z.infer<typeof exampleSchema>
