CREATE TABLE "tile_groups" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tiles" (
	"id" varchar PRIMARY KEY NOT NULL,
	"group_id" varchar,
	"color" varchar,
	"name" varchar NOT NULL,
	"order" integer NOT NULL,
	"price" integer,
	"type" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tiles" ADD CONSTRAINT "tiles_group_id_tile_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."tile_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tile_groups_type_index" ON "tile_groups" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tiles_type_index" ON "tiles" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tiles_order_index" ON "tiles" USING btree ("order");