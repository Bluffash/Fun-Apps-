'use client'

import { useState } from 'react'
import { LEAGUES_BY_SPORT, SPORTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Settings } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Follow {
  league: string
  sport: string
}

interface LeaguePickerProps {
  followed: Follow[]
  onSave: (follows: Follow[]) => void
}

export function LeaguePicker({ followed, onSave }: LeaguePickerProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Follow[]>(followed)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  function toggle(league: string, sport: string) {
    setSelected((prev) =>
      prev.some((f) => f.league === league)
        ? prev.filter((f) => f.league !== league)
        : [...prev, { league, sport }]
    )
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/users/me/feed', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leagues: selected }),
    })
    setSaving(false)
    if (res.ok) {
      onSave(selected)
      setOpen(false)
      toast({ title: 'Feed preferences saved!' })
    } else {
      toast({ title: 'Failed to save', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-1" />
          Manage Leagues
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Follow Leagues</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {SPORTS.filter((s) => LEAGUES_BY_SPORT[s.slug]?.length).map((sport) => (
            <div key={sport.slug}>
              <h3 className="font-semibold text-sm mb-2">
                {sport.icon} {sport.name}
              </h3>
              <div className="space-y-2 pl-3">
                {LEAGUES_BY_SPORT[sport.slug]?.map((league) => (
                  <div key={league.slug} className="flex items-center gap-2">
                    <Checkbox
                      id={league.slug}
                      checked={selected.some((f) => f.league === league.slug)}
                      onCheckedChange={() => toggle(league.slug, league.sport)}
                    />
                    <Label htmlFor={league.slug} className="font-normal cursor-pointer">
                      {league.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
