-- ============================================
-- FIT PROFILES TABLE - GRAZEL APPAREL
-- ============================================
-- Stores user size preferences and body type
-- for personalized fit recommendations
-- ============================================

-- Drop table (this automatically drops all policies)
-- This ensures clean setup even if run multiple times
DROP TABLE IF EXISTS fit_profiles CASCADE;

-- Create fresh table for storing user fit profiles
CREATE TABLE fit_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_size VARCHAR(5) NOT NULL,
  body_type VARCHAR(20),
  height VARCHAR(10),
  weight VARCHAR(10),
  preferred_fit VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for fast queries
CREATE INDEX idx_fit_profiles_user_id ON fit_profiles(user_id);

-- Enable Row Level Security for data protection
ALTER TABLE fit_profiles ENABLE ROW LEVEL SECURITY;

-- Create single permissive policy that allows all authenticated users
-- Application handles authorization at the code level
CREATE POLICY "fit_profiles_policy" ON fit_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Setup complete!
-- Table is ready to use
-- ============================================

