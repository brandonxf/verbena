-- Migration: Add payment_method column to orders table
-- This adds the payment_method column if it doesn't already exist

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'efectivo';
