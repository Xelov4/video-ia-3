'use client';

import * as React from 'react';
import {
  Search,
  X,
  Star,
  Zap,
  Users,
  Target,
  Tag,
  SlidersHorizontal,
  Sparkles,
  Bot,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Slider } from '@/src/components/ui/slider';
import { Switch } from '@/src/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { cn } from '@/src/lib/utils';

interface FilterState {
  searchQuery: string;
  categories: string[];
  audiences: string[];
  pricing: string[];
  features: string[];
  qualityScore: number[];
  sortBy: string;
  showFeatured: boolean;
  showNew: boolean;
}

interface AdvancedFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: FilterState) => void;
  categories?: Array<{ name: string; count: number }>;
  audiences?: Array<{ name: string; count: number }>;
}

const MOCK_CATEGORIES = [
  { name: 'AI Assistant', count: 1247, icon: Bot },
  { name: 'Content Creation', count: 892, icon: Sparkles },
  { name: 'Image Generation', count: 634, icon: Target },
  { name: 'Video Tools', count: 523, icon: Tag },
  { name: 'Writing Tools', count: 445, icon: Users },
  { name: 'Data Analysis', count: 387, icon: TrendingUp },
  { name: 'Audio Tools', count: 298, icon: Zap },
  { name: 'Marketing', count: 267, icon: Star },
];

const MOCK_AUDIENCES = [
  { name: 'Developers', count: 892 },
  { name: 'Content Creators', count: 743 },
  { name: 'Marketers', count: 623 },
  { name: 'Designers', count: 512 },
  { name: 'Writers', count: 445 },
  { name: 'Students', count: 334 },
  { name: 'Entrepreneurs', count: 298 },
  { name: 'Researchers', count: 234 },
];

const PRICING_OPTIONS = [
  { label: 'Free', value: 'free', count: 3456 },
  { label: 'Freemium', value: 'freemium', count: 2134 },
  { label: 'Paid', value: 'paid', count: 1876 },
  { label: 'Enterprise', value: 'enterprise', count: 892 },
];

const FEATURE_OPTIONS = [
  { label: 'API Available', value: 'api', count: 2134 },
  { label: 'No Signup Required', value: 'no_signup', count: 1876 },
  { label: 'Open Source', value: 'open_source', count: 892 },
  { label: 'Chrome Extension', value: 'chrome_ext', count: 743 },
  { label: 'Mobile App', value: 'mobile', count: 623 },
  { label: 'Offline Mode', value: 'offline', count: 445 },
];

