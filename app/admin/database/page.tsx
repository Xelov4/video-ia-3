/**
 * Admin Database Management Page
 * Complete database administration interface
 */

'use client';

import { useState } from 'react';
import { DatabaseViewer } from '@/src/components/admin/DatabaseViewer';
import { ImportExportManager } from '@/src/components/admin/ImportExportManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import {
  Database,
  Activity,
  Shield,
  Clock,
  HardDrive,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function AdminDatabasePage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const systemHealth = {
    overall: 'healthy',
    database: 'connected',
    performance: 'optimal',
    backup: 'up-to-date',
    security: 'secured',
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestion de la base de données
          </h1>
          <p className='text-muted-foreground'>
            Administration complète de la base de données et des données
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={handleRefresh}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Actualiser
          </Button>
          <Badge variant='outline'>
            Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* System Health Overview */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>État général</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <div className='text-sm font-medium'>Excellent</div>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>
              Tous les systèmes opérationnels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Base de données</CardTitle>
            <Database className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <div className='text-sm font-medium'>Connectée</div>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>15 tables actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Performance</CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <div className='text-sm font-medium'>Optimale</div>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>23% CPU • 67% RAM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Sauvegarde</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <div className='text-sm font-medium'>À jour</div>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>Il y a 2 heures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Sécurité</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <div className='text-sm font-medium'>Sécurisée</div>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>SSL actif</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue='viewer' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='viewer'>
            <Database className='mr-2 h-4 w-4' />
            Base de données
          </TabsTrigger>
          <TabsTrigger value='import-export'>
            <HardDrive className='mr-2 h-4 w-4' />
            Import / Export
          </TabsTrigger>
          <TabsTrigger value='maintenance'>
            <Shield className='mr-2 h-4 w-4' />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value='viewer' className='space-y-4'>
          <DatabaseViewer />
        </TabsContent>

        <TabsContent value='import-export' className='space-y-4'>
          <ImportExportManager />
        </TabsContent>

        <TabsContent value='maintenance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Outils de maintenance</CardTitle>
              <CardDescription>
                Optimisation et maintenance de la base de données
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Alert>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Les opérations de maintenance peuvent affecter les performances. Il
                  est recommandé de les effectuer durant les heures de faible trafic.
                </AlertDescription>
              </Alert>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Optimisation des index</CardTitle>
                    <CardDescription>
                      Réorganise les index pour améliorer les performances
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        Dernière optimisation: il y a 3 jours
                      </div>
                      <Button>Optimiser maintenant</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Nettoyage des logs</CardTitle>
                    <CardDescription>
                      Supprime les anciens logs pour libérer de l'espace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        Logs plus anciens que 30 jours: 245 MB
                      </div>
                      <Button variant='outline'>Nettoyer les logs</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Analyse des statistiques</CardTitle>
                    <CardDescription>
                      Met à jour les statistiques des tables
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        Dernière analyse: il y a 1 jour
                      </div>
                      <Button variant='outline'>Analyser</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Vérification d'intégrité</CardTitle>
                    <CardDescription>Vérifie l'intégrité des données</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        Dernière vérification: il y a 1 semaine
                      </div>
                      <Button variant='outline'>Vérifier</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
