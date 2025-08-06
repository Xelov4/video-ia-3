const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'video_ia_net',
  user: process.env.DB_USER || 'video_ia_user',
  password: process.env.DB_PASSWORD || 'video_ia_dev_2024',
  ssl: false
});

async function showToolExample() {
  try {
    console.log('🔍 Recherche d\'un exemple d\'outil complet...\n');
    
    const client = await pool.connect();
    
    // Récupérer un outil avec toutes ses données
    const toolResult = await client.query(`
      SELECT 
        t.id,
        t.slug,
        t.official_url,
        t.logo_url,
        t.pricing_model,
        t.status,
        t.featured,
        t.quality_score,
        t.view_count,
        t.click_count,
        t.created_at,
        t.updated_at,
        tt.name,
        tt.overview,
        tt.description,
        tt.key_features,
        tt.use_cases,
        tt.target_users,
        tt.meta_title,
        tt.meta_description,
        tt.ai_generated,
        tt.translation_source
      FROM tools t
      JOIN tool_translations tt ON t.id = tt.tool_id
      WHERE tt.language_id = 'en'
      AND tt.name IS NOT NULL
      AND tt.name != ''
      LIMIT 1
    `);
    
    if (toolResult.rows.length === 0) {
      console.log('❌ Aucun outil trouvé');
      return;
    }
    
    const tool = toolResult.rows[0];
    
    console.log('📋 EXEMPLE COMPLET D\'OUTIL');
    console.log('================================');
    console.log('');
    
    // Informations de base
    console.log('🆔 INFORMATIONS DE BASE');
    console.log('ID:', tool.id);
    console.log('Slug:', tool.slug);
    console.log('Nom:', tool.name);
    console.log('URL officielle:', tool.official_url);
    console.log('Logo URL:', tool.logo_url || 'Non défini');
    console.log('');
    
    // Modèle de prix et statut
    console.log('💰 MODÈLE DE PRIX & STATUT');
    console.log('Modèle de prix:', tool.pricing_model);
    console.log('Statut:', tool.status);
    console.log('Mis en avant:', tool.featured ? 'Oui' : 'Non');
    console.log('Score de qualité:', tool.quality_score);
    console.log('');
    
    // Statistiques
    console.log('📊 STATISTIQUES');
    console.log('Vues:', tool.view_count);
    console.log('Clics:', tool.click_count);
    console.log('Créé le:', tool.created_at);
    console.log('Mis à jour le:', tool.updated_at);
    console.log('');
    
    // Contenu
    console.log('📝 CONTENU');
    console.log('Aperçu:', tool.overview);
    console.log('');
    console.log('Description complète:');
    console.log(tool.description);
    console.log('');
    
    // Fonctionnalités clés
    if (tool.key_features && tool.key_features.length > 0) {
      console.log('🔧 FONCTIONNALITÉS CLÉS');
      tool.key_features.forEach((feature, index) => {
        console.log(`${index + 1}. ${feature}`);
      });
      console.log('');
    }
    
    // Cas d'usage
    if (tool.use_cases && tool.use_cases.length > 0) {
      console.log('🎯 CAS D\'USAGE');
      tool.use_cases.forEach((useCase, index) => {
        console.log(`${index + 1}. ${useCase}`);
      });
      console.log('');
    }
    
    // Utilisateurs cibles
    if (tool.target_users && tool.target_users.length > 0) {
      console.log('👥 UTILISATEURS CIBLES');
      tool.target_users.forEach((user, index) => {
        console.log(`${index + 1}. ${user}`);
      });
      console.log('');
    }
    
    // SEO
    console.log('🔍 SEO');
    console.log('Meta title:', tool.meta_title);
    console.log('Meta description:', tool.meta_description);
    console.log('');
    
    // Traduction
    console.log('🌐 INFORMATIONS DE TRADUCTION');
    console.log('Généré par IA:', tool.ai_generated ? 'Oui' : 'Non');
    console.log('Source de traduction:', tool.translation_source);
    console.log('');
    
    // Récupérer les catégories
    const categoriesResult = await client.query(`
      SELECT c.slug, ct.name, ct.description
      FROM tool_categories tc
      JOIN categories c ON tc.category_id = c.id
      JOIN category_translations ct ON c.id = ct.category_id
      WHERE tc.tool_id = $1 AND ct.language_id = 'en'
    `, [tool.id]);
    
    if (categoriesResult.rows.length > 0) {
      console.log('📂 CATÉGORIES');
      categoriesResult.rows.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (${category.slug})`);
        console.log(`   Description: ${category.description}`);
      });
      console.log('');
    }
    
    // Récupérer les tags
    const tagsResult = await client.query(`
      SELECT t.slug, tt.name, t.type
      FROM tool_tags ttc
      JOIN tags t ON ttc.tag_id = t.id
      JOIN tag_translations tt ON t.id = tt.tag_id
      WHERE ttc.tool_id = $1 AND tt.language_id = 'en'
    `, [tool.id]);
    
    if (tagsResult.rows.length > 0) {
      console.log('🏷️ TAGS');
      tagsResult.rows.forEach((tag, index) => {
        console.log(`${index + 1}. ${tag.name} (${tag.slug}) - Type: ${tag.type}`);
      });
      console.log('');
    }
    
    console.log('✅ Exemple complet affiché !');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

showToolExample(); 