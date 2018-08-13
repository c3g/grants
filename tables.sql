/*
 * tables.sql
 */

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;


CREATE TYPE Status AS ENUM (
  'SUBMITTED',
  'ACCEPTED',
  'FINISHED',
  'NOT_ACCEPTED'
);

CREATE TABLE settings (
    key varchar(100) primary key,
    value jsonb      not null
);
INSERT INTO settings VALUES
    ('whitelist',  '["rom7011@gmail.com","david.bujold@mcgill.ca"]') -- users allowed to login/signup
;

CREATE TABLE users (
    id         serial      primary key,
    "googleId" varchar(50) null,
    token      text        null,
    name       text        not null,
    email      text        null,
    password   text        null
);

CREATE TABLE applicants (
    id         serial      primary key,
    name       text        not null
);

CREATE TABLE grants (
    id          serial    primary key,
    name        text      not null,
    applicants  integer[]     null,
    categoryID  integer   not null,
    start       timestamp not null,
    "end"       timestamp not null,
    status      Status    not null,
    total       integer   not null,
    cofunding   integer   not null,
    fields      jsonb         null
);

CREATE TABLE fundings (
    id             serial    primary key,
    fromGrantID    integer   not null,
    toGrantID      integer   not null,
    amount         integer   not null
);


CREATE TABLE categories (
    id          serial     primary key,
    name        text       not null,
    color       varchar(7) not null
);


-- Bootstrap data

INSERT INTO users (id, "googleId", token, name, email, password) VALUES (
    nextval('users_id_seq'),
    null,
    null,
    'System',
    null,
    'Gr4nts'
);


-- Test data

INSERT INTO users (id, "googleId", token, name, email) VALUES (
    nextval('users_id_seq'),
    '113897916442927912291',
    'ya2GlsZBV75c-JxuuzblrbS7WoUmuWpJDJtgOOdzUcwFOaFt_7ADAIRKpiOXA1A_TtFl1AkMoXAPcqus6_ia',
    'Rom Grk',
    'rom7011@gmail.com'
);

-- vim:et
