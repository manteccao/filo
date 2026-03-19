-- Add username column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Generate username from full_name for existing users
-- Removes non-alphanumeric/space chars, replaces spaces with hyphens, lowercases
UPDATE profiles
SET username = lower(
  regexp_replace(
    regexp_replace(
      coalesce(full_name, ''),
      '[^a-zA-Z0-9 ]', '', 'g'
    ),
    ' +', '-', 'g'
  )
)
WHERE username IS NULL
  AND full_name IS NOT NULL
  AND full_name != '';
