CREATE TABLE "rolls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"die1" integer NOT NULL,
	"die2" integer NOT NULL,
	"game_id" uuid NOT NULL,
	"kind" varchar NOT NULL,
	"player_id" uuid NOT NULL,
	"total" integer NOT NULL,
	"turn_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rolls" ADD CONSTRAINT "rolls_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rolls" ADD CONSTRAINT "rolls_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rolls" ADD CONSTRAINT "rolls_turn_id_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."turns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rolls_game_id_index" ON "rolls" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "rolls_kind_index" ON "rolls" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "rolls_player_id_index" ON "rolls" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "rolls_turn_id_index" ON "rolls" USING btree ("turn_id");