-- Test A : le manager obtient les coordonnées
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
select * from public.contact_client_commande('ID_COMMANDE');
rollback;
-- Attendu : une ligne avec nom, prénom, e-mail, téléphone et WhatsApp.

-- Test B : le client ne peut pas utiliser la fonction
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_CLIENT", "role": "authenticated"}', true);
select * from public.contact_client_commande('ID_COMMANDE');
rollback;
-- Attendu : Accès refusé.

-- Test C : un visiteur anonyme n’a même pas le droit d’appeler la fonction
begin;
set local role anon;
select * from public.contact_client_commande('ID_COMMANDE');
rollback;
-- Attendu : permission denied for function contact_client_commande.

-- Test D : la liste des relances contient les nouveaux champs
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
select client_email, client_whatsapp from public.commandes_a_relancer();
rollback;
-- Attendu : les colonnes existent, même si la liste est vide.

-- Test E : le manager ne lit toujours pas profiles directement
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "ID_MANAGER", "role": "authenticated"}', true);
select email from public.profiles;
rollback;
-- Attendu : seul le compte du manager, ou rien, selon la politique profiles existante. 
-- Les coordonnées des autres clients ne doivent pas apparaître. 
-- Si d’autres lignes sortent, c’est que la politique de lecture est trop large




