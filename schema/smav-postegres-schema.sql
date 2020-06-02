-- Adminer 4.7.6 PostgreSQL dump

CREATE TABLE "public"."article_authors" (
    "article_id" bigint NOT NULL,
    "author_name" text NOT NULL,
    CONSTRAINT "article_authors_pkey" PRIMARY KEY ("article_id", "author_name")
) WITH (oids = false);


CREATE TABLE "public"."cited_by" (
    "article_id" bigint NOT NULL,
    "cited_by_id" bigint NOT NULL,
    CONSTRAINT "pk_cited_by" PRIMARY KEY ("article_id", "cited_by_id")
) WITH (oids = false);


CREATE TABLE "public"."cites" (
    "article_id" bigint NOT NULL,
    "cites_article_id" bigint NOT NULL,
    CONSTRAINT "cites_pkey" PRIMARY KEY ("article_id", "cites_article_id")
) WITH (oids = false);


CREATE SEQUENCE seq_journal INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."journals" (
    "id" bigint DEFAULT nextval('seq_journal') NOT NULL,
    "name" text NOT NULL,
    "subject_area" character varying(80),
    "subject_category" character varying(80),
    "region" character varying(80),
    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE SEQUENCE seq_article INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."sma" (
    "id" bigint DEFAULT nextval('seq_article') NOT NULL,
    "expected_cited_by_count" integer,
    "expected_cites_count" integer,
    "abstract" text,
    "publish_date" date,
    "date_added" date NOT NULL,
    "title" text NOT NULL,
    "journal_id" integer,
    CONSTRAINT "pk_article_id" PRIMARY KEY ("id"),
    CONSTRAINT "fk_journal" FOREIGN KEY (journal_id) REFERENCES journals(id) NOT DEFERRABLE
) WITH (oids = false);


CREATE SEQUENCE smav_search_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;

CREATE TABLE "public"."smav_search" (
    "id" integer DEFAULT nextval('smav_search_id_seq') NOT NULL,
    "search_vector" tsvector NOT NULL,
    "sma_id" bigint,
    "journal_id" bigint,
    CONSTRAINT "smav_search_id" PRIMARY KEY ("id"),
    CONSTRAINT "smav_search_journal_id_fkey" FOREIGN KEY (journal_id) REFERENCES journals(id) NOT DEFERRABLE,
    CONSTRAINT "smav_search_sma_id_fkey" FOREIGN KEY (sma_id) REFERENCES sma(id) NOT DEFERRABLE
) WITH (oids = false);

CREATE INDEX "search_vector" ON "public"."smav_search" USING btree ("search_vector");


-- 2020-06-02 20:21:40.969139+00