alter table categories alter column couple_id drop not null;

drop policy if exists "categories_select" on categories;
create policy "categories_select" on categories for select
  using (
    couple_id is null
    or couple_id in (select couple_id from profiles where id = auth.uid())
  );

drop policy if exists "categories_insert" on categories;
create policy "categories_insert" on categories for insert
  with check (couple_id in (select couple_id from profiles where id = auth.uid()));

drop policy if exists "categories_update" on categories;
create policy "categories_update" on categories for update
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

drop policy if exists "categories_delete" on categories;
create policy "categories_delete" on categories for delete
  using (couple_id in (select couple_id from profiles where id = auth.uid()));

insert into categories (couple_id, name, icon, type, color) values
  (null, 'Salario', 'briefcase', 'income', '#059669'),
  (null, 'Freelance', 'code', 'income', '#10B981'),
  (null, 'Inversiones', 'trending-up', 'income', '#34D399'),
  (null, 'Otros ingresos', 'plus-circle', 'income', '#6EE7B7'),
  (null, 'Alimentación', 'shopping-cart', 'expense', '#EF4444'),
  (null, 'Transporte', 'truck', 'expense', '#F97316'),
  (null, 'Vivienda', 'home', 'expense', '#F59E0B'),
  (null, 'Servicios', 'zap', 'expense', '#EAB308'),
  (null, 'Salud', 'heart', 'expense', '#84CC16'),
  (null, 'Entretenimiento', 'film', 'expense', '#22C55E'),
  (null, 'Ropa', 'shirt', 'expense', '#14B8A6'),
  (null, 'Educación', 'book', 'expense', '#06B6D4'),
  (null, 'Otros gastos', 'more-horizontal', 'expense', '#6366F1');