export default function AdvancedFilterSidebar({
  isOpen,
  onClose,
  onFiltersChange,
  categories = MOCK_CATEGORIES,
  audiences = MOCK_AUDIENCES,
}: AdvancedFilterSidebarProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    searchQuery: '',
    categories: [],
    audiences: [],
    pricing: [],
    features: [],
    qualityScore: [1, 10],
    sortBy: 'popularity',
    showFeatured: false,
    showNew: false,
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleArrayFilter = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      searchQuery: '',
      categories: [],
      audiences: [],
      pricing: [],
      features: [],
      qualityScore: [1, 10],
      sortBy: 'popularity',
      showFeatured: false,
      showNew: false,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.audiences.length > 0 ||
      filters.pricing.length > 0 ||
      filters.features.length > 0 ||
      filters.showFeatured ||
      filters.showNew ||
      filters.searchQuery.trim() !== ''
    );
  };

  const getActiveFilterCount = () => {
    return (
      filters.categories.length +
      filters.audiences.length +
      filters.pricing.length +
      filters.features.length +
      (filters.showFeatured ? 1 : 0) +
      (filters.showNew ? 1 : 0)
    );
  };

  if (!isOpen) return null;

  return (
    <div className='h-screen w-80 overflow-y-auto border-r bg-background'>
      <div className='sticky top-0 z-10 border-b bg-background/95 p-4 backdrop-blur-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <SlidersHorizontal className='h-5 w-5 text-primary' />
            <h2 className='text-lg font-semibold'>Filtres Avancés</h2>
            {hasActiveFilters() && (
              <Badge variant='secondary' className='text-xs'>
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        {/* Search */}
        <div className='mt-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Rechercher des outils...'
              value={filters.searchQuery}
              onChange={e => updateFilters({ searchQuery: e.target.value })}
              className='pl-9'
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-4 flex items-center space-x-2'>
          <Button
            variant={hasActiveFilters() ? 'default' : 'ghost'}
            size='sm'
            onClick={clearAllFilters}
            disabled={!hasActiveFilters()}
          >
            Effacer tout
          </Button>
          <div className='flex items-center space-x-2'>
            <Switch
              checked={filters.showFeatured}
              onCheckedChange={checked => updateFilters({ showFeatured: checked })}
            />
            <span className='text-sm'>En vedette</span>
          </div>
        </div>
      </div>

      <div className='space-y-6 p-4'>
        {/* Sort Options */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center space-x-2 text-sm'>
              <TrendingUp className='h-4 w-4' />
              <span>Trier par</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={filters.sortBy}
              onValueChange={value => updateFilters({ sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='popularity'>Popularité</SelectItem>
                <SelectItem value='rating'>Note</SelectItem>
                <SelectItem value='newest'>Plus récent</SelectItem>
                <SelectItem value='alphabetical'>Alphabétique</SelectItem>
                <SelectItem value='category'>Catégorie</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quality Score */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center space-x-2 text-sm'>
              <Star className='h-4 w-4' />
              <span>Score de qualité</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Slider
                value={filters.qualityScore}
                onValueChange={value => updateFilters({ qualityScore: value })}
                max={10}
                min={1}
                step={0.5}
                className='w-full'
              />
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>{filters.qualityScore[0]}</span>
                <span>{filters.qualityScore[1]}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <Tabs defaultValue='categories' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='categories' className='text-xs'>
              Cat.
            </TabsTrigger>
            <TabsTrigger value='audiences' className='text-xs'>
              Public
            </TabsTrigger>
            <TabsTrigger value='pricing' className='text-xs'>
              Prix
            </TabsTrigger>
            <TabsTrigger value='features' className='text-xs'>
              Options
            </TabsTrigger>
          </TabsList>

          {/* Categories */}
          <TabsContent value='categories' className='mt-4 space-y-3'>
            <div className='max-h-80 space-y-2 overflow-y-auto'>
              {categories.map(category => {
                const Icon = category.icon || Bot;
                const isSelected = filters.categories.includes(category.name);
                return (
                  <div
                    key={category.name}
                    className={cn(
                      'flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all hover:bg-accent',
                      isSelected && 'border-primary bg-primary/10'
                    )}
                    onClick={() =>
                      updateFilters({
                        categories: toggleArrayFilter(
                          filters.categories,
                          category.name
                        ),
                      })
                    }
                  >
                    <Checkbox checked={isSelected} />
                    <Icon className='h-4 w-4 text-primary' />
                    <div className='min-w-0 flex-1'>
                      <div className='truncate text-sm font-medium'>
                        {category.name}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {category.count} outils
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Audiences */}
          <TabsContent value='audiences' className='mt-4 space-y-3'>
            <div className='max-h-80 space-y-2 overflow-y-auto'>
              {audiences.map(audience => {
                const isSelected = filters.audiences.includes(audience.name);
                return (
                  <div
                    key={audience.name}
                    className={cn(
                      'flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all hover:bg-accent',
                      isSelected && 'border-primary bg-primary/10'
                    )}
                    onClick={() =>
                      updateFilters({
                        audiences: toggleArrayFilter(filters.audiences, audience.name),
                      })
                    }
                  >
                    <Checkbox checked={isSelected} />
                    <Users className='h-4 w-4 text-primary' />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>{audience.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {audience.count} outils
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value='pricing' className='mt-4 space-y-3'>
            <div className='space-y-2'>
              {PRICING_OPTIONS.map(option => {
                const isSelected = filters.pricing.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all hover:bg-accent',
                      isSelected && 'border-primary bg-primary/10'
                    )}
                    onClick={() =>
                      updateFilters({
                        pricing: toggleArrayFilter(filters.pricing, option.value),
                      })
                    }
                  >
                    <Checkbox checked={isSelected} />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>{option.label}</div>
                      <div className='text-xs text-muted-foreground'>
                        {option.count} outils
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Features */}
          <TabsContent value='features' className='mt-4 space-y-3'>
            <div className='space-y-2'>
              {FEATURE_OPTIONS.map(feature => {
                const isSelected = filters.features.includes(feature.value);
                return (
                  <div
                    key={feature.value}
                    className={cn(
                      'flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all hover:bg-accent',
                      isSelected && 'border-primary bg-primary/10'
                    )}
                    onClick={() =>
                      updateFilters({
                        features: toggleArrayFilter(filters.features, feature.value),
                      })
                    }
                  >
                    <Checkbox checked={isSelected} />
                    <div className='flex-1'>
                      <div className='text-sm font-medium'>{feature.label}</div>
                      <div className='text-xs text-muted-foreground'>
                        {feature.count} outils
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <Card className='border-primary/20 bg-primary/5'>
            <CardContent className='pt-4'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-sm font-medium'>Filtres actifs</span>
                <Badge variant='outline'>{getActiveFilterCount()}</Badge>
              </div>
              <div className='space-y-2'>
                {filters.categories.map(cat => (
                  <Badge key={cat} variant='secondary' className='mb-1 mr-1'>
                    {cat}
                    <X
                      className='ml-1 h-3 w-3 cursor-pointer'
                      onClick={() =>
                        updateFilters({
                          categories: filters.categories.filter(c => c !== cat),
                        })
                      }
                    />
                  </Badge>
                ))}
                {filters.audiences.map(aud => (
                  <Badge key={aud} variant='secondary' className='mb-1 mr-1'>
                    {aud}
                    <X
                      className='ml-1 h-3 w-3 cursor-pointer'
                      onClick={() =>
                        updateFilters({
                          audiences: filters.audiences.filter(a => a !== aud),
                        })
                      }
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
