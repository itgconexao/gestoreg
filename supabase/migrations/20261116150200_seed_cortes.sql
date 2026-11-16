-- Cortes iniciais (os mesmos do app original)

insert into public.cortes (nome) values
  ('Coxão mole'),
  ('Maminha'),
  ('Carne moída'),
  ('Coxa e sobrecoxa de frango'),
  ('Filé de peito de frango'),
  ('Filé de tilápia'),
  ('Lombo suíno'),
  ('Linguiça'),
  ('Costela bovina'),
  ('Alcatra')
on conflict (nome) do nothing;
