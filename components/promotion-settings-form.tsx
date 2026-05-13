'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { promotionSettingsSchema, PromotionSettings } from '@/lib/validation/settings'
import { SectionCard } from './section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

export function PromotionSettingsForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<PromotionSettings>({
    resolver: zodResolver(promotionSettingsSchema),
    defaultValues: {
      enableAutoPromotion: false,
      minimumPassMark: 40,
      promotionNote: '',
    },
  })

  async function onSubmit(data: PromotionSettings) {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/promotion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save promotion settings')

      toast({
        title: 'Success',
        description: 'Promotion settings saved successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard
      title="Promotion Settings"
      description="Configure automatic student promotion policies"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Enable Auto Promotion Toggle */}
          <FormField
            control={form.control}
            name="enableAutoPromotion"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="space-y-1">
                  <FormLabel className="text-base font-medium cursor-pointer">
                    Enable Automatic Student Promotion
                  </FormLabel>
                  <FormDescription>
                    Automatically promote eligible students based on minimum pass mark
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Minimum Pass Mark */}
          <FormField
            control={form.control}
            name="minimumPassMark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Pass Mark</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="40"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </FormControl>
                <FormDescription>
                  The minimum score required for a student to be promoted to the next class
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Promotion Note */}
          <FormField
            control={form.control}
            name="promotionNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotion Note / Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes or guidelines for student promotion..."
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormDescription>
                  Optional additional information about the promotion policy
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Promotion Settings'}
          </Button>
        </form>
      </Form>
    </SectionCard>
  )
}
