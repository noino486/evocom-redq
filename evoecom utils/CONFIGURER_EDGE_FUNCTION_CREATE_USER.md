## Edge Function `create-user` avec ThriveCart

Ce guide explique comment connecter ThriveCart à l’Edge Function Supabase `create-user` (accessible via `https://sokdytywaipifrjcitcg.supabase.co/functions/v1/create-user`) pour créer automatiquement un compte utilisateur après un achat.

### 1. Prérequis
- Accès au projet Supabase (ID et clé de service).
- Edge Function `create-user` déjà déployée (`supabase/functions/create-user`).
- Compte ThriveCart avec accès aux paramètres webhooks.
- Accès aux secrets Supabase (CLI ou dashboard) pour stocker la clé d’authentification.

### 2. Vérifier le déploiement de l’Edge Function
1. Depuis le dépôt local : `supabase functions deploy create-user`.
2. Confirmer dans le dashboard Supabase → `Edge Functions` que `create-user` est en ligne.
3. Tester en local (optionnel) : `supabase functions serve create-user --env-file ./supabase/.env`.

### 3. Authentification de l’Edge Function
L’API est protégée par une clé Bearer. Assure-toi que :
- La variable `EDGE_FUNCTION_SECRET` (ou équivalent défini dans la fonction) est configurée dans Supabase (`supabase secrets set EDGE_FUNCTION_SECRET=...`).
- ThriveCart enverra cette clé dans l’en-tête `Authorization: Bearer <clé>`.

### 4. Configuration ThriveCart
1. ThriveCart → `Paramètres` → `Intégrations` → `Webhooks & API`.
2. Clique sur `Ajouter un webhook`.
3. Renseigne :
   - **URL du webhook** : `https://sokdytywaipifrjcitcg.supabase.co/functions/v1/create-user`
   - **Méthode** : `POST`
   - **En-têtes personnalisés** :
     - `Authorization: Bearer <EDGE_FUNCTION_SECRET>`
     - `Content-Type: application/json`
   - **Événements à surveiller** : cocher les événements d’achat/upsell pour lesquels tu veux créer un compte (`Order success`, `Subscription payment`, etc.).
4. Sauvegarde.

### 5. Payload attendu
La fonction s’attend à recevoir un JSON contenant au minimum :
```json
{
  "email": "client@example.com",
  "firstName": "Alice",
  "lastName": "Durand",
  "product_id": "thrive_product_id",
  "order_id": "123456"
}
```
> Les clés exactes peuvent varier selon ton implémentation. Vérifie la fonction `supabase/functions/create-user/index.ts` pour adapter le mapping ThriveCart → Supabase.

### 6. Test manuel
Utilise `curl` pour simuler une requête :
```bash
curl -X POST https://sokdytywaipifrjcitcg.supabase.co/functions/v1/create-user \
  -H "Authorization: Bearer <EDGE_FUNCTION_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","firstName":"Alice","lastName":"Durand","product_id":"prod1"}'
```
La fonction doit renvoyer un statut 200 ou 201 si la création est réussie. Vérifie ensuite dans Supabase (`auth.users` et tables liées) que l’utilisateur a été ajouté.

### 7. Suivi et logs
- Supabase CLI : `supabase functions logs create-user --project-ref sokdytywaipifrjcitcg` pour inspecter les requêtes.
- Dashboard Supabase → `Logs` → filtre `Edge Functions`.
- ThriveCart : section `Logs webhook` pour vérifier les réponses (succès/erreur).

### 8. Dépannage
- **401 Unauthorized** : mauvais secret ou en-tête manquant ; rafraîchir la clé dans Supabase et ThriveCart.
- **Validation échoue** : vérifier le corps JSON envoyé par ThriveCart (`logs`).
- **Pas de création dans Supabase** : vérifier les RLS/Triggers et que la fonction utilise bien la `service_role key`.
- **Double slash dans les URL** : s’assurer que ThriveCart n’ajoute pas de slash à la fin. L’URL doit être exactement `https://sokdytywaipifrjcitcg.supabase.co/functions/v1/create-user`.

### 9. Bonnes pratiques
- Regénérer périodiquement la clé Bearer et la mettre à jour dans ThriveCart.
- Surveiller les erreurs via alertes (Supabase Log drain ou webhook).
- Documenter dans Supabase/Notion qui possède la clé et l’URL pour éviter les fuites.

### 10. Ressources
- Supabase Edge Functions : https://supabase.com/docs/guides/functions
- ThriveCart Webhooks : https://support.thrivecart.com/help/webhooks/


