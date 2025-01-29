CREATE TABLE "chances" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"is_get_out_of_jail" boolean DEFAULT false NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_chests" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"is_get_out_of_jail" boolean DEFAULT false NOT NULL,
	"name" varchar NOT NULL
);
