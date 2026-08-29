CREATE UNIQUE INDEX "sessoes_de_interacao_ponto_anonimo_unico" ON "sessoes_de_interacao" USING btree ("ponto_de_acesso_id","hmac_do_identificador_anonimo");
--> statement-breakpoint
CREATE TABLE public.resolucoes_de_pontos_publicos (
  hmac_do_token char(64) PRIMARY KEY,
  negocio_id uuid NOT NULL,
  ponto_de_acesso_id uuid NOT NULL UNIQUE
);
--> statement-breakpoint
INSERT INTO public.resolucoes_de_pontos_publicos (hmac_do_token, negocio_id, ponto_de_acesso_id)
SELECT p.hmac_do_token_publico, e.negocio_id, p.id
FROM public.pontos_de_acesso p
JOIN public.experiencias e ON e.id = p.experiencia_id;
--> statement-breakpoint
CREATE FUNCTION public.registar_resolucao_de_ponto_publico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.resolucoes_de_pontos_publicos (hmac_do_token, negocio_id, ponto_de_acesso_id)
  SELECT NEW.hmac_do_token_publico, e.negocio_id, NEW.id
  FROM public.experiencias e WHERE e.id = NEW.experiencia_id;
  RETURN NEW;
END
$$;
--> statement-breakpoint
CREATE TRIGGER registar_resolucao_publica_apos_ponto
AFTER INSERT ON public.pontos_de_acesso
FOR EACH ROW EXECUTE FUNCTION public.registar_resolucao_de_ponto_publico();
--> statement-breakpoint
CREATE FUNCTION public.resolver_ponto_de_acesso_publico(hmac_procurado char(64))
RETURNS TABLE (negocio_id uuid, ponto_de_acesso_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT r.negocio_id, r.ponto_de_acesso_id
  FROM public.resolucoes_de_pontos_publicos AS r
  WHERE r.hmac_do_token = hmac_procurado
  LIMIT 1
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.resolver_ponto_de_acesso_publico(char(64)) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.resolver_ponto_de_acesso_publico(char(64)) TO entrela;
