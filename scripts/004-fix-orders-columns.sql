-- Combined migration script for orders table
-- Run these commands in Neon to fix the reports

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'efectivo';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sold_by VARCHAR(50) DEFAULT 'leonardo';
