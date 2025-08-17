/**
 * TranslationTabs Component
 * Multilingual content management with tabs
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Globe, Check, AlertCircle, Save } from 'lucide-react'

interface Translation {
  language: string
  languageCode: string
  name: string
  description: string
  overview: string
  metaTitle: string
  metaDescription: string
  status: 'complete' | 'partial' | 'missing'
  quality: number
}

interface TranslationTabsProps {
  translations: Translation[]
  onSave: (translations: Translation[]) => void
  loading?: boolean
}

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
]

export const TranslationTabs = ({ translations, onSave, loading = false }: TranslationTabsProps) => {
  const [activeTab, setActiveTab] = useState('fr')
  const [editedTranslations, setEditedTranslations] = useState<Record<string, Partial<Translation>>>(
    Object.fromEntries(translations.map(t => [t.languageCode, { ...t }]))
  )

  const updateTranslation = (languageCode: string, field: keyof Translation, value: string) => {
    setEditedTranslations(prev => ({
      ...prev,
      [languageCode]: {
        ...prev[languageCode],
        [field]: value
      }
    }))
  }

  const getTranslationStatus = (translation: Partial<Translation>) => {
    const requiredFields = ['name', 'description', 'overview']
    const filledFields = requiredFields.filter(field => 
      translation[field as keyof Translation] && 
      (translation[field as keyof Translation] as string).trim() !== ''
    )
    
    if (filledFields.length === requiredFields.length) return 'complete'
    if (filledFields.length > 0) return 'partial'
    return 'missing'
  }

  const getStatusBadge = (status: string, quality?: number) => {
    switch (status) {
      case 'complete':
        return (
          <Badge variant="default" className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Complet {quality && `(${quality}%)`}
          </Badge>
        )
      case 'partial':
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Partiel
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Manquant
          </Badge>
        )
    }
  }

  const handleSave = () => {
    const updatedTranslations = LANGUAGES.map(lang => {
      const edited = editedTranslations[lang.code] || {}
      const original = translations.find(t => t.languageCode === lang.code)
      
      return {
        language: lang.name,
        languageCode: lang.code,
        name: edited.name || original?.name || '',
        description: edited.description || original?.description || '',
        overview: edited.overview || original?.overview || '',
        metaTitle: edited.metaTitle || original?.metaTitle || '',
        metaDescription: edited.metaDescription || original?.metaDescription || '',
        status: getTranslationStatus(edited) as 'complete' | 'partial' | 'missing',
        quality: edited.quality || original?.quality || 0
      }
    })

    onSave(updatedTranslations)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Traductions
            </CardTitle>
            <CardDescription>
              Gérez le contenu dans toutes les langues
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            {LANGUAGES.map((lang) => {
              const translation = editedTranslations[lang.code]
              const status = getTranslationStatus(translation || {})
              
              return (
                <TabsTrigger key={lang.code} value={lang.code} className="flex items-center space-x-1">
                  <span>{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'complete' ? 'bg-green-500' :
                    status === 'partial' ? 'bg-yellow-500' : 'bg-gray-300'
                  }`} />
                </TabsTrigger>
              )
            })}
          </TabsList>

          {LANGUAGES.map((lang) => {
            const translation = editedTranslations[lang.code] || {}
            const status = getTranslationStatus(translation)
            const quality = translation.quality || 0

            return (
              <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </h3>
                  {getStatusBadge(status, quality)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${lang.code}`}>Nom *</Label>
                    <Input
                      id={`name-${lang.code}`}
                      value={translation.name || ''}
                      onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
                      placeholder="Nom de l'outil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`meta-title-${lang.code}`}>Titre meta</Label>
                    <Input
                      id={`meta-title-${lang.code}`}
                      value={translation.metaTitle || ''}
                      onChange={(e) => updateTranslation(lang.code, 'metaTitle', e.target.value)}
                      placeholder="Titre pour SEO"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`description-${lang.code}`}>Description *</Label>
                    <Textarea
                      id={`description-${lang.code}`}
                      value={translation.description || ''}
                      onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
                      placeholder="Description courte de l'outil"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`overview-${lang.code}`}>Vue d'ensemble *</Label>
                    <Textarea
                      id={`overview-${lang.code}`}
                      value={translation.overview || ''}
                      onChange={(e) => updateTranslation(lang.code, 'overview', e.target.value)}
                      placeholder="Description détaillée de l'outil"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`meta-description-${lang.code}`}>Meta description</Label>
                    <Textarea
                      id={`meta-description-${lang.code}`}
                      value={translation.metaDescription || ''}
                      onChange={(e) => updateTranslation(lang.code, 'metaDescription', e.target.value)}
                      placeholder="Description pour les moteurs de recherche"
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}