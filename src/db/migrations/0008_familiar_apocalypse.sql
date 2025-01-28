CREATE TABLE "deeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"has_hotel" boolean DEFAULT false NOT NULL,
	"house_count" integer DEFAULT 0 NOT NULL,
	"is_mortgaged" boolean DEFAULT false NOT NULL,
	"owner_id" uuid,
	"tile_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "deeds" ADD CONSTRAINT "deeds_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deeds" ADD CONSTRAINT "deeds_owner_id_players_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deeds" ADD CONSTRAINT "deeds_tile_id_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."tiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deeds_game_id_index" ON "deeds" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "deeds_owner_id_index" ON "deeds" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "deeds_tile_id_index" ON "deeds" USING btree ("tile_id");