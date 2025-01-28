ALTER TABLE "turns" ADD COLUMN "ended_on_tile_id" varchar;--> statement-breakpoint
ALTER TABLE "turns" ADD COLUMN "started_on_tile_id" varchar;--> statement-breakpoint
ALTER TABLE "turns" ADD CONSTRAINT "turns_ended_on_tile_id_tiles_id_fk" FOREIGN KEY ("ended_on_tile_id") REFERENCES "public"."tiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turns" ADD CONSTRAINT "turns_started_on_tile_id_tiles_id_fk" FOREIGN KEY ("started_on_tile_id") REFERENCES "public"."tiles"("id") ON DELETE no action ON UPDATE no action;