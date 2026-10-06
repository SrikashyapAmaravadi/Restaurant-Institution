-- ============================================================================
-- Institutional Restaurant Discovery & Pre-Booking Platform
-- Complete Supabase SQL Setup Script
-- ============================================================================
-- Run this script in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Offer" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "BookingOrder" CASCADE;
DROP TABLE IF EXISTS "Booking" CASCADE;
DROP TABLE IF EXISTS "MenuItem" CASCADE;
DROP TABLE IF EXISTS "RestaurantTable" CASCADE;
DROP TABLE IF EXISTS "AvailabilitySlot" CASCADE;
DROP TABLE IF EXISTS "RestaurantMember" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "VerificationRequest" CASCADE;
DROP TABLE IF EXISTS "Restaurant" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Institution" CASCADE;

-- ============================================================================
-- TABLE: Institution
-- ============================================================================
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL UNIQUE,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'UNIVERSITY',
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "partnerRestaurants" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: User
-- ============================================================================
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "roleLabel" TEXT,
    "department" TEXT,
    "rollNumber" TEXT,
    "institution" TEXT DEFAULT 'Bennett University',
    "institutionId" TEXT,
    "avatar" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "homePath" TEXT DEFAULT '/dashboard',
    "restaurantId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "User_institutionId_idx" ON "User"("institutionId");

-- ============================================================================
-- TABLE: VerificationRequest
-- ============================================================================
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "idProof" TEXT NOT NULL,
    "submitted" TEXT NOT NULL DEFAULT 'Just now',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationCode" TEXT,
    "codeHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "VerificationRequest_email_idx" ON "VerificationRequest"("email");

-- ============================================================================
-- TABLE: RefreshToken
-- ============================================================================
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- ============================================================================
-- TABLE: Restaurant
-- ============================================================================
CREATE TABLE "Restaurant" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "cuisine" TEXT NOT NULL,
    "price" TEXT NOT NULL DEFAULT '₹₹',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "distance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "hasOffer" BOOLEAN NOT NULL DEFAULT false,
    "offerLabel" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "image" TEXT NOT NULL,
    "heroImage" TEXT,
    "galleryJson" TEXT,
    "description" TEXT NOT NULL,
    "tagsJson" TEXT,
    "featuresJson" TEXT,
    "popularDishesJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Restaurant_rating_idx" ON "Restaurant"("rating");
CREATE INDEX "Restaurant_isOpen_idx" ON "Restaurant"("isOpen");
CREATE INDEX "Restaurant_isDeleted_idx" ON "Restaurant"("isDeleted");
CREATE INDEX "Restaurant_cuisine_idx" ON "Restaurant"("cuisine");

-- ============================================================================
-- TABLE: RestaurantMember
-- ============================================================================
CREATE TABLE "RestaurantMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RestaurantMember_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RestaurantMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RestaurantMember_restaurantId_userId_key" UNIQUE ("restaurantId", "userId")
);

CREATE INDEX "RestaurantMember_userId_idx" ON "RestaurantMember"("userId");

-- ============================================================================
-- TABLE: AvailabilitySlot
-- ============================================================================
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "slotDate" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilitySlot_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AvailabilitySlot_restaurantId_slotDate_startTime_key" UNIQUE ("restaurantId", "slotDate", "startTime")
);

CREATE INDEX "AvailabilitySlot_restaurantId_slotDate_idx" ON "AvailabilitySlot"("restaurantId", "slotDate");

-- ============================================================================
-- TABLE: RestaurantTable
-- ============================================================================
CREATE TABLE "RestaurantTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "type" TEXT NOT NULL DEFAULT 'Standard Booth',
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "currentGuest" TEXT,
    "currentBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RestaurantTable_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RestaurantTable_restaurantId_idx" ON "RestaurantTable"("restaurantId");
CREATE INDEX "RestaurantTable_isOccupied_idx" ON "RestaurantTable"("isOccupied");

-- ============================================================================
-- TABLE: MenuItem
-- ============================================================================
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "isVeg" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "badge" TEXT,
    "calories" TEXT,
    "image" TEXT,
    CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MenuItem_restaurantId_idx" ON "MenuItem"("restaurantId");

-- ============================================================================
-- TABLE: Booking
-- ============================================================================
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "restaurantImage" TEXT,
    "userId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 2,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "specialRequest" TEXT,
    "tableAssigned" TEXT,
    "qrCode" TEXT,
    "slotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Booking_restaurantId_idx" ON "Booking"("restaurantId");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- ============================================================================
-- TABLE: BookingOrder
-- ============================================================================
CREATE TABLE "BookingOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "BookingOrder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "BookingOrder_bookingId_idx" ON "BookingOrder"("bookingId");

-- ============================================================================
-- TABLE: Payment
-- ============================================================================
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL UNIQUE,
    "method" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL UNIQUE,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "detailsJson" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PAID',
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- TABLE: Notification
-- ============================================================================
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "code" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- ============================================================================
-- TABLE: Offer
-- ============================================================================
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" INTEGER NOT NULL,
    "promoCode" TEXT NOT NULL UNIQUE,
    "startDate" TEXT,
    "endDate" TEXT,
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Offer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Offer_restaurantId_idx" ON "Offer"("restaurantId");
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- ============================================================================
-- TABLE: AuditLog
-- ============================================================================
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    "userRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "detailsJson" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- ============================================================================
-- TABLE: Review
-- ============================================================================
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL DEFAULT 'STUDENT',
    "userDept" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "dishTried" TEXT,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_restaurantId_userId_key" UNIQUE ("restaurantId", "userId")
);

