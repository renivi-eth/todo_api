CREATE TYPE task_state AS ENUM ('backlog', 'in-progress', 'done');

CREATE TABLE users
(
    id         UUID PRIMARY KEY             DEFAULT gen_random_uuid(),
    email      VARCHAR(256) UNIQUE NOT NULL,
    password   TEXT                NOT NULL,
    created_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks
(
    id          UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    name        VARCHAR(30) NOT NULL,
    description TEXT,
    state       task_state  NOT NULL DEFAULT 'backlog',
    user_id     UUID REFERENCES users (id),
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tag
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    name       VARCHAR(50) NOT NULL,
    user_id    UUID REFERENCES users (id),
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_tag
(
    task_id UUID REFERENCES tasks (id),
    tag_id  UUID REFERENCES tag (id),
    PRIMARY KEY (task_id, tag_id)
);