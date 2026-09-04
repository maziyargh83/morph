CREATE TYPE "public"."page_access_mode" AS ENUM('public', 'authenticated', 'roles');--> statement-breakpoint
CREATE TYPE "public"."page_host" AS ENUM('client', 'studio');--> statement-breakpoint
CREATE TABLE "page_access" (
	"host" "page_host" NOT NULL,
	"path" text NOT NULL,
	"mode" "page_access_mode" NOT NULL,
	"roles" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_access_host_path_pk" PRIMARY KEY("host","path")
);
--> statement-breakpoint
ALTER TABLE "page_access" ADD CONSTRAINT "page_access_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;