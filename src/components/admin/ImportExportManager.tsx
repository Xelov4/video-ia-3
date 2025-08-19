/**
 * ImportExportManager Component
 * Advanced data import/export interface with progress tracking
 */

'use client';

import { useState } from 'react';
import {
  Upload,
  Download,
  FileText,
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

interface ImportJob {
  id: string;
  filename: string;
  type: 'tools' | 'categories' | 'full_backup';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
  startTime: string;
  endTime?: string;
  errors: string[];
}

interface ExportJob {
  id: string;
  name: string;
  type: 'tools' | 'categories' | 'translations' | 'full_backup';
  format: 'csv' | 'json' | 'sql';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  size?: string;
  downloadUrl?: string;
  createdAt: string;
}

export const ImportExportManager = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('');
  const [exportType, setExportType] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('csv');

  // Mock data for rapid development
  const importJobs: ImportJob[] = [
    {
      id: '1',
      filename: 'new_tools_2024.csv',
      type: 'tools',
      status: 'completed',
      progress: 100,
      recordsProcessed: 45,
      totalRecords: 45,
      startTime: '2024-01-15 10:30:00',
      endTime: '2024-01-15 10:31:23',
      errors: [],
    },
    {
      id: '2',
      filename: 'categories_update.json',
      type: 'categories',
      status: 'running',
      progress: 67,
      recordsProcessed: 12,
      totalRecords: 18,
      startTime: '2024-01-15 11:15:00',
      errors: ['Duplicate category: "ai-voice"'],
    },
    {
      id: '3',
      filename: 'failed_import.csv',
      type: 'tools',
      status: 'failed',
      progress: 23,
      recordsProcessed: 8,
      totalRecords: 35,
      startTime: '2024-01-15 09:45:00',
      endTime: '2024-01-15 09:47:12',
      errors: [
        'Invalid URL format on row 15',
        'Missing required field "toolName" on row 23',
      ],
    },
  ];

  const exportJobs: ExportJob[] = [
    {
      id: '1',
      name: 'All Tools Export',
      type: 'tools',
      format: 'csv',
      status: 'completed',
      progress: 100,
      size: '2.4 MB',
      downloadUrl: '/api/admin/export/tools-2024-01-15.csv',
      createdAt: '2024-01-15 14:30:00',
    },
    {
      id: '2',
      name: 'Categories Backup',
      type: 'categories',
      format: 'json',
      status: 'completed',
      progress: 100,
      size: '45 KB',
      downloadUrl: '/api/admin/export/categories-backup.json',
      createdAt: '2024-01-15 12:15:00',
    },
    {
      id: '3',
      name: 'Full Database Backup',
      type: 'full_backup',
      format: 'sql',
      status: 'running',
      progress: 78,
      createdAt: '2024-01-15 15:00:00',
    },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleImport = () => {
    if (!selectedFile || !importType) return;

    // Mock import process
    console.log('Starting import:', { file: selectedFile.name, type: importType });

    // In real implementation, this would trigger an API call
    // POST /api/admin/import with FormData
  };

  const handleExport = () => {
    if (!exportType || !exportFormat) return;

    // Mock export process
    console.log('Starting export:', { type: exportType, format: exportFormat });

    // In real implementation, this would trigger an API call
    // POST /api/admin/export
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'running':
        return <Clock className='h-4 w-4 animate-pulse text-blue-500' />;
      case 'failed':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      running: 'secondary',
      failed: 'destructive',
      pending: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Import / Export</h2>
          <p className='text-muted-foreground'>Gestion des données et sauvegardes</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Imports aujourd'hui</CardTitle>
            <Upload className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>3</div>
            <p className='text-xs text-muted-foreground'>+2 depuis hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Exports aujourd'hui</CardTitle>
            <Download className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>5</div>
            <p className='text-xs text-muted-foreground'>+1 depuis hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Taille totale</CardTitle>
            <Database className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12.8 MB</div>
            <p className='text-xs text-muted-foreground'>exports créés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Succès</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>87%</div>
            <p className='text-xs text-muted-foreground'>taux de réussite</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='import' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='import'>Import</TabsTrigger>
          <TabsTrigger value='export'>Export</TabsTrigger>
          <TabsTrigger value='history'>Historique</TabsTrigger>
        </TabsList>

        <TabsContent value='import' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Importer des données</CardTitle>
              <CardDescription>
                Importez des outils, catégories ou autres données depuis un fichier
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='import-type'>Type de données</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger>
                      <SelectValue placeholder='Sélectionnez le type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='tools'>Outils</SelectItem>
                      <SelectItem value='categories'>Catégories</SelectItem>
                      <SelectItem value='translations'>Traductions</SelectItem>
                      <SelectItem value='full_backup'>Sauvegarde complète</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='file-input'>Fichier</Label>
                  <Input
                    id='file-input'
                    type='file'
                    accept='.csv,.json,.sql'
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className='h-4 w-4' />
                  <AlertTitle>Fichier sélectionné</AlertTitle>
                  <AlertDescription>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
                    MB)
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleImport}
                disabled={!selectedFile || !importType}
                className='w-full md:w-auto'
              >
                <Upload className='mr-2 h-4 w-4' />
                Démarrer l'import
              </Button>
            </CardContent>
          </Card>

          {/* Active Import Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Imports en cours</CardTitle>
              <CardDescription>Progression des imports actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {importJobs
                  .filter(job => job.status === 'running')
                  .map(job => (
                    <div key={job.id} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {getStatusIcon(job.status)}
                          <span className='font-medium'>{job.filename}</span>
                          <Badge variant='outline'>{job.type}</Badge>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Button variant='outline' size='sm'>
                            <Pause className='h-3 w-3' />
                          </Button>
                          <Button variant='outline' size='sm'>
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <Progress value={job.progress} className='w-full' />
                      <div className='flex justify-between text-sm text-muted-foreground'>
                        <span>
                          {job.recordsProcessed} / {job.totalRecords} enregistrements
                        </span>
                        <span>{job.progress}%</span>
                      </div>
                      {job.errors.length > 0 && (
                        <Alert variant='destructive'>
                          <AlertCircle className='h-4 w-4' />
                          <AlertTitle>Erreurs détectées</AlertTitle>
                          <AlertDescription>
                            <ul className='list-inside list-disc space-y-1'>
                              {job.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                {importJobs.filter(job => job.status === 'running').length === 0 && (
                  <p className='py-4 text-center text-muted-foreground'>
                    Aucun import en cours
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='export' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Exporter des données</CardTitle>
              <CardDescription>
                Créez une sauvegarde ou exportez des données spécifiques
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor='export-type'>Type de données</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue placeholder='Sélectionnez le type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='tools'>Outils</SelectItem>
                      <SelectItem value='categories'>Catégories</SelectItem>
                      <SelectItem value='translations'>Traductions</SelectItem>
                      <SelectItem value='full_backup'>Sauvegarde complète</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='export-format'>Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder='Sélectionnez le format' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='csv'>CSV</SelectItem>
                      <SelectItem value='json'>JSON</SelectItem>
                      <SelectItem value='sql'>SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-end'>
                  <Button
                    onClick={handleExport}
                    disabled={!exportType || !exportFormat}
                    className='w-full'
                  >
                    <Download className='mr-2 h-4 w-4' />
                    Créer l'export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Exports */}
          <Card>
            <CardHeader>
              <CardTitle>Exports récents</CardTitle>
              <CardDescription>Téléchargez vos exports précédents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {exportJobs.map(job => (
                  <div
                    key={job.id}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2'>
                        {getStatusIcon(job.status)}
                        <div>
                          <div className='font-medium'>{job.name}</div>
                          <div className='text-sm text-muted-foreground'>
                            {job.type} • {job.format.toUpperCase()} • {job.createdAt}
                          </div>
                        </div>
                      </div>
                      <Badge variant='outline'>{job.format.toUpperCase()}</Badge>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className='flex items-center space-x-2'>
                      {job.size && (
                        <span className='text-sm text-muted-foreground'>
                          {job.size}
                        </span>
                      )}
                      {job.status === 'running' && (
                        <div className='w-24'>
                          <Progress value={job.progress} />
                        </div>
                      )}
                      {job.downloadUrl && (
                        <Button variant='outline' size='sm' asChild>
                          <a href={job.downloadUrl} download>
                            <Download className='mr-1 h-3 w-3' />
                            Télécharger
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='history' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Historique complet</CardTitle>
              <CardDescription>Tous les imports et exports effectués</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <h4 className='font-medium'>Imports récents</h4>
                {importJobs.map(job => (
                  <div
                    key={job.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center space-x-3'>
                      {getStatusIcon(job.status)}
                      <div>
                        <div className='font-medium'>{job.filename}</div>
                        <div className='text-sm text-muted-foreground'>
                          {job.recordsProcessed} / {job.totalRecords} enregistrements •{' '}
                          {job.startTime}
                        </div>
                      </div>
                      <Badge variant='outline'>{job.type}</Badge>
                    </div>
                    <div className='flex items-center space-x-2'>
                      {getStatusBadge(job.status)}
                      {job.status === 'failed' && (
                        <Button variant='outline' size='sm'>
                          <RotateCcw className='mr-1 h-3 w-3' />
                          Relancer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
