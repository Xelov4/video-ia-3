/**
 * DatabaseViewer Component
 * Advanced database management and monitoring interface
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Database, 
  Table as TableIcon, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  HardDrive,
  Users,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react'
import { AdminTable } from '@/src/components/admin/AdminTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Progress } from "@/src/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert"

interface TableStats {
  name: string
  rows: number
  size: string
  lastUpdate: string
  status: 'healthy' | 'warning' | 'error'
  growth: string
}

interface DatabaseConnection {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error'
  type: 'postgresql' | 'mysql' | 'mongodb'
  host: string
  database: string
  uptime: string
  queries: number
}

export const DatabaseViewer = () => {
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock database stats
  const dbStats = {
    totalTables: 15,
    totalRows: 2847592,
    databaseSize: '2.4 GB',
    dailyQueries: 14520,
    connections: 12,
    uptime: '15 days'
  }

  const tableStats: TableStats[] = [
    { name: 'tools', rows: 16763, size: '1.2 GB', lastUpdate: '2 min ago', status: 'healthy', growth: '+12 today' },
    { name: 'categories', rows: 140, size: '12 MB', lastUpdate: '5 min ago', status: 'healthy', growth: '+2 this week' },
    { name: 'tool_translations', rows: 117341, size: '890 MB', lastUpdate: '1 min ago', status: 'healthy', growth: '+156 today' },
    { name: 'admin_users', rows: 8, size: '2 MB', lastUpdate: '2 hours ago', status: 'healthy', growth: 'No change' },
    { name: 'sessions', rows: 1247, size: '45 MB', lastUpdate: '30 sec ago', status: 'warning', growth: '+89 today' },
    { name: 'analytics_events', rows: 2698234, size: '340 MB', lastUpdate: '10 sec ago', status: 'healthy', growth: '+1.2k today' }
  ]

  const connections: DatabaseConnection[] = [
    {
      id: 'main',
      name: 'Main Database',
      status: 'connected',
      type: 'postgresql',
      host: 'localhost:5432',
      database: 'video_ia_net',
      uptime: '15 days, 4 hours',
      queries: 14520
    }
  ]

  const tableColumns = [
    {
      key: 'table',
      label: 'Table',
      sortable: true,
      render: (value: any, row: TableStats) => (
        <div className="flex items-center space-x-3">
          <TableIcon className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.rows.toLocaleString()} rows</div>
          </div>
        </div>
      )
    },
    {
      key: 'size',
      label: 'Taille',
      sortable: true,
      render: (value: any, row: TableStats) => (
        <Badge variant="outline">{row.size}</Badge>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: any, row: TableStats) => (
        <div className="flex items-center space-x-2">
          {row.status === 'healthy' && <CheckCircle className="h-4 w-4 text-green-500" />}
          {row.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
          {row.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
          <span className="capitalize">{row.status}</span>
        </div>
      )
    },
    {
      key: 'activity',
      label: 'Activité',
      render: (value: any, row: TableStats) => (
        <div className="space-y-1">
          <div className="text-sm">{row.lastUpdate}</div>
          <div className="text-xs text-muted-foreground">{row.growth}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: TableStats) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Search className="h-3 w-3 mr-1" />
            Explorer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      )
    }
  ]

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Base de données</h2>
          <p className="text-muted-foreground">Surveillance et gestion de la base de données</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
        </div>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats.totalTables}</div>
            <p className="text-xs text-muted-foreground">tables actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enregistrements</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats.totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">total rows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taille DB</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats.databaseSize}</div>
            <p className="text-xs text-muted-foreground">espace utilisé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requêtes/jour</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats.dailyQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">dernières 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats.connections}</div>
            <p className="text-xs text-muted-foreground">actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15d</div>
            <p className="text-xs text-muted-foreground">{dbStats.uptime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Database Health Status */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>État de la base de données</AlertTitle>
        <AlertDescription>
          Toutes les connexions sont actives. Performance optimale. Dernière sauvegarde: il y a 2 heures.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="connections">Connexions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          {/* Table Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les tables</SelectItem>
                {tableStats.map((table) => (
                  <SelectItem key={table.name} value={table.name}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tables List */}
          <AdminTable
            title="Tables de la base de données"
            description={`${tableStats.length} tables trouvées`}
            columns={tableColumns}
            data={tableStats}
            loading={loading}
            totalCount={tableStats.length}
            pageSize={10}
            currentPage={1}
            onPageChange={() => {}}
            onSort={() => {}}
          />
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4">
            {connections.map((conn) => (
              <Card key={conn.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      {conn.name}
                    </CardTitle>
                    <Badge variant={conn.status === 'connected' ? 'default' : 'destructive'}>
                      {conn.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium">Type</div>
                      <div className="text-sm text-muted-foreground capitalize">{conn.type}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Host</div>
                      <div className="text-sm text-muted-foreground">{conn.host}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Database</div>
                      <div className="text-sm text-muted-foreground">{conn.database}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Uptime</div>
                      <div className="text-sm text-muted-foreground">{conn.uptime}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de performance</CardTitle>
              <CardDescription>Surveillance en temps réel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="mt-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="mt-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Disk I/O</span>
                  <span>12%</span>
                </div>
                <Progress value={12} className="mt-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Network</span>
                  <span>8%</span>
                </div>
                <Progress value={8} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des sauvegardes</CardTitle>
              <CardDescription>Backup et restauration de la base de données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Sauvegarde automatique</div>
                  <div className="text-sm text-muted-foreground">Dernière: il y a 2 heures</div>
                </div>
                <Badge variant="default">Activée</Badge>
              </div>
              
              <div className="flex space-x-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Nouvelle sauvegarde
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}