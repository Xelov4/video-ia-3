Je veux créer une page qui va pouvoir mettre à jour automatiquement le contenu de la table Tool
Et cette logique-là, en fait, elle va prendre ces informations-là du tool qui sont les champs de base en anglais du tool. 


1 - Etape 1 (HttpStatus - isActive) tester la page et en fonction du code réponse, renseigner le httpStatus avec le code HTTP recu par la requete. Si l'url ne fonctionne pas c'est a dire qu'elle n'est pas en 200 ou 3XX alors il faut mettre à jour le champ isActive du tool en "false" et le processus s'arrete la. Si en revanche l'url fonctionne bien en 200 ou 300, alors il faut biensur mettre à jour le httpStatus code avec le bon code reponse reçu, c'est important de faire la distinction . tu pousse les infos dans la DB
2 - Etape 2 (Crawling) c'est de crawler les 50 premiere pages du tool et d'enregistrer le tout dans un dossier temporaire que tu vas créer et qui s'appellera "temporary.$toolname" 
3 - Etape 3 (Social Network) L'étape 1 est de Prendre tout ce contenu et le parser afin de trouver les liens vers les réseaux sociaux qui sont les suivant :  
    socialLinkedin    String?           @map("social_linkedin") @db.Text
    socialFacebook    String?           @map("social_facebook") @db.Text
    socialX           String?           @map("social_x") @db.Text
    socialGithub      String?           @map("social_github") @db.Text
    socialDiscord     String?           @map("social_discord") @db.Text
    socialInstagram   String?           @map("social_instagram") @db.Text
    socialTiktok      String?           @map("social_tiktok") @db.Text
Tu fini cette étape par pousser ces informations dans la DB pour le tool en question.
4 - Etape 4 (useful links) L'étape 4 consiste a Parser de nouveau tout le contenu que tu aura crawler et enregistré pour une adresse mail, la documentation du tool, un lien affilié, la derniere date de mise à jour du logiciel, voici les champs : 
    mailAddress       String?           @map("mail_address") @db.VarChar(255)
    docsLink          String?           @map("docs_link") @db.Text
    affiliateLink     String?           @map("affiliate_link") @db.Text 
    changelogLink     String?           @map("changelog_link") @db.Text
Tu fini cette étape par pousser ces informations dans la DB pour le tool en question - si tu n'as pas de nouvelle informations ou si l'information que tu as est deja en doublon, tu ne fais rien. 
5 - Etape 5 - Rédaction du contenu. Tu vas de nouveau parser le contenu pour rédiger un contenu en Anglais. Voici les guidelines pour le contenu à rédiger. "Tu es un journaliste passioné de Tools IA et de technologies, tu as 28ans et tu aime parler directement à ton audience tout en la respectant et en portant beaucoup d'attention a la qualité et la clarté de l'information que tu donne. Tu essaye constemment de donner des précisions supplémentaire et exemples pour digger plus profondement les sujets. Voici une un lot de plusieurs pages web concernant l'outil $toolname, je veux que tu m'écrive un article qui explique ce qu'est cet outil, à quoi il sert et pourquoi quelqu'un aimerais s'en servir. Je veux également que tu donne des raisons pour lesquels cet outil n'est pas le plus interessant, si jamais tu en trouve. tu n'a pas besoin de suivre ce brief à la lettre. Je veux que tu écrive minimum 300 mots répartis dans au moins 3 parties et pouvant aller jusqu'a 6. Utilise des titres H2 et utilise toujours "What's $toolName ?", pour les autres titres je te laisse choisir.".
    une fois ce contenu rédiger, je veux que tu mette à jour le champ :
    toolDescription   String?           @map("tool_description") @db.Text


    
toolName          
  toolCategory      String?           @map("tool_category") @db.VarChar(100)
  toolLink          String?           @map("tool_link") @db.Text
  overview          String?           @db.Text
  toolDescription   String?           @map("tool_description") @db.Text
  
  // ✅ GARDÉS - pour compatibilité code existant
  targetAudience    String?           @map("target_audience") @db.Text
  keyFeatures       String?           @map("key_features") @db.Text
  useCases          String?           @map("use_cases") @db.Text
  tags              String?           @db.Text // Garde le champ string pour compatibilité
  
  imageUrl          String?           @map("image_url") @db.Text
  isActive          Boolean?          @default(true) @map("is_active")
  quality_score     Decimal?          @default(0.0) @db.Decimal(4,2) // Changé en Decimal
  metaTitle         String?           @map("meta_title") @db.VarChar(255)
  metaDescription   String?           @map("meta_description") @db.Text

  // ✅ NOUVEAUX CHAMPS - Informations étendues
  pricingModel      PricingModel?     @map("pricing_model")
  httpStatusCode    Int?              @map("http_status_code")


  

  last_optimized_at DateTime?         @db.Timestamp(6)



  last_optimized_at DateTime?         @db.Timestamp(6)
      