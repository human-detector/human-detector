set names 'utf8';
set session_replication_role = 'replica';

create table "user" ("id" uuid not null, "expo_token" varchar(255) null, constraint "user_pkey" primary key ("id"));

create table "group" ("id" uuid not null, "name" varchar(255) not null, "user_id" uuid not null, constraint "group_pkey" primary key ("id"));

create table "camera" ("id" uuid not null, "name" varchar(255) not null, "public_key" varchar(255) not null, "serial" varchar(255) not null, "group_id" uuid not null, constraint "camera_pkey" primary key ("id"));

create table "snapshot" ("id" uuid not null, "image" bytea not null, constraint "snapshot_pkey" primary key ("id"));

create table "notification" ("id" uuid not null, "timestamp" timestamptz(0) not null, "camera_id" uuid not null, "snapshot_id" uuid not null, constraint "notification_pkey" primary key ("id"));
alter table "notification" add constraint "notification_snapshot_id_unique" unique ("snapshot_id");

alter table "group" add constraint "group_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;

alter table "camera" add constraint "camera_group_id_foreign" foreign key ("group_id") references "group" ("id") on update cascade;

alter table "notification" add constraint "notification_camera_id_foreign" foreign key ("camera_id") references "camera" ("id") on update cascade;
alter table "notification" add constraint "notification_snapshot_id_foreign" foreign key ("snapshot_id") references "snapshot" ("id") on update cascade;

set session_replication_role = 'origin';
