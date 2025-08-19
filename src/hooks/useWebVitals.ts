/**
 * useWebVitals - Hook pour monitorer les Core Web Vitals
 *
 * Surveille et rapporte les métriques de performance web
 * pour optimiser l'expérience utilisateur.
 */

import { useEffect, useCallback } from 'react';

interface WebVitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export const useWebVitals = () => {
  const reportWebVital = useCallback((metric: WebVitalsData) => {
    // En production, envoyer à Google Analytics ou autre service
    if (process.env.NODE_ENV === 'production') {
      // gtag('event', metric.name, {
      //   event_category: 'Web Vitals',
      //   event_label: metric.id,
      //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      //   non_interaction: true,
      // })
      console.log('Web Vital:', metric);
    } else {
      console.log('Web Vital (Dev):', metric);
    }
  }, []);

  useEffect(() => {
    // LCP (Largest Contentful Paint)
    const observerLCP = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      const lcp = lastEntry.startTime;

      reportWebVital({
        name: 'LCP',
        value: lcp,
        rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor',
        delta: lcp,
        id: lastEntry.entryType,
      });
    });

    observerLCP.observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    const observerFID = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const fid = entry.processingStart - entry.startTime;

        reportWebVital({
          name: 'FID',
          value: fid,
          rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor',
          delta: fid,
          id: entry.entryType,
        });
      });
    });

    observerFID.observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsEntries: PerformanceEntry[] = [];

    const observerCLS = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      });

      // Rapporter CLS après un délai pour éviter les rapports trop fréquents
      if (clsEntries.length > 0) {
        setTimeout(() => {
          reportWebVital({
            name: 'CLS',
            value: clsValue,
            rating:
              clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
            delta: clsValue,
            id: 'cls-cumulative',
          });
        }, 1000);
      }
    });

    observerCLS.observe({ entryTypes: ['layout-shift'] });

    // FCP (First Contentful Paint)
    const observerFCP = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const firstEntry = entries[0];

      reportWebVital({
        name: 'FCP',
        value: firstEntry.startTime,
        rating:
          firstEntry.startTime < 1800
            ? 'good'
            : firstEntry.startTime < 3000
              ? 'needs-improvement'
              : 'poor',
        delta: firstEntry.startTime,
        id: firstEntry.entryType,
      });
    });

    observerFCP.observe({ entryTypes: ['first-contentful-paint'] });

    // Nettoyage
    return () => {
      observerLCP.disconnect();
      observerFID.disconnect();
      observerCLS.disconnect();
      observerFCP.disconnect();
    };
  }, [reportWebVital]);

  return {
    reportWebVital,
  };
};
