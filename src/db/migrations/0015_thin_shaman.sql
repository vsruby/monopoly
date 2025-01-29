ALTER TABLE "games" ADD COLUMN "is_get_out_of_jail_chance_card_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "is_get_out_of_jail_community_chest_card_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "has_get_out_of_jail_chance_card" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "has_get_out_of_jail_community_chest_card" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "chances_is_get_out_of_jail_index" ON "chances" USING btree ("is_get_out_of_jail");--> statement-breakpoint
CREATE INDEX "community_chests_is_get_out_of_jail_index" ON "community_chests" USING btree ("is_get_out_of_jail");--> statement-breakpoint
CREATE INDEX "players_has_get_out_of_jail_chance_card_index" ON "players" USING btree ("has_get_out_of_jail_chance_card");--> statement-breakpoint
CREATE INDEX "players_has_get_out_of_jail_community_chest_card_index" ON "players" USING btree ("has_get_out_of_jail_community_chest_card");