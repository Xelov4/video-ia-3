/**
 * Système de Traductions Statiques UI - Video-IA.net
 *
 * Contient toutes les traductions pour l'interface utilisateur :
 * - Messages système (loading, erreurs, succès)
 * - Navigation et labels
 * - Formulaires et interactions
 * - Tooltips et aides contextuelles
 *
 * @author Video-IA.net Development Team
 */

import { SupportedLocale } from '@/middleware';

// Types pour les traductions
export interface UITranslations {
  // Navigation
  nav: {
    home: string;
    tools: string;
    categories: string;
    about: string;
    search_placeholder: string;
    menu: string;
    close: string;
    back: string;
    next: string;
    previous: string;
  };

  // Actions communes
  actions: {
    search: string;
    filter: string;
    sort: string;
    reset: string;
    apply: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    view: string;
    share: string;
    copy: string;
    download: string;
    loading: string;
    load_more: string;
  };

  // Messages système
  messages: {
    loading: string;
    loading_tools: string;
    loading_categories: string;
    no_results: string;
    no_tools_found: string;
    no_categories_found: string;
    error_generic: string;
    error_network: string;
    error_not_found: string;
    success_generic: string;
    success_saved: string;
    success_copied: string;
    try_again: string;
  };

  // Formulaires
  forms: {
    required: string;
    invalid_email: string;
    invalid_url: string;
    min_length: string;
    max_length: string;
    search_hint: string;
    email_placeholder: string;
    name_placeholder: string;
    message_placeholder: string;
    submit: string;
    submitting: string;
  };

  // Filtres et tri
  filters: {
    all_categories: string;
    featured_only: string;
    sort_by: string;
    sort_name: string;
    sort_date: string;
    sort_popularity: string;
    sort_rating: string;
    clear_filters: string;
    show_results: string;
  };

  // Outils et catégories
  tools: {
    tool: string;
    tools: string;
    ai_tool: string;
    ai_tools: string;
    featured_tools: string;
    popular_tools: string;
    new_tools: string;
    category: string;
    categories: string;
    view_count: string;
    rating: string;
    visit_tool: string;
    official_website: string;
    tool_details: string;
    similar_tools: string;
    tools_count: string;
  };

  // Dates et temps
  time: {
    just_now: string;
    minutes_ago: string;
    hours_ago: string;
    days_ago: string;
    weeks_ago: string;
    months_ago: string;
    years_ago: string;
    created_at: string;
    updated_at: string;
  };

  // Pagination
  pagination: {
    page: string;
    of: string;
    results: string;
    showing: string;
    to: string;
    first_page: string;
    last_page: string;
    items_per_page: string;
  };

  // Footer
  footer: {
    description: string;
    quick_links: string;
    categories: string;
    resources: string;
    connect: string;
    legal: string;
    privacy_policy: string;
    terms_of_service: string;
    contact_us: string;
    all_rights_reserved: string;
  };

  // Language switcher
  language: {
    choose_language: string;
    current_language: string;
    language_saved: string;
    auto_detect: string;
  };

  // SEO et métadonnées
  seo: {
    meta_description_suffix: string;
    page_not_found: string;
    go_home: string;
    share_on: string;
  };

  // Breadcrumb navigation
  breadcrumb: {
    home: string;
    tools: string;
    categories: string;
    tool_detail: string;
    category_tools: string;
    search_results: string;
    page: string;
  };
}

