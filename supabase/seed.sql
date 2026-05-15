-- Categorías por defecto (solo para desarrollo local)
insert into categories (couple_id, name, icon, type, color)
select null, v.name, v.icon, v.type::transaction_type, v.color
from (values
  ('Salario', 'briefcase', 'income', '#059669'),
  ('Freelance', 'code', 'income', '#10B981'),
  ('Inversiones', 'trending-up', 'income', '#34D399'),
  ('Otros ingresos', 'plus-circle', 'income', '#6EE7B7'),
  ('Alimentación', 'shopping-cart', 'expense', '#EF4444'),
  ('Transporte', 'truck', 'expense', '#F97316'),
  ('Vivienda', 'home', 'expense', '#F59E0B'),
  ('Servicios', 'zap', 'expense', '#EAB308'),
  ('Salud', 'heart', 'expense', '#84CC16'),
  ('Entretenimiento', 'film', 'expense', '#22C55E'),
  ('Ropa', 'shirt', 'expense', '#14B8A6'),
  ('Educación', 'book', 'expense', '#06B6D4'),
  ('Otros gastos', 'more-horizontal', 'expense', '#6366F1')
) as v(name, icon, type, color)
where not exists (select 1 from categories where name = v.name and couple_id is null);
