create table "public"."streams" (
    "id" uuid not null default uuid_generate_v4(),
    "event_id" bigint,
    "user_id" uuid,
    "status" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."streams" enable row level security;

CREATE INDEX idx_streams_event_id ON public.streams USING btree (event_id);

CREATE INDEX idx_streams_status ON public.streams USING btree (status);

CREATE INDEX idx_streams_user_id ON public.streams USING btree (user_id);

CREATE UNIQUE INDEX streams_pkey ON public.streams USING btree (id);

alter table "public"."streams" add constraint "streams_pkey" PRIMARY KEY using index "streams_pkey";

alter table "public"."streams" add constraint "streams_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) not valid;

alter table "public"."streams" validate constraint "streams_event_id_fkey";

alter table "public"."streams" add constraint "streams_status_check" CHECK ((status = ANY (ARRAY['live'::text, 'ended'::text]))) not valid;

alter table "public"."streams" validate constraint "streams_status_check";

alter table "public"."streams" add constraint "streams_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."streams" validate constraint "streams_user_id_fkey";

grant delete on table "public"."streams" to "anon";

grant insert on table "public"."streams" to "anon";

grant references on table "public"."streams" to "anon";

grant select on table "public"."streams" to "anon";

grant trigger on table "public"."streams" to "anon";

grant truncate on table "public"."streams" to "anon";

grant update on table "public"."streams" to "anon";

grant delete on table "public"."streams" to "authenticated";

grant insert on table "public"."streams" to "authenticated";

grant references on table "public"."streams" to "authenticated";

grant select on table "public"."streams" to "authenticated";

grant trigger on table "public"."streams" to "authenticated";

grant truncate on table "public"."streams" to "authenticated";

grant update on table "public"."streams" to "authenticated";

grant delete on table "public"."streams" to "service_role";

grant insert on table "public"."streams" to "service_role";

grant references on table "public"."streams" to "service_role";

grant select on table "public"."streams" to "service_role";

grant trigger on table "public"."streams" to "service_role";

grant truncate on table "public"."streams" to "service_role";

grant update on table "public"."streams" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."streams"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable insert for users based on user_id"
on "public"."streams"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable read access for all users"
on "public"."streams"
as permissive
for select
to public
using (true);


create policy "Enable insert for authenticated users only"
on "public"."tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable insert for authenticated users only"
on "public"."videos"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable insert for users based on user_id"
on "public"."videos"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));



