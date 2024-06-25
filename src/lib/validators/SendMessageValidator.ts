import { z } from 'zod';

export const SendMessageValidator = z.object({
  fileId: z.string().min(1),
  message: z.string().min(1),
});
