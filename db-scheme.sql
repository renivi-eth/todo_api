create type task_state as enum ('backlog', 'in-progress', 'done');

create table users
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar (256),
    password text not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table tasks (
    id uuid primary key default gen_random_uuid(),
    name varchar(30) not null,
    description text,
    state task_state not null default 'backlog',
    user_id uuid references users(id),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table tag (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50),
    user_id uuid references users(id),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table task_tag (
    task_id uuid  references tasks(id),
    tag_id uuid references tag(id),
    primary key (task_id, tag_id)
);