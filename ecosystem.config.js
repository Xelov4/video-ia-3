/**
 * PM2 Ecosystem Configuration for video-ia.net
 * 
 * Configuration optimisée pour la production avec:
 * - Clustering automatique
 * - Gestion des logs
 * - Auto-restart en cas d'erreur
 * - Variables d'environnement
 */

module.exports = {
  apps: [
    {
      // Application principale
      name: 'video-ia-net',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/video-ia.net',
      
      // Clustering
      instances: 'max', // Utilise tous les CPU disponibles
      exec_mode: 'cluster',
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Base de données production
        DATABASE_URL: 'postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net',
        
        // Configuration Next.js
        NEXT_TELEMETRY_DISABLED: 1,
        
        // Limites mémoire
        NODE_OPTIONS: '--max-old-space-size=2048'
      },
      
      // Gestion des erreurs et redémarrages
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // Logs
      log_file: '/var/log/pm2/video-ia-net.log',
      out_file: '/var/log/pm2/video-ia-net-out.log',
      error_file: '/var/log/pm2/video-ia-net-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart
      watch: false, // Désactivé en production
      ignore_watch: ['node_modules', '.next', 'logs'],
      
      // Gestion graceful
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Monitoring
      pmx: true,
      automation: false,
      
      // Source maps pour le debugging
      source_map_support: true,
      
      // Cron restart (optionnel - redémarrage hebdomadaire)
      cron_restart: '0 2 * * 0', // Dimanche à 2h00
    }
  ],
  
  // Configuration de déploiement
  deploy: {
    production: {
      user: 'root',
      host: '46.202.129.104',
      ref: 'origin/main',
      repo: 'git@github.com:YOUR_USERNAME/video-ia.net.git',
      path: '/var/www/video-ia.net',
      
      // Hooks de déploiement
      'pre-deploy': 'git reset --hard && git clean -fd',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      
      // Variables d'environnement pour le déploiement
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://video_ia_user:Buzzerbeater23@localhost:5432/video_ia_net'
      }
    }
  }
};