CREATE INDEX "Review_restaurantId_idx" ON "Review"("restaurantId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- ============================================================================
-- SEED DATA: Institutions
-- ============================================================================
INSERT INTO "Institution" ("id", "name", "domain", "location", "type", "discountPercent", "activeUsers", "partnerRestaurants", "status", "isPrimary", "createdAt")
VALUES
('inst-1', 'Bennett University', '@bennett.edu.in', 'Plot 8-11, TechZone II, Greater Noida, UP 201310', 'UNIVERSITY', 20, 3420, 0, 'ACTIVE', true, CURRENT_TIMESTAMP),
('inst-2', 'Shiv Nadar University', '@snu.edu.in', 'NH91, Tehsil Dadri, Gautam Buddha Nagar, UP 203207', 'UNIVERSITY', 10, 1840, 0, 'PILOT', false, CURRENT_TIMESTAMP);

-- ============================================================================
-- SEED DATA: Users (password for all: "password123")
-- Hash generated using: bcrypt.hashSync('password123', 10)
-- ============================================================================
INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "roleLabel", "department", "rollNumber", "institution", "institutionId", "avatar", "verified", "homePath", "createdAt", "updatedAt")
VALUES
-- Super Admin
('usr-superadmin-1', 'superadmin@bennett.edu.in', '$2a$10$rSWJKHx4vHJPxQrA1zXkwOvXZ8xYx7Z0zR8p6jqJQc8KzQJZGZJ2O', 'Dr. A. K. Sharma', 'SUPER_ADMIN', 'Platform Governance & Super Admin', 'Office of Dean & Campus Operations', NULL, 'Bennett University', 'inst-1', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', true, '/management/superadmin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Verified Student
('usr-student-1', 'priya.sharma@bennett.edu.in', '$2a$10$rSWJKHx4vHJPxQrA1zXkwOvXZ8xYx7Z0zR8p6jqJQc8KzQJZGZJ2O', 'Priya Sharma', 'STUDENT', 'Student (Bennett University)', 'B.Tech CSE · 2nd Year', 'BU24CSE0082', 'Bennett University', 'inst-1', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', true, '/dashboard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Bennett Scholar SSO
('usr-student-bennett', 'student@bennett.edu.in', '$2a$10$rSWJKHx4vHJPxQrA1zXkwOvXZ8xYx7Z0zR8p6jqJQc8KzQJZGZJ2O', 'Bennett Scholar', 'STUDENT', 'Student (Bennett University)', 'B.Tech Computer Science · 2nd Year', 'BU24CSE0001', 'Bennett University', 'inst-1', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', true, '/dashboard', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Unverified Student
('usr-student-2', 'rohan.deshmukh@bennett.edu.in', '$2a$10$rSWJKHx4vHJPxQrA1zXkwOvXZ8xYx7Z0zR8p6jqJQc8KzQJZGZJ2O', 'Rohan Deshmukh', 'STUDENT', 'Student (Bennett University)', 'B.Tech CSE · 1st Year', 'BU25CSE0114', 'Bennett University', 'inst-1', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', false, '/verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Faculty (Unverified)
('usr-faculty-1', 'radhika.nair@bennett.edu.in', '$2a$10$rSWJKHx4vHJPxQrA1zXkwOvXZ8xYx7Z0zR8p6jqJQc8KzQJZGZJ2O', 'Dr. Radhika Nair', 'STUDENT', 'Faculty (Bennett University)', 'Dept of Biotechnology & Sciences', 'FAC-BIO-104', 'Bennett University', 'inst-1', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', false, '/verify', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- SEED DATA: Verification Requests
-- ============================================================================
INSERT INTO "VerificationRequest" ("id", "userId", "name", "email", "role", "idProof", "submitted", "status", "verificationCode", "createdAt", "updatedAt")
VALUES
('req-1', 'usr-student-1', 'Priya Sharma', 'priya.sharma@bennett.edu.in', 'B.Tech CSE · 2nd Year', 'BU-2024-CSE-0082', 'Yesterday, 11:30 AM', 'VERIFIED', '482100', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('req-2', 'usr-student-2', 'Rohan Deshmukh', 'rohan.deshmukh@bennett.edu.in', 'B.Tech CSE · 1st Year', 'BU-2025-CSE-0114', 'Today, 09:15 AM', 'CODE_SENT', '849201', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('req-3', 'usr-faculty-1', 'Dr. Radhika Nair', 'radhika.nair@bennett.edu.in', 'Dept of Biotechnology & Sciences', 'BU-FAC-BIO-104', 'Today, 10:45 AM', 'PENDING', '314159', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- COMPLETE! Database is ready for use
-- ============================================================================
-- Login credentials (all use password: password123):
-- Super Admin: superadmin@bennett.edu.in
-- Student:     priya.sharma@bennett.edu.in
-- Student SSO: student@bennett.edu.in
-- ============================================================================
