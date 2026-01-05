-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  current_weight DECIMAL(5,2) DEFAULT 80,
  target_weight DECIMAL(5,2) DEFAULT 75,
  current_phase TEXT DEFAULT 'BCA Year 1',
  total_study_hours INTEGER DEFAULT 0,
  total_coding_hours INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_logs table for habit tracking
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  study_hours DECIMAL(4,2) DEFAULT 0,
  coding_hours DECIMAL(4,2) DEFAULT 0,
  cyber_hours DECIMAL(4,2) DEFAULT 0,
  workout_done BOOLEAN DEFAULT false,
  water_liters DECIMAL(3,1) DEFAULT 0,
  weight DECIMAL(5,2),
  notes TEXT,
  motivation_quote TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- Create finance_entries table
CREATE TABLE public.finance_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_url TEXT
);

-- Create study_sessions table for pomodoro tracking
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT DEFAULT 'study',
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roadmap_milestones table
CREATE TABLE public.roadmap_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for daily_logs
CREATE POLICY "Users can view their own logs" ON public.daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own logs" ON public.daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON public.daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON public.daily_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for finance_entries
CREATE POLICY "Users can view their own finance entries" ON public.finance_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own finance entries" ON public.finance_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own finance entries" ON public.finance_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own finance entries" ON public.finance_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own study sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for roadmap_milestones
CREATE POLICY "Users can view their own milestones" ON public.roadmap_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own milestones" ON public.roadmap_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON public.roadmap_milestones FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  
  -- Insert default roadmap milestones
  INSERT INTO public.roadmap_milestones (user_id, phase, title, description, target_date) VALUES
    (new.id, 'BCA Year 1', 'Complete Programming Fundamentals', 'Learn C, C++, Python basics', CURRENT_DATE + INTERVAL '6 months'),
    (new.id, 'BCA Year 1', 'Networking Basics', 'Understand TCP/IP, OSI Model', CURRENT_DATE + INTERVAL '8 months'),
    (new.id, 'BCA Year 2', 'Web Security Fundamentals', 'OWASP Top 10, SQL Injection, XSS', CURRENT_DATE + INTERVAL '18 months'),
    (new.id, 'BCA Year 2', 'Linux & System Administration', 'Master Linux commands and administration', CURRENT_DATE + INTERVAL '20 months'),
    (new.id, 'BCA Year 3', 'CEH Certification', 'Complete Certified Ethical Hacker course', CURRENT_DATE + INTERVAL '30 months'),
    (new.id, 'Masters Prep', 'GATE/GRE Preparation', 'Prepare for entrance exams', CURRENT_DATE + INTERVAL '36 months'),
    (new.id, 'Masters', 'M.Tech in Cyber Security', 'Complete Masters degree', CURRENT_DATE + INTERVAL '60 months'),
    (new.id, 'PhD Prep', 'Research Paper Publication', 'Publish first research paper', CURRENT_DATE + INTERVAL '66 months'),
    (new.id, 'PhD', 'PhD in Cyber Security', 'Complete doctoral research', CURRENT_DATE + INTERVAL '96 months');
  
  RETURN new;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();