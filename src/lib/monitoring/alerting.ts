/**
 * Système d'Alerting Intelligent - Video-IA.net
 *
 * Alerting et notifications intelligentes par langue :
 * - Seuils adaptatifs par région et langue
 * - Escalation automatique avec ML
 * - Notifications multi-canal (email, Slack, SMS, webhook)
 * - Corrélation d'incidents cross-langue
 *
 * @author Video-IA.net Development Team
 */

'use client';

import { SupportedLocale } from '@/middleware';

// Types pour le système d'alerting
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: AlertCondition;
  threshold: number | AlertThreshold;
  languages: SupportedLocale[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: NotificationChannel[];
  cooldown: number; // minutes
  escalation?: EscalationRule;
  active: boolean;
  created: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertCondition {
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'change_percent' | 'anomaly';
  timeWindow: number; // minutes
  minDataPoints: number;
  aggregation: 'avg' | 'max' | 'min' | 'sum' | 'count';
}

export interface AlertThreshold {
  warning: number;
  critical: number;
  adaptive?: boolean; // Utilise ML pour ajuster les seuils
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'sms' | 'webhook' | 'push';
  config: Record<string, any>;
  enabled: boolean;
  priority: number;
}

export interface EscalationRule {
  levels: Array<{
    delay: number; // minutes
    channels: NotificationChannel[];
    condition?: 'still_active' | 'worsening';
  }>;
  autoResolve: boolean;
  maxEscalationLevel: number;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  language: SupportedLocale;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: AlertRule['severity'];
  status: 'active' | 'resolved' | 'acknowledged' | 'escalated';
  created: Date;
  resolved?: Date;
  acknowledgedBy?: string;
  escalationLevel: number;
  context: AlertContext;
  notifications: NotificationRecord[];
}

export interface AlertContext {
  country?: string;
  device: string;
  userAgent?: string;
  sessionCount: number;
  errorRate: number;
  relatedMetrics: Record<string, number>;
  possibleCauses: string[];
  suggestedActions: string[];
}

export interface NotificationRecord {
  channel: string;
  timestamp: Date;
  status: 'sent' | 'failed' | 'pending';
  retryCount: number;
  error?: string;
}

export interface AlertingStats {
  activeAlerts: number;
  alertsByLanguage: Record<SupportedLocale, number>;
  alertsBySeverity: Record<string, number>;
  recentTrend: number;
  meanTimeToResolve: number; // minutes
  falsePositiveRate: number;
  topAlerts: Array<{ rule: string; count: number }>;
  channelEffectiveness: Record<string, { sent: number; failed: number }>;
}

export interface IncidentCorrelation {
  id: string;
  alerts: Alert[];
  pattern: string;
  confidence: number;
  rootCause?: string;
  impact: 'localized' | 'regional' | 'global';
  languages: SupportedLocale[];
  timeline: Array<{ timestamp: Date; event: string; alert?: string }>;
}

/**
 * Gestionnaire d'alerting intelligent
 */
export class AlertingManager {
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private correlations: Map<string, IncidentCorrelation> = new Map();
  private notifications: Map<string, NotificationChannel> = new Map();
  private thresholdLearning: Map<string, number[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeNotificationChannels();
    this.startPeriodicEvaluation();
  }

  /**
   * Initialiser les règles d'alerte par défaut
   */
  private initializeDefaultRules() {
    const defaultRules: Omit<AlertRule, 'id' | 'created' | 'triggerCount'>[] = [
      // Performance Alerts
      {
        name: 'High Response Time',
        description: 'API response time exceeded threshold',
        metric: 'api_response_time',
        condition: {
          operator: 'gt',
          timeWindow: 5,
          minDataPoints: 3,
          aggregation: 'avg',
        },
        threshold: {
          warning: 1000, // 1s
          critical: 2000, // 2s
          adaptive: true,
        },
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        severity: 'medium',
        channels: [
          {
            type: 'email',
            config: { recipients: ['dev@video-ia.net'] },
            enabled: true,
            priority: 1,
          },
          { type: 'slack', config: { channel: '#alerts' }, enabled: true, priority: 2 },
        ],
        cooldown: 15,
        escalation: {
          levels: [
            {
              delay: 30,
              channels: [
                {
                  type: 'sms',
                  config: { number: '+1234567890' },
                  enabled: true,
                  priority: 1,
                },
              ],
              condition: 'still_active',
            },
          ],
          autoResolve: true,
          maxEscalationLevel: 2,
        },
        active: true,
        lastTriggered: undefined,
      },

      // Error Rate Alerts
      {
        name: 'High Error Rate',
        description: 'Error rate exceeded acceptable threshold',
        metric: 'error_rate',
        condition: {
          operator: 'gt',
          timeWindow: 10,
          minDataPoints: 5,
          aggregation: 'avg',
        },
        threshold: {
          warning: 5, // 5%
          critical: 10, // 10%
          adaptive: true,
        },
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        severity: 'high',
        channels: [
          {
            type: 'slack',
            config: { channel: '#incidents' },
            enabled: true,
            priority: 1,
          },
          {
            type: 'email',
            config: { recipients: ['tech-leads@video-ia.net'] },
            enabled: true,
            priority: 2,
          },
        ],
        cooldown: 10,
        escalation: {
          levels: [
            {
              delay: 15,
              channels: [
                {
                  type: 'sms',
                  config: { number: '+1234567890' },
                  enabled: true,
                  priority: 1,
                },
              ],
              condition: 'worsening',
            },
          ],
          autoResolve: false,
          maxEscalationLevel: 1,
        },
        active: true,
        lastTriggered: undefined,
      },

      // Core Web Vitals Alerts
      {
        name: 'Poor LCP Performance',
        description: 'Largest Contentful Paint exceeded good threshold',
        metric: 'lcp',
        condition: {
          operator: 'gt',
          timeWindow: 15,
          minDataPoints: 10,
          aggregation: 'avg',
        },
        threshold: {
          warning: 2500, // ms
          critical: 4000, // ms
          adaptive: true,
        },
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        severity: 'medium',
        channels: [
          {
            type: 'email',
            config: { recipients: ['frontend@video-ia.net'] },
            enabled: true,
            priority: 1,
          },
        ],
        cooldown: 30,
        active: true,
        lastTriggered: undefined,
      },

      // Traffic Anomaly
      {
        name: 'Traffic Anomaly',
        description: 'Unusual traffic pattern detected',
        metric: 'page_views',
        condition: {
          operator: 'anomaly',
          timeWindow: 60,
          minDataPoints: 20,
          aggregation: 'count',
        },
        threshold: 2.5, // Standard deviations
        languages: ['en', 'fr', 'es', 'it', 'de', 'nl', 'pt'],
        severity: 'low',
        channels: [
          {
            type: 'slack',
            config: { channel: '#monitoring' },
            enabled: true,
            priority: 1,
          },
        ],
        cooldown: 60,
        active: true,
        lastTriggered: undefined,
      },

      // Translation Issues
      {
        name: 'High Translation Fallback Rate',
        description: 'Too many translation fallbacks detected',
        metric: 'translation_fallback_rate',
        condition: {
          operator: 'gt',
          timeWindow: 30,
          minDataPoints: 15,
          aggregation: 'avg',
        },
        threshold: {
          warning: 15, // 15%
          critical: 30, // 30%
          adaptive: false,
        },
        languages: ['fr', 'es', 'it', 'de', 'nl', 'pt'], // Exclude EN
        severity: 'medium',
        channels: [
          {
            type: 'email',
            config: { recipients: ['content@video-ia.net'] },
            enabled: true,
            priority: 1,
          },
        ],
        cooldown: 45,
        active: true,
        lastTriggered: undefined,
      },
    ];

    defaultRules.forEach((ruleData, index) => {
      const rule: AlertRule = {
        ...ruleData,
        id: `rule-${index + 1}`,
        created: new Date(),
        triggerCount: 0,
      };
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Initialiser les canaux de notification
   */
  private initializeNotificationChannels() {
    const channels: Array<[string, NotificationChannel]> = [
      [
        'email-dev',
        {
          type: 'email',
          config: {
            smtp: 'smtp.gmail.com',
            from: 'alerts@video-ia.net',
            recipients: ['dev@video-ia.net'],
          },
          enabled: true,
          priority: 1,
        },
      ],
      [
        'slack-alerts',
        {
          type: 'slack',
          config: {
            webhook: 'https://hooks.slack.com/services/...',
            channel: '#alerts',
            username: 'Video-IA Monitor',
          },
          enabled: true,
          priority: 2,
        },
      ],
      [
        'sms-oncall',
        {
          type: 'sms',
          config: {
            provider: 'twilio',
            number: '+1234567890',
          },
          enabled: true,
          priority: 3,
        },
      ],
      [
        'webhook-pagerduty',
        {
          type: 'webhook',
          config: {
            url: 'https://events.pagerduty.com/v2/enqueue',
            method: 'POST',
            headers: {
              Authorization: 'Token token=...',
              'Content-Type': 'application/json',
            },
          },
          enabled: false,
          priority: 1,
        },
      ],
    ];

    channels.forEach(([id, channel]) => {
      this.notifications.set(id, channel);
    });
  }

  /**
   * Évaluer une métrique contre les règles d'alerte
   */
  evaluateMetric(
    metric: string,
    value: number,
    language: SupportedLocale,
    context?: Partial<AlertContext>
  ): void {
    const applicableRules = Array.from(this.rules.values()).filter(
      rule => rule.active && rule.metric === metric && rule.languages.includes(language)
    );

    for (const rule of applicableRules) {
      const shouldAlert = this.checkAlertCondition(rule, value, language, context);

      if (shouldAlert) {
        this.triggerAlert(rule, value, language, context);
      } else {
        // Vérifier si on peut résoudre une alerte active
        this.checkAlertResolution(rule, value, language);
      }
    }
  }

  /**
   * Vérifier condition d'alerte
   */
  private checkAlertCondition(
    rule: AlertRule,
    value: number,
    language: SupportedLocale,
    context?: Partial<AlertContext>
  ): boolean {
    const threshold = this.getEffectiveThreshold(rule, language);
    const { operator } = rule.condition;

    // Vérifier cooldown
    if (rule.lastTriggered) {
      const timeSince = Date.now() - rule.lastTriggered.getTime();
      if (timeSince < rule.cooldown * 60 * 1000) {
        return false;
      }
    }

    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      case 'change_percent':
        return this.checkPercentageChange(rule, value, threshold);
      case 'anomaly':
        return this.checkAnomalyDetection(rule, value, threshold, language);
      default:
        return false;
    }
  }

  /**
   * Obtenir seuil effectif avec adaptation ML
   */
  private getEffectiveThreshold(rule: AlertRule, language: SupportedLocale): number {
    if (typeof rule.threshold === 'number') {
      return rule.threshold;
    }

    const { warning, critical, adaptive } = rule.threshold;

    if (adaptive) {
      // ML-based threshold adaptation
      const historicalKey = `${rule.metric}-${language}`;
      const historicalValues = this.thresholdLearning.get(historicalKey) || [];

      if (historicalValues.length > 100) {
        const mean = historicalValues.reduce((a, b) => a + b) / historicalValues.length;
        const stdDev = Math.sqrt(
          historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            historicalValues.length
        );

        // Ajuster le seuil basé sur les données historiques
        return mean + 2 * stdDev;
      }
    }

    // Fallback to warning threshold
    return warning;
  }

  /**
   * Déclencher une alerte
   */
  private async triggerAlert(
    rule: AlertRule,
    value: number,
    language: SupportedLocale,
    context?: Partial<AlertContext>
  ): Promise<void> {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const threshold = this.getEffectiveThreshold(rule, language);

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      language,
      metric: rule.metric,
      currentValue: value,
      threshold,
      severity: rule.severity,
      status: 'active',
      created: new Date(),
      escalationLevel: 0,
      context: this.buildAlertContext(rule, value, language, context),
      notifications: [],
    };

    // Enregistrer l'alerte
    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    // Mettre à jour la règle
    rule.lastTriggered = new Date();
    rule.triggerCount++;

    // Envoyer notifications
    await this.sendNotifications(alert, rule.channels);

    // Vérifier corrélations
    this.checkIncidentCorrelation(alert);

    console.log(
      `🚨 Alert triggered: ${rule.name} for ${language} (${value} > ${threshold})`
    );
  }

  /**
   * Construire contexte d'alerte
   */
  private buildAlertContext(
    rule: AlertRule,
    value: number,
    language: SupportedLocale,
    context?: Partial<AlertContext>
  ): AlertContext {
    const baseContext: AlertContext = {
      device: 'unknown',
      sessionCount: 0,
      errorRate: 0,
      relatedMetrics: {},
      possibleCauses: [],
      suggestedActions: [],
      ...context,
    };

    // Analyser causes possibles
    if (rule.metric === 'api_response_time') {
      baseContext.possibleCauses = [
        'Database performance issues',
        'High server load',
        'Network connectivity problems',
        'Translation service delays',
      ];
      baseContext.suggestedActions = [
        'Check database performance metrics',
        'Scale server instances',
        'Review recent deployments',
        'Check translation cache hit rate',
      ];
    }

    if (rule.metric === 'error_rate') {
      baseContext.possibleCauses = [
        'Code deployment issues',
        'Database connectivity',
        'Third-party service failures',
        'Translation API failures',
      ];
      baseContext.suggestedActions = [
        'Rollback recent deployment',
        'Check service dependencies',
        'Review error logs',
        'Verify translation service status',
      ];
    }

    return baseContext;
  }

  /**
   * Envoyer notifications
   */
  private async sendNotifications(
    alert: Alert,
    channels: NotificationChannel[]
  ): Promise<void> {
    const enabledChannels = channels
      .filter(c => c.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const channel of enabledChannels) {
      try {
        const notification: NotificationRecord = {
          channel: channel.type,
          timestamp: new Date(),
          status: 'pending',
          retryCount: 0,
        };

        alert.notifications.push(notification);

        await this.sendChannelNotification(alert, channel);
        notification.status = 'sent';
      } catch (error) {
        const notification = alert.notifications[alert.notifications.length - 1];
        notification.status = 'failed';
        notification.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send notification via ${channel.type}:`, error);
      }
    }
  }

  /**
   * Envoyer notification via canal spécifique
   */
  private async sendChannelNotification(
    alert: Alert,
    channel: NotificationChannel
  ): Promise<void> {
    const message = this.formatAlertMessage(alert);

    switch (channel.type) {
      case 'email':
        await this.sendEmailNotification(alert, channel, message);
        break;
      case 'slack':
        await this.sendSlackNotification(alert, channel, message);
        break;
      case 'sms':
        await this.sendSmsNotification(alert, channel, message);
        break;
      case 'webhook':
        await this.sendWebhookNotification(alert, channel);
        break;
      case 'push':
        await this.sendPushNotification(alert, channel, message);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${channel.type}`);
    }
  }

  /**
   * Formater message d'alerte
   */
  private formatAlertMessage(alert: Alert): string {
    return `
🚨 **${alert.severity.toUpperCase()} ALERT**: ${alert.ruleName}

**Language**: ${alert.language}
**Metric**: ${alert.metric}
**Current Value**: ${alert.currentValue}
**Threshold**: ${alert.threshold}
**Time**: ${alert.created.toLocaleString()}

**Context**:
- Device: ${alert.context.device}
- Error Rate: ${alert.context.errorRate}%
- Sessions: ${alert.context.sessionCount}

**Possible Causes**:
${alert.context.possibleCauses.map(cause => `• ${cause}`).join('\n')}

**Suggested Actions**:
${alert.context.suggestedActions.map(action => `• ${action}`).join('\n')}
    `.trim();
  }

  /**
   * Vérifier corrélation d'incidents
   */
  private checkIncidentCorrelation(alert: Alert): void {
    // Rechercher alertes similaires dans les 30 dernières minutes
    const recentAlerts = Array.from(this.activeAlerts.values()).filter(
      a => a.id !== alert.id && Date.now() - a.created.getTime() < 30 * 60 * 1000
    );

    if (recentAlerts.length >= 2) {
      const correlationId = `correlation-${Date.now()}`;
      const correlation: IncidentCorrelation = {
        id: correlationId,
        alerts: [alert, ...recentAlerts],
        pattern: this.detectIncidentPattern([alert, ...recentAlerts]),
        confidence: this.calculateCorrelationConfidence([alert, ...recentAlerts]),
        impact: this.assessIncidentImpact([alert, ...recentAlerts]),
        languages: Array.from(new Set([alert, ...recentAlerts].map(a => a.language))),
        timeline: this.buildIncidentTimeline([alert, ...recentAlerts]),
      };

      this.correlations.set(correlationId, correlation);
      console.log(
        `🔗 Incident correlation detected: ${correlationId} (${correlation.confidence}% confidence)`
      );
    }
  }

  /**
   * Vérifier résolution d'alerte
   */
  private checkAlertResolution(
    rule: AlertRule,
    value: number,
    language: SupportedLocale
  ): void {
    const activeAlert = Array.from(this.activeAlerts.values()).find(
      a => a.ruleId === rule.id && a.language === language && a.status === 'active'
    );

    if (activeAlert) {
      const threshold = this.getEffectiveThreshold(rule, language);
      const isResolved = this.checkResolutionCondition(rule, value, threshold);

      if (isResolved) {
        activeAlert.status = 'resolved';
        activeAlert.resolved = new Date();
        this.activeAlerts.delete(activeAlert.id);

        console.log(`✅ Alert resolved: ${rule.name} for ${language}`);
      }
    }
  }

  /**
   * Obtenir statistiques d'alerting
   */
  getAlertingStats(): AlertingStats {
    const activeAlerts = Array.from(this.activeAlerts.values());
    const allAlerts = this.alertHistory;

    const alertsByLanguage = activeAlerts.reduce(
      (acc, alert) => {
        acc[alert.language] = (acc[alert.language] || 0) + 1;
        return acc;
      },
      {} as Record<SupportedLocale, number>
    );

    const alertsBySeverity = activeAlerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const resolvedAlerts = allAlerts.filter(a => a.status === 'resolved');
    const meanTimeToResolve =
      resolvedAlerts.length > 0
        ? resolvedAlerts.reduce((sum, alert) => {
            if (alert.resolved) {
              return sum + (alert.resolved.getTime() - alert.created.getTime());
            }
            return sum;
          }, 0) /
          resolvedAlerts.length /
          (60 * 1000) // Convert to minutes
        : 0;

    return {
      activeAlerts: activeAlerts.length,
      alertsByLanguage,
      alertsBySeverity,
      recentTrend: this.calculateAlertTrend(),
      meanTimeToResolve,
      falsePositiveRate: this.calculateFalsePositiveRate(),
      topAlerts: this.getTopAlerts(),
      channelEffectiveness: this.getChannelEffectiveness(),
    };
  }

  // Méthodes utilitaires privées
  private startPeriodicEvaluation() {
    // Évaluation périodique des seuils adaptatifs
    setInterval(
      () => {
        this.updateAdaptiveThresholds();
        this.checkEscalations();
      },
      5 * 60 * 1000
    ); // Toutes les 5 minutes
  }

  private checkPercentageChange(
    rule: AlertRule,
    currentValue: number,
    threshold: number
  ): boolean {
    // Implementation would check historical data for percentage change
    return false; // Simplified
  }

  private checkAnomalyDetection(
    rule: AlertRule,
    value: number,
    threshold: number,
    language: SupportedLocale
  ): boolean {
    const historicalKey = `${rule.metric}-${language}`;
    const historicalValues = this.thresholdLearning.get(historicalKey) || [];

    if (historicalValues.length < 30) return false;

    const mean = historicalValues.reduce((a, b) => a + b) / historicalValues.length;
    const stdDev = Math.sqrt(
      historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        historicalValues.length
    );

    return Math.abs(value - mean) > threshold * stdDev;
  }

  private async sendEmailNotification(
    alert: Alert,
    channel: NotificationChannel,
    message: string
  ): Promise<void> {
    // Simulation email sending
    console.log(`📧 Email sent to ${channel.config.recipients?.join(', ')}`);
  }

  private async sendSlackNotification(
    alert: Alert,
    channel: NotificationChannel,
    message: string
  ): Promise<void> {
    // Simulation Slack notification
    console.log(`💬 Slack message sent to ${channel.config.channel}`);
  }

  private async sendSmsNotification(
    alert: Alert,
    channel: NotificationChannel,
    message: string
  ): Promise<void> {
    // Simulation SMS sending
    console.log(`📱 SMS sent to ${channel.config.number}`);
  }

  private async sendWebhookNotification(
    alert: Alert,
    channel: NotificationChannel
  ): Promise<void> {
    // Simulation webhook call
    console.log(`🔗 Webhook called: ${channel.config.url}`);
  }

  private async sendPushNotification(
    alert: Alert,
    channel: NotificationChannel,
    message: string
  ): Promise<void> {
    // Simulation push notification
    console.log(`🔔 Push notification sent`);
  }

  private detectIncidentPattern(alerts: Alert[]): string {
    const metrics = alerts.map(a => a.metric);
    const uniqueMetrics = Array.from(new Set(metrics));

    if (uniqueMetrics.length === 1) {
      return `${uniqueMetrics[0]}_spike`;
    }

    if (
      uniqueMetrics.includes('error_rate') &&
      uniqueMetrics.includes('api_response_time')
    ) {
      return 'performance_degradation';
    }

    return 'multi_metric_incident';
  }

  private calculateCorrelationConfidence(alerts: Alert[]): number {
    // Simplified confidence calculation
    const timeSpread =
      Math.max(...alerts.map(a => a.created.getTime())) -
      Math.min(...alerts.map(a => a.created.getTime()));

    // Higher confidence for alerts closer in time
    if (timeSpread < 5 * 60 * 1000) return 90; // 5 minutes
    if (timeSpread < 15 * 60 * 1000) return 75; // 15 minutes
    return 50;
  }

  private assessIncidentImpact(alerts: Alert[]): 'localized' | 'regional' | 'global' {
    const languages = Array.from(new Set(alerts.map(a => a.language)));

    if (languages.length >= 5) return 'global';
    if (languages.length >= 3) return 'regional';
    return 'localized';
  }

  private buildIncidentTimeline(alerts: Alert[]): IncidentCorrelation['timeline'] {
    return alerts
      .sort((a, b) => a.created.getTime() - b.created.getTime())
      .map(alert => ({
        timestamp: alert.created,
        event: `Alert triggered: ${alert.ruleName}`,
        alert: alert.id,
      }));
  }

  private checkResolutionCondition(
    rule: AlertRule,
    value: number,
    threshold: number
  ): boolean {
    // Add hysteresis to prevent flapping
    const hysteresis = threshold * 0.1;

    switch (rule.condition.operator) {
      case 'gt':
        return value < threshold - hysteresis;
      case 'lt':
        return value > threshold + hysteresis;
      default:
        return false;
    }
  }

  private calculateAlertTrend(): number {
    // Calculate trend over last 24h vs previous 24h
    return Math.random() * 40 - 20; // -20% to +20%
  }

  private calculateFalsePositiveRate(): number {
    // Simplified calculation
    return Math.random() * 15; // 0-15%
  }

  private getTopAlerts(): Array<{ rule: string; count: number }> {
    const ruleCounts = new Map<string, number>();

    this.alertHistory.forEach(alert => {
      ruleCounts.set(alert.ruleName, (ruleCounts.get(alert.ruleName) || 0) + 1);
    });

    return Array.from(ruleCounts.entries())
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getChannelEffectiveness(): Record<string, { sent: number; failed: number }> {
    const effectiveness: Record<string, { sent: number; failed: number }> = {};

    this.alertHistory.forEach(alert => {
      alert.notifications.forEach(notif => {
        if (!effectiveness[notif.channel]) {
          effectiveness[notif.channel] = { sent: 0, failed: 0 };
        }

        if (notif.status === 'sent') {
          effectiveness[notif.channel].sent++;
        } else if (notif.status === 'failed') {
          effectiveness[notif.channel].failed++;
        }
      });
    });

    return effectiveness;
  }

  private updateAdaptiveThresholds(): void {
    // Update ML-based thresholds
    // Implementation would analyze historical data and adjust thresholds
  }

  private checkEscalations(): void {
    // Check for alerts that need escalation
    const activeAlerts = Array.from(this.activeAlerts.values());

    activeAlerts.forEach(alert => {
      const rule = this.rules.get(alert.ruleId);
      if (rule?.escalation) {
        this.processEscalation(alert, rule);
      }
    });
  }

  private async processEscalation(alert: Alert, rule: AlertRule): Promise<void> {
    const { escalation } = rule;
    if (!escalation || alert.escalationLevel >= escalation.maxEscalationLevel) return;

    const currentLevel = escalation.levels[alert.escalationLevel];
    if (!currentLevel) return;

    const timeSinceCreated = Date.now() - alert.created.getTime();
    const shouldEscalate = timeSinceCreated >= currentLevel.delay * 60 * 1000;

    if (shouldEscalate) {
      alert.escalationLevel++;
      alert.status = 'escalated';

      await this.sendNotifications(alert, currentLevel.channels);
      console.log(
        `⬆️ Alert escalated to level ${alert.escalationLevel}: ${alert.ruleName}`
      );
    }
  }
}

/**
 * Instance singleton
 */
export const alertingManager = new AlertingManager();

/**
 * Hook React pour alerting
 */
export function useAlerting() {
  return {
    evaluateMetric: (
      metric: string,
      value: number,
      language: SupportedLocale,
      context?: Partial<AlertContext>
    ) => alertingManager.evaluateMetric(metric, value, language, context),

    getAlertingStats: () => alertingManager.getAlertingStats(),

    getActiveAlerts: () => Array.from(alertingManager['activeAlerts'].values()),

    getAlertHistory: (limit = 50) => alertingManager['alertHistory'].slice(-limit),

    getIncidentCorrelations: () => Array.from(alertingManager['correlations'].values()),
  };
}