// Traductions par langue
export const translations: Record<SupportedLocale, UITranslations> = {
  en: {
    nav: {
      home: 'Home',
      tools: 'AI Tools',
      categories: 'Categories',
      about: 'About',
      search_placeholder: 'Search AI tools...',
      menu: 'Menu',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
    },
    actions: {
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      reset: 'Reset',
      apply: 'Apply',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      share: 'Share',
      copy: 'Copy',
      download: 'Download',
      loading: 'Loading...',
      load_more: 'Load More',
    },
    messages: {
      loading: 'Loading...',
      loading_tools: 'Loading AI tools...',
      loading_categories: 'Loading categories...',
      no_results: 'No results found',
      no_tools_found: 'No AI tools found',
      no_categories_found: 'No categories found',
      error_generic: 'Something went wrong',
      error_network: 'Network error. Please check your connection.',
      error_not_found: 'Page not found',
      success_generic: 'Operation completed successfully',
      success_saved: 'Changes saved successfully',
      success_copied: 'Copied to clipboard',
      try_again: 'Try again',
    },
    forms: {
      required: 'This field is required',
      invalid_email: 'Please enter a valid email address',
      invalid_url: 'Please enter a valid URL',
      min_length: 'Minimum length is {min} characters',
      max_length: 'Maximum length is {max} characters',
      search_hint: 'Try searching for "video editing", "chatbot", or "design"',
      email_placeholder: 'Enter your email address',
      name_placeholder: 'Enter your full name',
      message_placeholder: 'Enter your message',
      submit: 'Submit',
      submitting: 'Submitting...',
    },
    filters: {
      all_categories: 'All Categories',
      featured_only: 'Featured Only',
      sort_by: 'Sort By',
      sort_name: 'Name',
      sort_date: 'Date Added',
      sort_popularity: 'Popularity',
      sort_rating: 'Rating',
      clear_filters: 'Clear Filters',
      show_results: 'Show Results',
    },
    tools: {
      tool: 'Tool',
      tools: 'Tools',
      ai_tool: 'AI Tool',
      ai_tools: 'AI Tools',
      featured_tools: 'Featured Tools',
      popular_tools: 'Popular Tools',
      new_tools: 'New Tools',
      category: 'Category',
      categories: 'Categories',
      view_count: 'Views',
      rating: 'Rating',
      visit_tool: 'Visit Tool',
      official_website: 'Official Website',
      tool_details: 'Tool Details',
      similar_tools: 'Similar Tools',
      tools_count: '{count} tools',
    },
    time: {
      just_now: 'Just now',
      minutes_ago: '{count} minutes ago',
      hours_ago: '{count} hours ago',
      days_ago: '{count} days ago',
      weeks_ago: '{count} weeks ago',
      months_ago: '{count} months ago',
      years_ago: '{count} years ago',
      created_at: 'Created at',
      updated_at: 'Updated at',
    },
    pagination: {
      page: 'Page',
      of: 'of',
      results: 'results',
      showing: 'Showing',
      to: 'to',
      first_page: 'First page',
      last_page: 'Last page',
      items_per_page: 'Items per page',
    },
    footer: {
      description:
        'Discover the best AI tools for video creation, editing, and automation. Your comprehensive directory for AI-powered solutions.',
      quick_links: 'Quick Links',
      categories: 'Categories',
      resources: 'Resources',
      connect: 'Connect',
      legal: 'Legal',
      privacy_policy: 'Privacy Policy',
      terms_of_service: 'Terms of Service',
      contact_us: 'Contact Us',
      all_rights_reserved: 'All rights reserved',
    },
    language: {
      choose_language: 'Choose Language',
      current_language: 'Current Language',
      language_saved: 'Language preference saved',
      auto_detect: 'Auto-detect',
    },
    seo: {
      meta_description_suffix: 'Best AI tools directory',
      page_not_found: 'Page not found',
      go_home: 'Go Home',
      share_on: 'Share on',
    },
    breadcrumb: {
      home: 'Home',
      tools: 'AI Tools',
      categories: 'Categories',
      tool_detail: 'Tool Details',
      category_tools: 'Category Tools',
      search_results: 'Search Results',
      page: 'Page',
    },
  },

  fr: {
    nav: {
      home: 'Accueil',
      tools: 'Outils IA',
      categories: 'Catégories',
      about: 'À propos',
      search_placeholder: 'Rechercher un outil IA...',
      menu: 'Menu',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
    },
    actions: {
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      reset: 'Réinitialiser',
      apply: 'Appliquer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      share: 'Partager',
      copy: 'Copier',
      download: 'Télécharger',
      loading: 'Chargement...',
      load_more: 'Charger plus',
    },
    messages: {
      loading: 'Chargement...',
      loading_tools: 'Chargement des outils IA...',
      loading_categories: 'Chargement des catégories...',
      no_results: 'Aucun résultat trouvé',
      no_tools_found: 'Aucun outil IA trouvé',
      no_categories_found: 'Aucune catégorie trouvée',
      error_generic: "Une erreur s'est produite",
      error_network: 'Erreur réseau. Vérifiez votre connexion.',
      error_not_found: 'Page non trouvée',
      success_generic: 'Opération réussie',
      success_saved: 'Modifications enregistrées',
      success_copied: 'Copié dans le presse-papiers',
      try_again: 'Réessayer',
    },
    forms: {
      required: 'Ce champ est obligatoire',
      invalid_email: 'Veuillez saisir une adresse e-mail valide',
      invalid_url: 'Veuillez saisir une URL valide',
      min_length: 'Longueur minimale : {min} caractères',
      max_length: 'Longueur maximale : {max} caractères',
      search_hint: 'Essayez "montage vidéo", "chatbot", ou "design"',
      email_placeholder: 'Saisissez votre adresse e-mail',
      name_placeholder: 'Saisissez votre nom complet',
      message_placeholder: 'Saisissez votre message',
      submit: 'Envoyer',
      submitting: 'Envoi en cours...',
    },
    filters: {
      all_categories: 'Toutes les catégories',
      featured_only: 'Mis en avant uniquement',
      sort_by: 'Trier par',
      sort_name: 'Nom',
      sort_date: "Date d'ajout",
      sort_popularity: 'Popularité',
      sort_rating: 'Note',
      clear_filters: 'Effacer les filtres',
      show_results: 'Afficher les résultats',
    },
    tools: {
      tool: 'Outil',
      tools: 'Outils',
      ai_tool: 'Outil IA',
      ai_tools: 'Outils IA',
      featured_tools: 'Outils en vedette',
      popular_tools: 'Outils populaires',
      new_tools: 'Nouveaux outils',
      category: 'Catégorie',
      categories: 'Catégories',
      view_count: 'Vues',
      rating: 'Note',
      visit_tool: "Visiter l'outil",
      official_website: 'Site officiel',
      tool_details: "Détails de l'outil",
      similar_tools: 'Outils similaires',
      tools_count: '{count} outils',
    },
    time: {
      just_now: "À l'instant",
      minutes_ago: 'il y a {count} minutes',
      hours_ago: 'il y a {count} heures',
      days_ago: 'il y a {count} jours',
      weeks_ago: 'il y a {count} semaines',
      months_ago: 'il y a {count} mois',
      years_ago: 'il y a {count} ans',
      created_at: 'Créé le',
      updated_at: 'Modifié le',
    },
    pagination: {
      page: 'Page',
      of: 'sur',
      results: 'résultats',
      showing: 'Affichage de',
      to: 'à',
      first_page: 'Première page',
      last_page: 'Dernière page',
      items_per_page: 'Éléments par page',
    },
    footer: {
      description:
        "Découvrez les meilleurs outils IA pour la création vidéo, l'édition et l'automatisation. Votre répertoire complet de solutions IA.",
      quick_links: 'Liens rapides',
      categories: 'Catégories',
      resources: 'Ressources',
      connect: 'Connexion',
      legal: 'Légal',
      privacy_policy: 'Politique de confidentialité',
      terms_of_service: "Conditions d'utilisation",
      contact_us: 'Nous contacter',
      all_rights_reserved: 'Tous droits réservés',
    },
    language: {
      choose_language: 'Choisir la langue',
      current_language: 'Langue actuelle',
      language_saved: 'Préférence de langue sauvegardée',
      auto_detect: 'Détection automatique',
    },
    seo: {
      meta_description_suffix: "Meilleur répertoire d'outils IA",
      page_not_found: 'Page non trouvée',
      go_home: "Retour à l'accueil",
      share_on: 'Partager sur',
    },
    breadcrumb: {
      home: 'Accueil',
      tools: 'Outils IA',
      categories: 'Catégories',
      tool_detail: "Détails de l'outil",
      category_tools: 'Outils de catégorie',
      search_results: 'Résultats de recherche',
      page: 'Page',
    },
  },

  es: {
    nav: {
      home: 'Inicio',
      tools: 'Herramientas IA',
      categories: 'Categorías',
      about: 'Acerca de',
      search_placeholder: 'Buscar herramientas IA...',
      menu: 'Menú',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
    },
    actions: {
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      reset: 'Restablecer',
      apply: 'Aplicar',
      cancel: 'Cancelar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      view: 'Ver',
      share: 'Compartir',
      copy: 'Copiar',
      download: 'Descargar',
      loading: 'Cargando...',
      load_more: 'Cargar más',
    },
    messages: {
      loading: 'Cargando...',
      loading_tools: 'Cargando herramientas IA...',
      loading_categories: 'Cargando categorías...',
      no_results: 'No se encontraron resultados',
      no_tools_found: 'No se encontraron herramientas IA',
      no_categories_found: 'No se encontraron categorías',
      error_generic: 'Algo salió mal',
      error_network: 'Error de red. Verifica tu conexión.',
      error_not_found: 'Página no encontrada',
      success_generic: 'Operación completada exitosamente',
      success_saved: 'Cambios guardados exitosamente',
      success_copied: 'Copiado al portapapeles',
      try_again: 'Intentar de nuevo',
    },
    forms: {
      required: 'Este campo es obligatorio',
      invalid_email: 'Por favor ingresa un email válido',
      invalid_url: 'Por favor ingresa una URL válida',
      min_length: 'Longitud mínima: {min} caracteres',
      max_length: 'Longitud máxima: {max} caracteres',
      search_hint: 'Prueba "edición de video", "chatbot", o "diseño"',
      email_placeholder: 'Ingresa tu dirección de email',
      name_placeholder: 'Ingresa tu nombre completo',
      message_placeholder: 'Ingresa tu mensaje',
      submit: 'Enviar',
      submitting: 'Enviando...',
    },
    filters: {
      all_categories: 'Todas las categorías',
      featured_only: 'Solo destacados',
      sort_by: 'Ordenar por',
      sort_name: 'Nombre',
      sort_date: 'Fecha agregada',
      sort_popularity: 'Popularidad',
      sort_rating: 'Calificación',
      clear_filters: 'Limpiar filtros',
      show_results: 'Mostrar resultados',
    },
    tools: {
      tool: 'Herramienta',
      tools: 'Herramientas',
      ai_tool: 'Herramienta IA',
      ai_tools: 'Herramientas IA',
      featured_tools: 'Herramientas destacadas',
      popular_tools: 'Herramientas populares',
      new_tools: 'Nuevas herramientas',
      category: 'Categoría',
      categories: 'Categorías',
      view_count: 'Vistas',
      rating: 'Calificación',
      visit_tool: 'Visitar herramienta',
      official_website: 'Sitio oficial',
      tool_details: 'Detalles de la herramienta',
      similar_tools: 'Herramientas similares',
      tools_count: '{count} herramientas',
    },
    time: {
      just_now: 'Justo ahora',
      minutes_ago: 'hace {count} minutos',
      hours_ago: 'hace {count} horas',
      days_ago: 'hace {count} días',
      weeks_ago: 'hace {count} semanas',
      months_ago: 'hace {count} meses',
      years_ago: 'hace {count} años',
      created_at: 'Creado en',
      updated_at: 'Actualizado en',
    },
    pagination: {
      page: 'Página',
      of: 'de',
      results: 'resultados',
      showing: 'Mostrando',
      to: 'a',
      first_page: 'Primera página',
      last_page: 'Última página',
      items_per_page: 'Elementos por página',
    },
    footer: {
      description:
        'Descubre las mejores herramientas IA para creación de videos, edición y automatización. Tu directorio completo de soluciones IA.',
      quick_links: 'Enlaces rápidos',
      categories: 'Categorías',
      resources: 'Recursos',
      connect: 'Conectar',
      legal: 'Legal',
      privacy_policy: 'Política de privacidad',
      terms_of_service: 'Términos de servicio',
      contact_us: 'Contáctanos',
      all_rights_reserved: 'Todos los derechos reservados',
    },
    language: {
      choose_language: 'Elegir idioma',
      current_language: 'Idioma actual',
      language_saved: 'Preferencia de idioma guardada',
      auto_detect: 'Detectar automáticamente',
    },
    seo: {
      meta_description_suffix: 'Mejor directorio de herramientas IA',
      page_not_found: 'Página no encontrada',
      go_home: 'Ir al inicio',
      share_on: 'Compartir en',
    },
    breadcrumb: {
      home: 'Inicio',
      tools: 'Herramientas IA',
      categories: 'Categorías',
      tool_detail: 'Detalles de la herramienta',
      category_tools: 'Herramientas de categoría',
      search_results: 'Resultados de búsqueda',
      page: 'Página',
    },
  },

  // Traductions italiennes, allemandes, néerlandaises et portugaises simplifiées pour l'espace
  it: {
    nav: {
      home: 'Home',
      tools: 'Strumenti IA',
      categories: 'Categorie',
      about: 'Chi siamo',
      search_placeholder: 'Cerca strumenti IA...',
      menu: 'Menu',
      close: 'Chiudi',
      back: 'Indietro',
      next: 'Avanti',
      previous: 'Precedente',
    },
    actions: {
      search: 'Cerca',
      filter: 'Filtra',
      sort: 'Ordina',
      reset: 'Ripristina',
      apply: 'Applica',
      cancel: 'Annulla',
      save: 'Salva',
      edit: 'Modifica',
      delete: 'Elimina',
      view: 'Visualizza',
      share: 'Condividi',
      copy: 'Copia',
      download: 'Scarica',
      loading: 'Caricamento...',
      load_more: 'Carica altro',
    },
    messages: {
      loading: 'Caricamento...',
      loading_tools: 'Caricamento strumenti IA...',
      loading_categories: 'Caricamento categorie...',
      no_results: 'Nessun risultato trovato',
      no_tools_found: 'Nessuno strumento IA trovato',
      no_categories_found: 'Nessuna categoria trovata',
      error_generic: 'Qualcosa è andato storto',
      error_network: 'Errore di rete. Controlla la connessione.',
      error_not_found: 'Pagina non trovata',
      success_generic: 'Operazione completata con successo',
      success_saved: 'Modifiche salvate con successo',
      success_copied: 'Copiato negli appunti',
      try_again: 'Riprova',
    },
    forms: {
      required: 'Questo campo è obbligatorio',
      invalid_email: 'Inserisci un indirizzo email valido',
      invalid_url: 'Inserisci un URL valido',
      min_length: 'Lunghezza minima: {min} caratteri',
      max_length: 'Lunghezza massima: {max} caratteri',
      search_hint: 'Prova "editing video", "chatbot", o "design"',
      email_placeholder: 'Inserisci il tuo indirizzo email',
      name_placeholder: 'Inserisci il tuo nome completo',
      message_placeholder: 'Inserisci il tuo messaggio',
      submit: 'Invia',
      submitting: 'Invio in corso...',
    },
    filters: {
      all_categories: 'Tutte le categorie',
      featured_only: 'Solo in evidenza',
      sort_by: 'Ordina per',
      sort_name: 'Nome',
      sort_date: 'Data aggiunta',
      sort_popularity: 'Popolarità',
      sort_rating: 'Valutazione',
      clear_filters: 'Cancella filtri',
      show_results: 'Mostra risultati',
    },
    tools: {
      tool: 'Strumento',
      tools: 'Strumenti',
      ai_tool: 'Strumento IA',
      ai_tools: 'Strumenti IA',
      featured_tools: 'Strumenti in evidenza',
      popular_tools: 'Strumenti popolari',
      new_tools: 'Nuovi strumenti',
      category: 'Categoria',
      categories: 'Categorie',
      view_count: 'Visualizzazioni',
      rating: 'Valutazione',
      visit_tool: 'Visita strumento',
      official_website: 'Sito ufficiale',
      tool_details: 'Dettagli strumento',
      similar_tools: 'Strumenti simili',
      tools_count: '{count} strumenti',
    },
    time: {
      just_now: 'Proprio ora',
      minutes_ago: '{count} minuti fa',
      hours_ago: '{count} ore fa',
      days_ago: '{count} giorni fa',
      weeks_ago: '{count} settimane fa',
      months_ago: '{count} mesi fa',
      years_ago: '{count} anni fa',
      created_at: 'Creato il',
      updated_at: 'Aggiornato il',
    },
    pagination: {
      page: 'Pagina',
      of: 'di',
      results: 'risultati',
      showing: 'Mostrando',
      to: 'a',
      first_page: 'Prima pagina',
      last_page: 'Ultima pagina',
      items_per_page: 'Elementi per pagina',
    },
    footer: {
      description:
        'Scopri i migliori strumenti IA per creazione video, editing e automazione. La tua directory completa di soluzioni IA.',
      quick_links: 'Link veloci',
      categories: 'Categorie',
      resources: 'Risorse',
      connect: 'Connetti',
      legal: 'Legale',
      privacy_policy: 'Privacy Policy',
      terms_of_service: 'Termini di Servizio',
      contact_us: 'Contattaci',
      all_rights_reserved: 'Tutti i diritti riservati',
    },
    language: {
      choose_language: 'Scegli lingua',
      current_language: 'Lingua attuale',
      language_saved: 'Preferenza lingua salvata',
      auto_detect: 'Rileva automaticamente',
    },
    seo: {
      meta_description_suffix: 'Miglior directory strumenti IA',
      page_not_found: 'Pagina non trovata',
      go_home: 'Vai alla home',
      share_on: 'Condividi su',
    },
    breadcrumb: {
      home: 'Home',
      tools: 'Strumenti IA',
      categories: 'Categorie',
      tool_detail: 'Dettagli strumento',
      category_tools: 'Strumenti di categoria',
      search_results: 'Risultati ricerca',
      page: 'Pagina',
    },
  },

  de: {
    nav: {
      home: 'Startseite',
      tools: 'KI-Tools',
      categories: 'Kategorien',
      about: 'Über uns',
      search_placeholder: 'KI-Tools suchen...',
      menu: 'Menü',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Vorherige',
    },
    actions: {
      search: 'Suchen',
      filter: 'Filter',
      sort: 'Sortieren',
      reset: 'Zurücksetzen',
      apply: 'Anwenden',
      cancel: 'Abbrechen',
      save: 'Speichern',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      view: 'Anzeigen',
      share: 'Teilen',
      copy: 'Kopieren',
      download: 'Herunterladen',
      loading: 'Laden...',
      load_more: 'Mehr laden',
    },
    messages: {
      loading: 'Laden...',
      loading_tools: 'KI-Tools laden...',
      loading_categories: 'Kategorien laden...',
      no_results: 'Keine Ergebnisse gefunden',
      no_tools_found: 'Keine KI-Tools gefunden',
      no_categories_found: 'Keine Kategorien gefunden',
      error_generic: 'Etwas ist schiefgelaufen',
      error_network: 'Netzwerkfehler. Prüfen Sie Ihre Verbindung.',
      error_not_found: 'Seite nicht gefunden',
      success_generic: 'Vorgang erfolgreich abgeschlossen',
      success_saved: 'Änderungen erfolgreich gespeichert',
      success_copied: 'In die Zwischenablage kopiert',
      try_again: 'Erneut versuchen',
    },
    forms: {
      required: 'Dieses Feld ist erforderlich',
      invalid_email: 'Bitte geben Sie eine gültige E-Mail ein',
      invalid_url: 'Bitte geben Sie eine gültige URL ein',
      min_length: 'Mindestlänge: {min} Zeichen',
      max_length: 'Maximale Länge: {max} Zeichen',
      search_hint: 'Versuchen Sie "Videobearbeitung", "Chatbot" oder "Design"',
      email_placeholder: 'E-Mail-Adresse eingeben',
      name_placeholder: 'Vollständigen Namen eingeben',
      message_placeholder: 'Nachricht eingeben',
      submit: 'Senden',
      submitting: 'Wird gesendet...',
    },
    filters: {
      all_categories: 'Alle Kategorien',
      featured_only: 'Nur hervorgehobene',
      sort_by: 'Sortieren nach',
      sort_name: 'Name',
      sort_date: 'Hinzugefügt am',
      sort_popularity: 'Beliebtheit',
      sort_rating: 'Bewertung',
      clear_filters: 'Filter löschen',
      show_results: 'Ergebnisse anzeigen',
    },
    tools: {
      tool: 'Tool',
      tools: 'Tools',
      ai_tool: 'KI-Tool',
      ai_tools: 'KI-Tools',
      featured_tools: 'Hervorgehobene Tools',
      popular_tools: 'Beliebte Tools',
      new_tools: 'Neue Tools',
      category: 'Kategorie',
      categories: 'Kategorien',
      view_count: 'Aufrufe',
      rating: 'Bewertung',
      visit_tool: 'Tool besuchen',
      official_website: 'Offizielle Website',
      tool_details: 'Tool-Details',
      similar_tools: 'Ähnliche Tools',
      tools_count: '{count} Tools',
    },
    time: {
      just_now: 'Gerade eben',
      minutes_ago: 'vor {count} Minuten',
      hours_ago: 'vor {count} Stunden',
      days_ago: 'vor {count} Tagen',
      weeks_ago: 'vor {count} Wochen',
      months_ago: 'vor {count} Monaten',
      years_ago: 'vor {count} Jahren',
      created_at: 'Erstellt am',
      updated_at: 'Aktualisiert am',
    },
    pagination: {
      page: 'Seite',
      of: 'von',
      results: 'Ergebnisse',
      showing: 'Zeige',
      to: 'bis',
      first_page: 'Erste Seite',
      last_page: 'Letzte Seite',
      items_per_page: 'Einträge pro Seite',
    },
    footer: {
      description:
        'Entdecken Sie die besten KI-Tools für Videoerstellung, Bearbeitung und Automatisierung. Ihr umfassendes Verzeichnis für KI-Lösungen.',
      quick_links: 'Schnelllinks',
      categories: 'Kategorien',
      resources: 'Ressourcen',
      connect: 'Verbinden',
      legal: 'Rechtliches',
      privacy_policy: 'Datenschutzrichtlinie',
      terms_of_service: 'Nutzungsbedingungen',
      contact_us: 'Kontaktieren Sie uns',
      all_rights_reserved: 'Alle Rechte vorbehalten',
    },
    language: {
      choose_language: 'Sprache wählen',
      current_language: 'Aktuelle Sprache',
      language_saved: 'Sprachpräferenz gespeichert',
      auto_detect: 'Automatisch erkennen',
    },
    seo: {
      meta_description_suffix: 'Bestes KI-Tools-Verzeichnis',
      page_not_found: 'Seite nicht gefunden',
      go_home: 'Zur Startseite',
      share_on: 'Teilen auf',
    },
    breadcrumb: {
      home: 'Startseite',
      tools: 'KI-Tools',
      categories: 'Kategorien',
      tool_detail: 'Tool-Details',
      category_tools: 'Kategorie-Tools',
      search_results: 'Suchergebnisse',
      page: 'Seite',
    },
  },

  nl: {
    nav: {
      home: 'Home',
      tools: 'AI Tools',
      categories: 'Categorieën',
      about: 'Over ons',
      search_placeholder: 'Zoek AI tools...',
      menu: 'Menu',
      close: 'Sluiten',
      back: 'Terug',
      next: 'Volgende',
      previous: 'Vorige',
    },
    actions: {
      search: 'Zoeken',
      filter: 'Filter',
      sort: 'Sorteren',
      reset: 'Reset',
      apply: 'Toepassen',
      cancel: 'Annuleren',
      save: 'Opslaan',
      edit: 'Bewerken',
      delete: 'Verwijderen',
      view: 'Bekijken',
      share: 'Delen',
      copy: 'Kopiëren',
      download: 'Downloaden',
      loading: 'Laden...',
      load_more: 'Meer laden',
    },
    messages: {
      loading: 'Laden...',
      loading_tools: 'AI tools laden...',
      loading_categories: 'Categorieën laden...',
      no_results: 'Geen resultaten gevonden',
      no_tools_found: 'Geen AI tools gevonden',
      no_categories_found: 'Geen categorieën gevonden',
      error_generic: 'Er is iets misgegaan',
      error_network: 'Netwerkfout. Controleer je verbinding.',
      error_not_found: 'Pagina niet gevonden',
      success_generic: 'Bewerking succesvol voltooid',
      success_saved: 'Wijzigingen succesvol opgeslagen',
      success_copied: 'Gekopieerd naar klembord',
      try_again: 'Probeer opnieuw',
    },
    forms: {
      required: 'Dit veld is verplicht',
      invalid_email: 'Voer een geldig e-mailadres in',
      invalid_url: 'Voer een geldige URL in',
      min_length: 'Minimale lengte: {min} karakters',
      max_length: 'Maximale lengte: {max} karakters',
      search_hint: 'Probeer "video editing", "chatbot", of "design"',
      email_placeholder: 'Voer je e-mailadres in',
      name_placeholder: 'Voer je volledige naam in',
      message_placeholder: 'Voer je bericht in',
      submit: 'Versturen',
      submitting: 'Versturen...',
    },
    filters: {
      all_categories: 'Alle categorieën',
      featured_only: 'Alleen uitgelicht',
      sort_by: 'Sorteren op',
      sort_name: 'Naam',
      sort_date: 'Toegevoegd op',
      sort_popularity: 'Populariteit',
      sort_rating: 'Beoordeling',
      clear_filters: 'Filters wissen',
      show_results: 'Resultaten tonen',
    },
    tools: {
      tool: 'Tool',
      tools: 'Tools',
      ai_tool: 'AI Tool',
      ai_tools: 'AI Tools',
      featured_tools: 'Uitgelichte tools',
      popular_tools: 'Populaire tools',
      new_tools: 'Nieuwe tools',
      category: 'Categorie',
      categories: 'Categorieën',
      view_count: 'Weergaven',
      rating: 'Beoordeling',
      visit_tool: 'Tool bezoeken',
      official_website: 'Officiële website',
      tool_details: 'Tool details',
      similar_tools: 'Vergelijkbare tools',
      tools_count: '{count} tools',
    },
    time: {
      just_now: 'Zojuist',
      minutes_ago: '{count} minuten geleden',
      hours_ago: '{count} uur geleden',
      days_ago: '{count} dagen geleden',
      weeks_ago: '{count} weken geleden',
      months_ago: '{count} maanden geleden',
      years_ago: '{count} jaar geleden',
      created_at: 'Gemaakt op',
      updated_at: 'Bijgewerkt op',
    },
    pagination: {
      page: 'Pagina',
      of: 'van',
      results: 'resultaten',
      showing: 'Toont',
      to: 'tot',
      first_page: 'Eerste pagina',
      last_page: 'Laatste pagina',
      items_per_page: 'Items per pagina',
    },
    footer: {
      description:
        'Ontdek de beste AI tools voor videocreatie, editing en automatisering. Je complete directory voor AI-oplossingen.',
      quick_links: 'Snelle links',
      categories: 'Categorieën',
      resources: 'Bronnen',
      connect: 'Verbinden',
      legal: 'Juridisch',
      privacy_policy: 'Privacybeleid',
      terms_of_service: 'Servicevoorwaarden',
      contact_us: 'Contact',
      all_rights_reserved: 'Alle rechten voorbehouden',
    },
    language: {
      choose_language: 'Kies taal',
      current_language: 'Huidige taal',
      language_saved: 'Taalvoorkeur opgeslagen',
      auto_detect: 'Automatisch detecteren',
    },
    seo: {
      meta_description_suffix: 'Beste AI tools directory',
      page_not_found: 'Pagina niet gevonden',
      go_home: 'Ga naar home',
      share_on: 'Delen op',
    },
    breadcrumb: {
      home: 'Home',
      tools: 'AI Tools',
      categories: 'Categorieën',
      tool_detail: 'Tool details',
      category_tools: 'Categorie tools',
      search_results: 'Zoekresultaten',
      page: 'Pagina',
    },
  },

  pt: {
    nav: {
      home: 'Início',
      tools: 'Ferramentas IA',
      categories: 'Categorias',
      about: 'Sobre',
      search_placeholder: 'Pesquisar ferramentas IA...',
      menu: 'Menu',
      close: 'Fechar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
    },
    actions: {
      search: 'Pesquisar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      reset: 'Redefinir',
      apply: 'Aplicar',
      cancel: 'Cancelar',
      save: 'Salvar',
      edit: 'Editar',
      delete: 'Excluir',
      view: 'Ver',
      share: 'Compartilhar',
      copy: 'Copiar',
      download: 'Baixar',
      loading: 'Carregando...',
      load_more: 'Carregar mais',
    },
    messages: {
      loading: 'Carregando...',
      loading_tools: 'Carregando ferramentas IA...',
      loading_categories: 'Carregando categorias...',
      no_results: 'Nenhum resultado encontrado',
      no_tools_found: 'Nenhuma ferramenta IA encontrada',
      no_categories_found: 'Nenhuma categoria encontrada',
      error_generic: 'Algo deu errado',
      error_network: 'Erro de rede. Verifique sua conexão.',
      error_not_found: 'Página não encontrada',
      success_generic: 'Operação concluída com sucesso',
      success_saved: 'Alterações salvas com sucesso',
      success_copied: 'Copiado para área de transferência',
      try_again: 'Tentar novamente',
    },
    forms: {
      required: 'Este campo é obrigatório',
      invalid_email: 'Digite um endereço de email válido',
      invalid_url: 'Digite uma URL válida',
      min_length: 'Comprimento mínimo: {min} caracteres',
      max_length: 'Comprimento máximo: {max} caracteres',
      search_hint: 'Tente "edição de vídeo", "chatbot", ou "design"',
      email_placeholder: 'Digite seu endereço de email',
      name_placeholder: 'Digite seu nome completo',
      message_placeholder: 'Digite sua mensagem',
      submit: 'Enviar',
      submitting: 'Enviando...',
    },
    filters: {
      all_categories: 'Todas as categorias',
      featured_only: 'Apenas em destaque',
      sort_by: 'Ordenar por',
      sort_name: 'Nome',
      sort_date: 'Data adicionada',
      sort_popularity: 'Popularidade',
      sort_rating: 'Avaliação',
      clear_filters: 'Limpar filtros',
      show_results: 'Mostrar resultados',
    },
    tools: {
      tool: 'Ferramenta',
      tools: 'Ferramentas',
      ai_tool: 'Ferramenta IA',
      ai_tools: 'Ferramentas IA',
      featured_tools: 'Ferramentas em destaque',
      popular_tools: 'Ferramentas populares',
      new_tools: 'Novas ferramentas',
      category: 'Categoria',
      categories: 'Categorias',
      view_count: 'Visualizações',
      rating: 'Avaliação',
      visit_tool: 'Visitar ferramenta',
      official_website: 'Site oficial',
      tool_details: 'Detalhes da ferramenta',
      similar_tools: 'Ferramentas similares',
      tools_count: '{count} ferramentas',
    },
    time: {
      just_now: 'Agora mesmo',
      minutes_ago: '{count} minutos atrás',
      hours_ago: '{count} horas atrás',
      days_ago: '{count} dias atrás',
      weeks_ago: '{count} semanas atrás',
      months_ago: '{count} meses atrás',
      years_ago: '{count} anos atrás',
      created_at: 'Criado em',
      updated_at: 'Atualizado em',
    },
    pagination: {
      page: 'Página',
      of: 'de',
      results: 'resultados',
      showing: 'Mostrando',
      to: 'a',
      first_page: 'Primeira página',
      last_page: 'Última página',
      items_per_page: 'Itens por página',
    },
    footer: {
      description:
        'Descubra as melhores ferramentas IA para criação de vídeos, edição e automação. Seu diretório completo de soluções IA.',
      quick_links: 'Links rápidos',
      categories: 'Categorias',
      resources: 'Recursos',
      connect: 'Conectar',
      legal: 'Legal',
      privacy_policy: 'Política de Privacidade',
      terms_of_service: 'Termos de Serviço',
      contact_us: 'Entre em contato',
      all_rights_reserved: 'Todos os direitos reservados',
    },
    language: {
      choose_language: 'Escolher idioma',
      current_language: 'Idioma atual',
      language_saved: 'Preferência de idioma salva',
      auto_detect: 'Detectar automaticamente',
    },
    seo: {
      meta_description_suffix: 'Melhor diretório de ferramentas IA',
      page_not_found: 'Página não encontrada',
      go_home: 'Ir para início',
      share_on: 'Compartilhar no',
    },
    breadcrumb: {
      home: 'Início',
      tools: 'Ferramentas IA',
      categories: 'Categorias',
      tool_detail: 'Detalhes da ferramenta',
      category_tools: 'Ferramentas da categoria',
      search_results: 'Resultados da pesquisa',
      page: 'Página',
    },
  },
};

/**
 * Hook pour utiliser les traductions
 */
export function useTranslations(language: SupportedLocale = 'en'): UITranslations {
  return translations[language] || translations.en;
}

/**
 * Fonction utilitaire pour interpoler les variables dans les traductions
 */
export function interpolate(
  text: string,
  variables: Record<string, string | number>
): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

/**
 * Fonction pour obtenir une traduction avec fallback
 */
export function t(
  language: SupportedLocale,
  key: string,
  variables: Record<string, string | number> = {}
): string {
  const keys = key.split('.');
  let value: any = translations[language] || translations.en;

  for (const k of keys) {
    value = value?.[k];
  }

  if (typeof value !== 'string') {
    // Fallback vers l'anglais si traduction manquante
    value = translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
  }

  if (typeof value === 'string') {
    return interpolate(value, variables);
  }

  return key; // Retourner la clé si aucune traduction trouvée
}
