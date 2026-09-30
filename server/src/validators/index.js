import { z } from 'zod';

// --- AUTH SCHEMAS ---
export const sendOtpSchema = z.object({
  email: z.string().min(2, 'Please provide a valid institutional email or roll number')
});

export const verifyOtpSchema = z.object({
  email: z.string().min(2, 'Please provide a valid institutional email or roll number'),
  otp: z.union([z.string(), z.number()]).transform(val => String(val).trim()).refine(val => val.length === 6, {
    message: 'Passkey must be exactly 6 digits'
  }),
  name: z.string().max(80).optional()
});

export const loginSchema = z.object({
  email: z.string().min(2, 'Please provide a valid email or roll number'),
  password: z.string().min(1, 'Password is required').optional(),
  roleHint: z.string().optional()
});

// --- BOOKING SCHEMAS ---
export const createBookingSchema = z.object({
  restaurantId: z.coerce.number().int().positive('Valid restaurant ID is required'),
  date: z.string().min(1, 'Date is required').refine((val) => {
    const bookingDate = new Date(val);
    if (isNaN(bookingDate.getTime())) return false;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    return bookingDate >= startOfToday && bookingDate <= maxDate;
  }, {
    message: 'Booking date must be between today and the next 90 days'
  }),
  time: z.string().min(1, 'Time is required'),
  guests: z.coerce.number().int().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests per table booking'),
  specialRequest: z.string().max(250, 'Special requests cannot exceed 250 characters').optional()
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(250, 'Cancellation reason cannot exceed 250 characters').optional()
});

// --- REVIEW SCHEMAS ---
export const createReviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Review comment must be at least 3 characters').max(500, 'Review cannot exceed 500 characters'),
  orderedDish: z.string().max(100).optional(),
  dishTried: z.string().max(100).optional()
});

export const reviewStatusSchema = z.object({
  status: z.enum(['APPROVED', 'HIDDEN', 'UNDER_REVIEW'], {
    errorMap: () => ({ message: 'Status must be one of: APPROVED, HIDDEN, UNDER_REVIEW' })
  })
});

// --- OFFER SCHEMAS ---
export const createOfferSchema = z.object({
  title: z.string().min(2, 'Offer title is required'),
  discount: z.string().min(1, 'Discount amount/label is required'),
  code: z.string().min(2, 'Promo code must be at least 2 characters').max(20),
  validTill: z.string().min(2, 'Validity period is required'),
  minSpend: z.string().optional(),
  description: z.string().max(300).optional()
});
