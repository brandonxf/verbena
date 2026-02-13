-- Migration: Add sold_by column to orders table
-- This adds the sold_by column if it doesn't already exist

ALTER TABLE orders ADD COLUMN IF NOT EXISTS sold_by VARCHAR(50) DEFAULT 'leonardo';
