import { z } from 'zod'

export const complaintSchema = z.object({
  category: z.enum([
    'cukur', 'aydinlatma', 'temizlik',
    'trafik_isareti', 'kaldırim', 'park_bahce', 'su_kanal', 'diger'
  ]),
  title: z.string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z.string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address_text: z.string().optional(),
  district: z.string().optional(),
})

export type ComplaintFormData = z.infer<typeof complaintSchema>
