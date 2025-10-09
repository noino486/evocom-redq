# 📋 Guide de Configuration des Influenceurs

Ce guide explique comment gérer les liens de paiement personnalisés pour chaque influenceur sur votre site.

## 🎯 Principe de fonctionnement

Chaque influenceur reçoit un lien unique avec un code partenaire :
- **Format** : `https://votresite.com?AF=NOMINFLUENCEUR`
- **Exemple** : `https://votresite.com?AF=BENJAMIN`

Lorsqu'un visiteur arrive avec ce lien, tous les boutons "Acheter" du site utiliseront automatiquement les pages de paiement personnalisées de cet influenceur.

## 🛠️ Méthode 1 : Interface d'Administration (Recommandée)

### Accès
1. Rendez-vous sur : `https://votresite.com/admin`
2. Mot de passe : `evocom2024`

### Actions disponibles
- ✅ **Ajouter un influenceur** : Nom + 2 liens de paiement (un par produit)
- ✅ **Modifier les liens** d'un influenceur existant
- ✅ **Supprimer un influenceur**
- ✅ **Modifier les pages par défaut** (sans code AF)
- ✅ **Sauvegarder** la configuration

### Étapes pour ajouter un influenceur
1. Remplissez les 3 champs :
   - **Nom** : Le code de l'influenceur (ex: BENJAMIN)
   - **Lien Global Sourcing Pack** : L'URL de paiement pour le pack 1
   - **Lien Visionnaire Pack** : L'URL de paiement pour le pack 2
2. Cliquez sur **"Ajouter l'influenceur"**
3. Cliquez sur **"Sauvegarder la configuration"**

## 📁 Méthode 2 : Modification Manuelle du Fichier JSON

### Emplacement du fichier
```
public/config/affiliates.json
```

### Structure du fichier

```json
{
  "affiliates": {
    "BENJAMIN": {
      "STFOUR": "https://lien-benjamin-pack1.com",
      "GLBNS": "https://lien-benjamin-pack2.com"
    },
    "MARIE": {
      "STFOUR": "https://lien-marie-pack1.com",
      "GLBNS": "https://lien-marie-pack2.com"
    }
  },
  "defaultPages": {
    "STFOUR": "https://lien-par-defaut-pack1.com",
    "GLBNS": "https://lien-par-defaut-pack2.com"
  }
}
```

### Légende
- **STFOUR** : Global Sourcing Pack (29.99€)
- **GLBNS** : Visionnaire Pack (39.99€)
- **affiliates** : Liste des influenceurs et leurs liens personnalisés
- **defaultPages** : Pages utilisées quand aucun code AF n'est présent

### Exemple d'ajout d'un influenceur

```json
{
  "affiliates": {
    "BENJAMIN": {
      "STFOUR": "https://triumtrade.thrivecart.com/starter-benjamin/",
      "GLBNS": "https://triumtrade.thrivecart.com/visionnaire-benjamin/"
    },
    "NOUVEAU_INFLUENCEUR": {
      "STFOUR": "https://triumtrade.thrivecart.com/starter-nouveau/",
      "GLBNS": "https://triumtrade.thrivecart.com/visionnaire-nouveau/"
    }
  },
  "defaultPages": {
    "STFOUR": "https://triumtrade.thrivecart.com/starter-fournisseurs-og/",
    "GLBNS": "https://triumtrade.thrivecart.com/global-business-og/"
  }
}
```

## 🔄 Mise à jour de la configuration

### Après modification de l'interface admin
- ✅ La configuration est **automatiquement sauvegardée**
- ✅ Les changements sont **actifs immédiatement**

### Après modification du fichier JSON
1. Sauvegardez le fichier `affiliates.json`
2. **Rechargez la page** (F5 ou Ctrl+R)
3. La nouvelle configuration est chargée automatiquement

## 📊 Codes Produits

| ID Produit | Nom Commercial | Prix |
|------------|----------------|------|
| STFOUR | Global Sourcing Pack | 29.99€ TTC |
| GLBNS | Visionnaire Pack | 39.99€ TTC |

## 🧪 Test de la Configuration

### Pour tester un influenceur :
1. Visitez : `https://votresite.com?AF=NOMINFLUENCEUR`
2. Vous verrez un **badge vert** en haut indiquant le code actif
3. Cliquez sur un bouton "Acheter"
4. Vérifiez que vous êtes redirigé vers le bon lien de paiement

### URLs de test :
- Sans code : `https://votresite.com` → Pages par défaut
- Avec BENJAMIN : `https://votresite.com?AF=BENJAMIN`
- Avec MARIE : `https://votresite.com?AF=MARIE`

## 🎨 Indicateurs Visuels

Quand un code partenaire est actif, le visiteur verra :
- ✅ **Badge vert** sur la page d'accueil : "Code partenaire actif : BENJAMIN"
- ✅ **Badge sur la page produit** : Indique quel code est utilisé
- ✅ Les boutons "Acheter" redirigent automatiquement vers les liens personnalisés

## ⚠️ Important

- Les **noms d'influenceurs** sont automatiquement en MAJUSCULES
- Le code **AF=benjamin** devient **BENJAMIN**
- Le code **persiste** : si l'utilisateur navigue sur le site, le code reste actif
- Le code est **sauvegardé** dans le navigateur (localStorage)

## 🔐 Sécurité

### Mot de passe admin
Pour changer le mot de passe de l'interface admin :
1. Ouvrez `src/pages/Admin.jsx`
2. Ligne 18 : `const ADMIN_PASSWORD = 'evocom2024'`
3. Changez la valeur par votre nouveau mot de passe
4. Sauvegardez et redéployez

## 🚀 Déploiement

Après modification du fichier `affiliates.json` ou de l'interface admin :
1. **En développement** : Les changements sont immédiats
2. **En production** : 
   - Modifiez le fichier sur le serveur
   - OU utilisez l'interface admin
   - Pas besoin de rebuild/redéployer

## 📞 Support

Pour toute question ou problème :
- Vérifiez que le fichier JSON est **bien formaté** (utilisez un validateur JSON)
- Vérifiez que les **URLs sont complètes** (commencent par https://)
- Vérifiez que les **codes produits** sont corrects (STFOUR, GLBNS)
- Consultez la console du navigateur (F12) pour voir les erreurs éventuelles

---

**Date de création** : Octobre 2024  
**Version** : 1.0

