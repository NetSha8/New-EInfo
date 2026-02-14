---
title: "Pourquoi j'ai choisi Astro pour mon site en 2026"
excerpt: "Astro, c'est simple : zéro JavaScript inutile, un deploiement ultra facile, et des scores Lighthouse proches de 100. Voilà pourquoi je l'ai adopté pour mes sites vitrines."
date: "2026-02-05"
readTime: "12 min"
category: "Développement"
tags: ["Astro", "Performance", "SSG", "Déploiement", "Intégrations"]
---

Pendant longtemps, j'ai utilisé les frameworks classiques comme React pour construire mes sites. Puis j'ai découvert Astro, et franchement, ça a changé ma façon de faire. Avant, je me posais toujours des questions : pourquoi mon site vitrine envoie 300 KB de JavaScript ? Pourquoi le Lighthouse dit que c'est pas assez rapide pour un site qui n'affiche que du texte et des images ?

Astro répond à ça directement. Son concept est simple : envoyer du HTML statique, sans JavaScript inutile. Point.

## Le problème dont personne ne parle vraiment

Quand tu utilises React ou Vue pour faire un site vitrine, tu hérites de tout ce qui vient avec : le virtual DOM, l'hydration, le state management — des trucs super utiles pour une app complexe, mais complètement overkill pour afficher un portfolio ou un blog.

Résultat ? Ton site est lent. Les gens attendent 2-3 secondes avant de voir quelque chose. Sur mobile, c'est encore pire. Et Google remarque tout ça — tes scores Lighthouse chutent, ton SEO en souffre.

## Comment Astro résout ça

Astro utilise une approche qu'ils appellent les "Islands". L'idée : ta page est rendue en HTML statique par défaut. Vraiment statique, vraiment rapide. Et si tu as besoin d'un truc interactif ? Un formulaire, une animation, un carousel ? Là, tu ajoutes un composant React ou Svelte juste pour cette partie.

C'est bête simple, mais ça marche du tonnerre :

```astro
---
// La plupart des composants : juste du HTML
import Header from '../components/Header.astro';
import HeroSection from '../components/Hero.astro';
import Services from '../components/Services.astro';

// Que les éléments interactifs en React/Svelte/Vue
import ContactForm from '../components/ContactForm.tsx';
---

<Header />
<HeroSection />
<Services />

<!-- Ici, le formulaire va être interactif -->
<ContactForm client:load />
<!-- Tout le reste ? Du HTML pur, zéro JS -->
```

Voilà. C'est tout ce qu'il faut savoir. La page charge super vite parce qu'elle est 99% HTML. Pas de JavaScript à parser, pas de hydration à faire.

## Les chiffres parlent d'eux-mêmes

Quand j'ai lancé mon site avec Astro, voici ce que j'ai obtenu : un score Performance Lighthouse de 98/100 sans vraiment optimiser, un premier affichage en moins de 0.5s, 40 KB de JavaScript total (comparé aux 200-300 KB avec React), et zéro Cumulative Layout Shift.

Sur 4G depuis un téléphone à 200€, ça charge en 1 seconde. C'est ça qui change tout pour le SEO et l'expérience utilisateur.

## Mélanger les frameworks, c'est autorisé

L'autre truc cool avec Astro : tu n'es pas enfermé dans un seul framework. Si tu as un composant React existant, tu peux l'importer. Si tu trouves un composant Svelte de ouf, vas-y. C'est du vrai multi-framework sans complications :

```astro
---
// React pour le carrousel
import ReactCarousel from './ReactCarousel.jsx';
// Vue pour l'interface complexe
import VueInterface from './VueInterface.vue';
// Svelte parce que c'est sympa
import SvelteWidget from './SvelteWidget.svelte';
---

<ReactCarousel client:idle />
<VueInterface client:load />
<SvelteWidget client:visible />
```

Tu n'es pas obligé de tout réécrire dans le même framework. Tu peux vraiment mixer.

## Déploiement, c'est une blague

Franchement, c'est mon préféré. Avec Netlify, tu fais juste ça : tu push ton code sur GitHub, et Netlify détecte automatiquement que c'est de l'Astro. Build, déploiement, HTTPS, CDN global — tout se fait tout seul.

```bash
git add .
git commit -m "Mon nouveau site Astro"
git push origin main
# Et voilà, dans 2 minutes ton site est live
```

Pas de configuration mystérieuse. Pas de build qui échoue. Si tu veux, tu peux ajouter un fichier `netlify.toml` pour plus de contrôle :

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Mais honnêtement, c'est pas nécessaire pour commencer. Même Vercel et Cloudflare Pages détectent Astro et le déploient correctement en deux secondes.

## Les thèmes : partir d'une base solide

Pas envie de partir de zéro ? Il y a des dizaines de thèmes Astro prêts à l'emploi. Je ne veux pas télécharger un template bizarre avec du code morte partout, donc je regarde sur [astro.build/themes](https://astro.build/themes) — c'est des vrais thèmes maintenus par la communauté.

Un portfolio, un blog, un site vitrine — tout est là. Tu clones, tu personnalises, c'est bon :

```bash
git clone https://github.com/un-theme-astro.git
cd un-theme-astro
npm install
npm run dev
# Boom, tu as une base de travail
```

## Les intégrations : l'écosystème qui faut

Astro permet facilement d'intégrer des trucs externes. Avec les images optimisées, Astro peut compresser et optimiser automatiquement tes images — moins de temps de chargement, c'est du gratuit. Pour les CMS headless, si tu veux gérer le contenu ailleurs (Contentful, Sanity, Strapi), Astro peut récupérer ça et générer des pages statiques — parfait pour un blog évolutif sans redéployer constamment.

Tu peux ajouter de l'interactivité React, Vue ou Svelte juste où tu en as besoin, vraiment pratique. Pour les données, tu peux connecter Supabase, Firebase, ou n'importe quelle base pour récupérer des infos au build — idéal pour les listes de projets ou les prix. L'analytics, c'est Fathom, Plausible, ou d'autres outils légers qui ne ralentissent pas ton site. Oublie Google Analytics sur un site performance-first. Les formulaires ? Netlify Forms, Formspree, ou Basin suffisent — pas besoin d'un backend compliqué pour capturer ses données.

Tu peux vraiment composer ton stack comme tu veux.

## Ressources utiles

Si tu veux en savoir plus, va voir [docs.astro.build](https://docs.astro.build) — c'est la bible avec des exemples concrets. Pour les thèmes gratuits et professionnels, [astro.build/themes](https://astro.build/themes) c'est l'endroit. Et si tu as besoin de support ou simplement d'échanger avec d'autres, [discord.gg/astro](https://discord.gg/astro) — la communauté est super active et accueillante.

## Astro n'est pas pour tout

Soyons honnêtes : si tu construis une app real-time complexe (genre un éditeur collaboratif ou un dashboard avec du WebSocket), Astro n'est pas ton truc. Va voir du Next.js ou SvelteKit.

Mais si tu veux juste un site vitrine, un blog, un portfolio ou une landing page ? Astro te fera économiser des heures, et ton site sera 10 fois plus rapide.

## Pour finir

Je suis passé à Astro il y a quelques mois, et franchement je ne reviendrais pas. Les sites chargent en une seconde, le déploiement est trivial, et j'ai jamais eu à penser aux performances — c'est magique.

C'est rare d'avoir un outil aussi puissant qui simplifie vraiment les choses. Si tu dois construire un site, essaie Astro. Tu vas peut-être trouver ton nouveau framework préféré.
