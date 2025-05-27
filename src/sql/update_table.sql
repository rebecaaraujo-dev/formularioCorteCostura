-- Adiciona a coluna canSew se ela não existir
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS "canSew" text;

-- Garante que todas as colunas necessárias existam
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS "fullName" text,
ADD COLUMN IF NOT EXISTS "phone" text,
ADD COLUMN IF NOT EXISTS "age" integer,
ADD COLUMN IF NOT EXISTS "neighborhood" text,
ADD COLUMN IF NOT EXISTS "reason" text,
ADD COLUMN IF NOT EXISTS "timestamp" timestamptz; 