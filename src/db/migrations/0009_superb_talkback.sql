ALTER TABLE "games" ADD COLUMN "round" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "current_tile_id" varchar;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_current_tile_id_tiles_id_fk" FOREIGN KEY ("current_tile_id") REFERENCES "public"."tiles"("id") ON DELETE no action ON UPDATE no action;