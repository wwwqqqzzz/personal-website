CREATE TABLE IF NOT EXISTS public.categories (id UUID DEFAULT gen_random_uuid() PRIMARY KEY,created_at TIMESTAMPTZ DEFAULT NOW(),updated_at TIMESTAMPTZ DEFAULT NOW(),name TEXT NOT NULL,slug TEXT NOT NULL UNIQUE,description TEXT,parent_id UUID REFERENCES public.categories(id),\
order\ INTEGER DEFAULT 0,CONSTRAINT valid_parent CHECK (parent_id != id));ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;CREATE POLICY \Categories
are
viewable
by
everyone\ ON public.categories FOR SELECT USING (true);CREATE POLICY \Categories
are
editable
by
authenticated
users
only\ ON public.categories FOR ALL USING (auth.role() = 'authenticated');
