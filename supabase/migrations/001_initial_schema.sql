CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  subscription_type TEXT CHECK (subscription_type IN ('free', 'standard', 'vip')) DEFAULT 'free',
  subscription_start DATE,
  subscription_end DATE,
  is_annual BOOLEAN DEFAULT false,
  promo_code TEXT,
  is_admin BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, subscription_type)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'), 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_date TIMESTAMP NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  league TEXT,
  country TEXT,
  stadium TEXT,
  api_source TEXT,
  api_match_id TEXT,
  status TEXT CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled')) DEFAULT 'scheduled',
  home_score INTEGER,
  away_score INTEGER,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_matches_status ON matches(status);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  prediction_value TEXT NOT NULL,
  odds DECIMAL(5,2),
  confidence_level TEXT CHECK (confidence_level IN ('standard', 'vip')) NOT NULL,
  description TEXT,
  result TEXT CHECK (result IN ('pending', 'won', 'lost')) DEFAULT 'pending',
  admin_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_confidence ON predictions(confidence_level);
CREATE INDEX idx_predictions_result ON predictions(result);

CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plan TEXT CHECK (plan IN ('standard', 'vip')) NOT NULL,
  duration TEXT CHECK (duration IN ('monthly', 'annual')) NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('orange_money', 'moov_money')) NOT NULL,
  sender_number TEXT,
  screenshot_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_note TEXT,
  admin_id UUID REFERENCES auth.users,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_payment_requests_user ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);

CREATE TABLE custom_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  requested_code TEXT NOT NULL,
  bookmaker TEXT CHECK (bookmaker IN ('1xbet', 'betwinner', 'melbet', '1win', '1xbit', 'autre')) NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_code TEXT,
  admin_note TEXT,
  admin_id UUID REFERENCES auth.users,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_promo_codes_user ON custom_promo_codes(user_id);
CREATE INDEX idx_promo_codes_status ON custom_promo_codes(status);

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'read', 'replied')) DEFAULT 'new',
  admin_reply TEXT,
  admin_id UUID REFERENCES auth.users,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_messages_status ON contact_messages(status);
CREATE INDEX idx_messages_user ON contact_messages(user_id);

CREATE TABLE prediction_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_predictions INTEGER DEFAULT 0,
  won_predictions INTEGER DEFAULT 0,
  lost_predictions INTEGER DEFAULT 0,
  standard_predictions INTEGER DEFAULT 0,
  vip_predictions INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_stats_date ON prediction_stats(date DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Only admins can insert matches" ON matches FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Only admins can update matches" ON matches FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Only admins can delete matches" ON matches FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Predictions viewable based on subscription" ON predictions FOR SELECT USING (
  confidence_level = 'standard' OR 
  (confidence_level = 'vip' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND subscription_type IN ('standard', 'vip')
    AND subscription_end >= CURRENT_DATE
  ))
);
CREATE POLICY "Only admins can manage predictions" ON predictions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can view own payment requests" ON payment_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payment requests" ON payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payment requests" ON payment_requests FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update payment requests" ON payment_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can view own promo requests" ON custom_promo_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create promo requests" ON custom_promo_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all promo requests" ON custom_promo_codes FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update promo requests" ON custom_promo_codes FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can view own messages" ON contact_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all messages" ON contact_messages FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update messages" ON contact_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

