/**
 * AdvancedFilters Component
 * Advanced filtering interface for admin tables
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Badge } from "@/src/components/ui/badge"
import { 
  Filter, 
  X, 
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible"

interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'checkbox' | 'date' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface AdvancedFiltersProps {
  filters: FilterOption[]
  onFiltersChange: (filters: Record<string, any>) => void
  onReset: () => void
  defaultValues?: Record<string, any>
  showCount?: number
}

export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  onReset,
  defaultValues = {},
  showCount
}: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>(defaultValues)
  
  const form = useForm({
    defaultValues
  })

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value }
    if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key]
    }
    setActiveFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleReset = () => {
    setActiveFilters({})
    form.reset()
    onReset()
  }

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] && activeFilters[key] !== ''
  ).length

  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case 'text':
        return (
          <FormField
            control={form.control}
            name={filter.key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{filter.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={filter.placeholder}
                    onChange={(e) => {
                      field.onChange(e)
                      handleFilterChange(filter.key, e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'select':
        return (
          <FormField
            control={form.control}
            name={filter.key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{filter.label}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleFilterChange(filter.key, value)
                    }}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filter.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'checkbox':
        return (
          <FormField
            control={form.control}
            name={filter.key}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked)
                      handleFilterChange(filter.key, checked)
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{filter.label}</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )

      case 'number':
        return (
          <FormField
            control={form.control}
            name={filter.key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{filter.label}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={filter.placeholder}
                    onChange={(e) => {
                      field.onChange(e)
                      handleFilterChange(filter.key, e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filtres</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} actif{activeFilterCount > 1 ? 's' : ''}
              </Badge>
            )}
            {showCount !== undefined && (
              <Badge variant="outline">
                {showCount} résultat{showCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent>
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>
            </Form>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-sm font-medium">Filtres actifs:</span>
                  {Object.entries(activeFilters).map(([key, value]) => {
                    if (!value || value === '' || value === 'all') return null
                    const filter = filters.find(f => f.key === key)
                    const displayValue = filter?.type === 'select' 
                      ? filter.options?.find(opt => opt.value === value)?.label || value
                      : value.toString()
                    
                    return (
                      <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                        <span>{filter?.label}: {displayValue}</span>
                        <button
                          onClick={() => handleFilterChange(key, '')}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}