import { z } from 'zod';

// --- AUTH SCHEMAS ---
export const sendOtpSchema = z.object({
  email: z.string().email('Please provide a valid institutional email address')
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Please provide a valid institutional email address'),
  otp: z.string().min(6, 'Passkey must be 6 digits').max(6, 'Passkey must be 6 digits'),
  name: z.string().max(80).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required').optional(),
  roleHint: z.string().optional()
});

// --- BOOKING SCHEMAS ---
export const createBookingSchema = z.object({
  restaurantId: z.coerce.number().int().positive('Valid restaurant ID is required'),
  date: z.string().min(1, 'Date is required'),
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
