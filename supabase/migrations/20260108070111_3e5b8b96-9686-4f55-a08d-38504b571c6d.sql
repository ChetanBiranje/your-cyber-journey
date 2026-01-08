-- Add display_order column to roadmap_milestones for drag-and-drop reordering
ALTER TABLE public.roadmap_milestones 
ADD COLUMN display_order integer DEFAULT 0;

-- Update existing milestones to have sequential order based on target_date
WITH ordered_milestones AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, phase ORDER BY target_date, created_at) as new_order
  FROM public.roadmap_milestones
)
UPDATE public.roadmap_milestones 
SET display_order = ordered_milestones.new_order
FROM ordered_milestones
WHERE public.roadmap_milestones.id = ordered_milestones.id;