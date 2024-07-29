CREATE TYPE task_state AS ENUM ('backlog', 'in-progress', 'done');

CREATE TABLE "user"
(
    id         UUID PRIMARY KEY             DEFAULT gen_random_uuid(),
    email      VARCHAR(256) UNIQUE NOT NULL,
    password   TEXT                NOT NULL,
    created_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task
(
    id          UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    name        VARCHAR(30) NOT NULL,
    description TEXT,
    state       task_state  NOT NULL DEFAULT 'backlog',
    user_id     UUID REFERENCES "user" (id) ON DELETE CASCADE,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tag
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    name       VARCHAR(50) NOT NULL,
    user_id    UUID REFERENCES "user" (id) ON DELETE CASCADE,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_tag
(
    task_id UUID REFERENCES task (id) ON DELETE CASCADE,
    tag_id  UUID REFERENCES tag (id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Indexes

-- Ускоряет поиск пользователей по email
CREATE INDEX idx_user_email ON "user" USING hash (email);

-- Ускоряет выборки по task
CREATE INDEX idx_task_state ON task (state);

-- Ускоряет выборки по tag 
CREATE INDEX idx_tag_user_id ON tag USING hash (user_id);

-- Ускоряет выборку по task_tag 
CREATE INDEX idx_task_tag_tag_id ON task_tag USING hash (tag_id);