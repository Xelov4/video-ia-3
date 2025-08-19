'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import {
  ChevronsUpDown,
  Check,
  Bot,
  FileText,
  Tags,
  Languages,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { Badge } from '@/src/components/ui/badge';

import { cn } from '@/src/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { toast } from 'sonner';

interface Tool {
  id: number;
  toolName: string;
}

type ActionModule = 'full_scrape' | 'seo' | 'pricing' | 'translate';

const actionModules: {
  id: ActionModule;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'full_scrape',
    title: 'Analyse Complète',
    description: "Lance le scraping complet et l'analyse IA de l'URL.",
    icon: <Bot />,
  },
  {
    id: 'seo',
    title: 'Génération SEO',
    description: 'Génère un nouveau Meta Titre et une Meta Description.',
    icon: <Tags />,
  },
  {
    id: 'pricing',
    title: 'Analyse de Prix',
    description: 'Extrait ou met à jour les informations de pricing.',
    icon: <FileText />,
  },
  {
    id: 'translate',
    title: 'Traduction',
    description: 'Traduit les champs textuels dans une ou plusieurs langues.',
    icon: <Languages />,
  },
];

const availableLanguages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
];

const ScraperDetailsPage = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [searchedTools, setSearchedTools] = useState<Tool[]>([]);
  const [open, setOpen] = useState(false);
  const [activeModules, setActiveModules] = useState<ActionModule[]>([]);
  const [translateConfig, setTranslateConfig] = useState({
    sourceLang: 'en',
    targetLangs: [] as string[],
    instructions: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchedTools([]);
      return;
    }
    const response = await fetch(`/api/admin/tools/search?query=${query}`);
    const data = await response.json();
    if (data.success) {
      setSearchedTools(data.tools);
    }
  };

  const toggleModule = (moduleId: ActionModule) => {
    setActiveModules(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleTargetLangSelect = (langCode: string) => {
    setTranslateConfig(prev => {
      const newTargetLangs = prev.targetLangs.includes(langCode)
        ? prev.targetLangs.filter(code => code !== langCode)
        : [...prev.targetLangs, langCode];
      return { ...prev, targetLangs: newTargetLangs };
    });
  };

  const handleAnalysis = async () => {
    if (!selectedTool) {
      toast.error("Veuillez d'abord sélectionner un outil.");
      return;
    }
    if (activeModules.length === 0) {
      toast.error("Veuillez sélectionner au moins un module d'action.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    const requestBody: {
      toolId: number;
      modules: ActionModule[];
      translateConfig?: typeof translateConfig;
    } = {
      toolId: selectedTool.id,
      modules: activeModules,
    };

    if (activeModules.includes('translate')) {
      requestBody.translateConfig = translateConfig;
    }

    try {
      const response = await fetch('/api/admin/scraper-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Analyse lancée avec succès !');
        setAnalysisResult(data.results);
      } else {
        toast.error(data.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      toast.error('Une erreur réseau est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <CardTitle>Étape 1 : Sélection de l'Outil</CardTitle>
          <CardDescription>
            Recherchez et sélectionnez l'outil que vous souhaitez analyser ou modifier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='w-[400px] justify-between'
              >
                {selectedTool ? selectedTool.toolName : 'Sélectionner un outil...'}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[400px] p-0'>
              <Command>
                <CommandInput
                  placeholder='Rechercher un outil...'
                  onValueChange={handleSearch}
                />
                <CommandList>
                  <CommandEmpty>Aucun outil trouvé.</CommandEmpty>
                  <CommandGroup>
                    {searchedTools.map(tool => (
                      <CommandItem
                        key={tool.id}
                        value={tool.toolName}
                        onSelect={() => {
                          setSelectedTool(tool);
                          setOpen(false);
                        }}
                        onMouseDown={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedTool(tool);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedTool?.id === tool.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {tool.toolName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {selectedTool && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Étape 2 : Choix des Modules d'Action</CardTitle>
              <CardDescription>
                Sélectionnez les actions que vous souhaitez effectuer sur "
                {selectedTool.toolName}".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {actionModules.map(module => (
                  <div
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-4 transition-all',
                      activeModules.includes(module.id)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'bg-white hover:bg-gray-50'
                    )}
                  >
                    <div className='flex items-center gap-4'>
                      {module.icon}
                      <h3 className='font-semibold'>{module.title}</h3>
                    </div>
                    <p className='mt-2 text-sm text-gray-600'>{module.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {activeModules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Étape 3 : Configuration et Exécution</CardTitle>
                <CardDescription>
                  Configurez les options pour les modules sélectionnés.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {activeModules.includes('translate') && (
                    <Card className='bg-white'>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Languages /> Configuration de la Traduction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div>
                          <label className='font-medium'>Langue Source</label>
                          <Select
                            value={translateConfig.sourceLang}
                            onValueChange={value =>
                              setTranslateConfig(prev => ({
                                ...prev,
                                sourceLang: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLanguages.map(lang => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className='font-medium'>Langues Cibles</label>
                          <div className='mt-2 flex flex-wrap gap-2'>
                            {availableLanguages
                              .filter(lang => lang.code !== translateConfig.sourceLang)
                              .map(lang => (
                                <Badge
                                  key={lang.code}
                                  variant={
                                    translateConfig.targetLangs.includes(lang.code)
                                      ? 'default'
                                      : 'outline'
                                  }
                                  onClick={() => handleTargetLangSelect(lang.code)}
                                  className='cursor-pointer'
                                >
                                  {lang.name}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <div>
                          <label className='font-medium'>
                            Instructions Spécifiques (Optionnel)
                          </label>
                          <Textarea
                            placeholder="Ex: Adopte un ton plus formel, utilise le mot-clé 'IA conversationnelle'..."
                            value={translateConfig.instructions}
                            onChange={e =>
                              setTranslateConfig(prev => ({
                                ...prev,
                                instructions: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {/* Autres configurations de modules viendront ici */}
                </div>
                <div className='mt-6'>
                  <Button onClick={handleAnalysis} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Lancement...
                      </>
                    ) : (
                      "Lancer l'Analyse"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>Résultats de l'Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='overflow-x-auto rounded-md bg-gray-100 p-4'>
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ScraperDetailsPage;
