DROP POLICY IF EXISTS \
Categories
are
editable
by
authenticated
users
only\ ON public.categories; CREATE POLICY \Categories
are
editable
by
anyone\ ON public.categories FOR ALL USING (true);
