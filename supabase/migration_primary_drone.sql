-- הרץ את זה פעם אחת בלבד בלוח הבקרה של Supabase > SQL Editor

-- מוסיף עמודה is_primary לטבלת רחפנים (ברירת מחדל: ראשי)
ALTER TABLE drones ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;
