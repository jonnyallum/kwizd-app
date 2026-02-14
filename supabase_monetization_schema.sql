-- ============================================================
-- Kwizz Monetization Schema (Migration 002)
-- "3 Doors" Pricing: Free Trial → Credits → Unlimited
-- Plus: Player Prime, Sponsors, Corporate
-- ============================================================
-- Run AFTER supabase_schema.sql (the core game tables)
-- This adds monetization on top of existing quizzes/games/players
-- ============================================================

-- ============================================================
-- 1. HOSTS — The people who run quizzes (pub landlords, freelancers)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile
  display_name TEXT NOT NULL,
  venue_name TEXT,                    -- "The Red Lion", "Quiz Master Dave", etc.
  email TEXT NOT NULL,
  
  -- Billing
  stripe_customer_id TEXT,            -- Stripe customer ID for payments
  
  -- Trial tracking
  free_credits_remaining INT DEFAULT 3,  -- Everyone starts with 3 free quiz nights
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id),
  UNIQUE(email)
);

-- ============================================================
-- 2. HOST CREDITS — Pay As You Go balance + purchase history
-- ============================================================
CREATE TABLE IF NOT EXISTS host_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES hosts(id) ON DELETE CASCADE NOT NULL,
  
  -- Balance
  credits_remaining INT NOT NULL DEFAULT 0,
  
  -- Purchase details
  credits_purchased INT NOT NULL,       -- How many they bought (1, 10, or 52)
  amount_paid_pence INT NOT NULL,       -- Amount in pence (£16.80 = 1680)
  currency TEXT DEFAULT 'gbp',
  
  -- Stripe reference
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Pack type for analytics
  pack_type TEXT NOT NULL CHECK (pack_type IN ('single', 'ten_pack', 'fifty_two_pack', 'free_trial')),
  -- single = £16.80, ten_pack = £140, fifty_two_pack = £780, free_trial = £0
  
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. HOST SUBSCRIPTIONS — Unlimited monthly plan
-- ============================================================
CREATE TABLE IF NOT EXISTS host_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES hosts(id) ON DELETE CASCADE NOT NULL,
  
  -- Stripe subscription
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'paused')),
  
  -- Plan
  plan_type TEXT NOT NULL DEFAULT 'unlimited'
    CHECK (plan_type IN ('unlimited')),  -- Only one plan at launch. Add 'pro' later.
  amount_pence INT NOT NULL DEFAULT 3900,  -- £39.00/mo
  currency TEXT DEFAULT 'gbp',
  
  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,               -- If they've scheduled cancellation
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. CREDIT USAGE LOG — Every time a credit is spent
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES hosts(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  
  -- What was used
  source TEXT NOT NULL CHECK (source IN ('free_trial', 'credit', 'subscription')),
  -- free_trial = one of the 3 free nights
  -- credit = deducted from host_credits
  -- subscription = unlimited plan, no deduction
  
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PLAYER PRIME — Cosmetic upgrades for players
-- ============================================================
CREATE TABLE IF NOT EXISTS player_prime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tier
  tier TEXT NOT NULL CHECK (tier IN ('one_off', 'monthly')),
  -- one_off = £1.99 lifetime, monthly = £4.99/mo
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,          -- NULL for one_off purchases
  stripe_payment_intent_id TEXT,        -- For one_off purchases
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Cosmetic selections
  buzzer_sound TEXT DEFAULT 'default',  -- 'default', 'airhorn', 'laser', 'retro', etc.
  avatar_style TEXT DEFAULT 'default',  -- 'default', 'flame', 'electric', 'neon', etc.
  entry_animation TEXT DEFAULT 'none',  -- 'none', 'lightning', 'explosion', 'glitch'
  
  -- Stats (for Neural Profile)
  total_games_played INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  fastest_buzz_ms INT,                  -- Personal best reaction time
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================================
-- 6. SPONSOR ROUNDS — Brands that sponsor quiz rounds
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsor_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Brand info
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  
  -- Round config
  round_title TEXT NOT NULL,            -- "The Guinness Round"
  discount_code TEXT,                   -- Optional discount for winners
  discount_description TEXT,            -- "£1 off your next pint"
  
  -- Targeting
  target_categories TEXT[],             -- Which quiz categories to appear in
  target_regions TEXT[],                -- Geographic targeting
  
  -- Budget & tracking
  monthly_budget_pence INT,
  impressions_this_month INT DEFAULT 0,
  cost_per_impression_pence INT DEFAULT 10,  -- £0.10 per player-view
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. CORPORATE BOOKINGS — Sales-led, tracked here
-- ============================================================
CREATE TABLE IF NOT EXISTS corporate_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Event details
  event_date DATE,
  estimated_attendees INT,
  event_type TEXT DEFAULT 'team_building',  -- team_building, conference, party
  
  -- Pricing
  tier TEXT CHECK (tier IN ('standard', 'large')),
  -- standard = 6-50 people (£599), large = 51+ (£999)
  quoted_amount_pence INT,
  
  -- Status
  status TEXT DEFAULT 'enquiry' 
    CHECK (status IN ('enquiry', 'quoted', 'confirmed', 'completed', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_host_credits_host_id ON host_credits(host_id);
CREATE INDEX IF NOT EXISTS idx_host_subscriptions_host_id ON host_subscriptions(host_id);
CREATE INDEX IF NOT EXISTS idx_host_subscriptions_status ON host_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_credit_usage_host_id ON credit_usage(host_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_game_id ON credit_usage(game_id);
CREATE INDEX IF NOT EXISTS idx_player_prime_user_id ON player_prime(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_rounds_active ON sponsor_rounds(is_active);
CREATE INDEX IF NOT EXISTS idx_corporate_bookings_status ON corporate_bookings(status);

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

-- Hosts: users can only see/edit their own host record
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts can view own record" ON hosts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hosts can update own record" ON hosts
  FOR UPDATE USING (auth.uid() = user_id);

-- Host Credits: users can only see their own credits
ALTER TABLE host_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts can view own credits" ON host_credits
  FOR SELECT USING (host_id IN (SELECT id FROM hosts WHERE user_id = auth.uid()));

-- Host Subscriptions: users can only see their own
ALTER TABLE host_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts can view own subscription" ON host_subscriptions
  FOR SELECT USING (host_id IN (SELECT id FROM hosts WHERE user_id = auth.uid()));

-- Credit Usage: users can see their own usage
ALTER TABLE credit_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts can view own usage" ON credit_usage
  FOR SELECT USING (host_id IN (SELECT id FROM hosts WHERE user_id = auth.uid()));

-- Player Prime: users can see/edit their own
ALTER TABLE player_prime ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players can view own prime" ON player_prime
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Players can update own prime" ON player_prime
  FOR UPDATE USING (auth.uid() = user_id);

-- Sponsor Rounds: public read (shown during quizzes)
ALTER TABLE sponsor_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active sponsors" ON sponsor_rounds
  FOR SELECT USING (is_active = true);

-- Corporate Bookings: service role only (admin managed)
ALTER TABLE corporate_bookings ENABLE ROW LEVEL SECURITY;
-- No public policies — managed via service_role key only

-- ============================================================
-- HELPER FUNCTION: Check if host can start a game
-- Returns: 'free_trial' | 'credit' | 'subscription' | 'blocked'
-- ============================================================
CREATE OR REPLACE FUNCTION check_host_access(p_host_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_free_remaining INT;
  v_has_subscription BOOLEAN;
  v_total_credits INT;
BEGIN
  -- 1. Check active subscription first (fastest path)
  SELECT EXISTS(
    SELECT 1 FROM host_subscriptions 
    WHERE host_id = p_host_id 
    AND status = 'active'
    AND current_period_end > NOW()
  ) INTO v_has_subscription;
  
  IF v_has_subscription THEN
    RETURN 'subscription';
  END IF;
  
  -- 2. Check free trial credits
  SELECT free_credits_remaining INTO v_free_remaining
  FROM hosts WHERE id = p_host_id;
  
  IF v_free_remaining > 0 THEN
    RETURN 'free_trial';
  END IF;
  
  -- 3. Check paid credits
  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_total_credits
  FROM host_credits WHERE host_id = p_host_id;
  
  IF v_total_credits > 0 THEN
    RETURN 'credit';
  END IF;
  
  -- 4. No access
  RETURN 'blocked';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Deduct a credit when starting a game
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_credit(p_host_id UUID, p_game_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_access TEXT;
  v_credit_row UUID;
BEGIN
  v_access := check_host_access(p_host_id);
  
  CASE v_access
    WHEN 'subscription' THEN
      -- Log usage, no deduction needed
      INSERT INTO credit_usage (host_id, game_id, source) 
      VALUES (p_host_id, p_game_id, 'subscription');
      RETURN 'ok';
      
    WHEN 'free_trial' THEN
      -- Deduct free credit
      UPDATE hosts SET free_credits_remaining = free_credits_remaining - 1
      WHERE id = p_host_id AND free_credits_remaining > 0;
      INSERT INTO credit_usage (host_id, game_id, source) 
      VALUES (p_host_id, p_game_id, 'free_trial');
      RETURN 'ok';
      
    WHEN 'credit' THEN
      -- Find oldest credit batch with remaining credits, deduct 1
      SELECT id INTO v_credit_row FROM host_credits
      WHERE host_id = p_host_id AND credits_remaining > 0
      ORDER BY purchased_at ASC LIMIT 1;
      
      UPDATE host_credits SET credits_remaining = credits_remaining - 1
      WHERE id = v_credit_row;
      INSERT INTO credit_usage (host_id, game_id, source) 
      VALUES (p_host_id, p_game_id, 'credit');
      RETURN 'ok';
      
    ELSE
      RETURN 'blocked';
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
