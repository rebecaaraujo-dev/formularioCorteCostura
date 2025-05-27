-- Remove a tabela config que não é mais necessária
drop table if exists config;

-- Remove a coluna isMember da tabela registrations
alter table registrations drop column if exists isMember; 