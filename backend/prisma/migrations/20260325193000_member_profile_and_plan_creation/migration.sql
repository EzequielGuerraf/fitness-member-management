ALTER TABLE "members"
ADD COLUMN "age" INTEGER,
ADD COLUMN "phone_number" TEXT,
ADD COLUMN "address" TEXT;

ALTER TABLE "members"
ADD CONSTRAINT "members_age_check"
CHECK ("age" IS NULL OR ("age" >= 0 AND "age" <= 120));
