ALTER TABLE "games" ADD COLUMN "state" varchar DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;