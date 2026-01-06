-- Add columns for user's education background, goal, and challenges
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_education TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS education_field TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS goal TEXT DEFAULT 'PhD in Cyber Security',
ADD COLUMN IF NOT EXISTS challenges TEXT DEFAULT NULL;

-- Allow users to delete their own roadmap milestones so they can regenerate
CREATE POLICY "Users can delete their own milestones" 
ON public.roadmap_milestones 
FOR DELETE 
USING (auth.uid() = user_id);