CREATE TABLE "drawn_chances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chance_id" varchar NOT NULL,
	"game_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "drawn_community_chests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_chest_id" varchar NOT NULL,
	"game_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "drawn_chances" ADD CONSTRAINT "drawn_chances_chance_id_chances_id_fk" FOREIGN KEY ("chance_id") REFERENCES "public"."chances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawn_chances" ADD CONSTRAINT "drawn_chances_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawn_community_chests" ADD CONSTRAINT "drawn_community_chests_community_chest_id_community_chests_id_fk" FOREIGN KEY ("community_chest_id") REFERENCES "public"."community_chests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawn_community_chests" ADD CONSTRAINT "drawn_community_chests_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drawn_chances_chance_id_index" ON "drawn_chances" USING btree ("chance_id");--> statement-breakpoint
CREATE INDEX "drawn_chances_game_id_index" ON "drawn_chances" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "drawn_community_chests_community_chest_id_index" ON "drawn_community_chests" USING btree ("community_chest_id");--> statement-breakpoint
CREATE INDEX "drawn_community_chests_game_id_index" ON "drawn_community_chests" USING btree ("game_id");