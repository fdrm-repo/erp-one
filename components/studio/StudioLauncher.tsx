'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LauncherWorkspace {
  id: string
  name: string
  description: string
  recent: string[]
}

interface StudioLauncherProps {
  workspaces: LauncherWorkspace[]
  onOpenWorkspace: (workspaceId: string) => void
}

export function StudioLauncher({ workspaces, onOpenWorkspace }: StudioLauncherProps) {
  return (
    <div className="flex min-h-full flex-col bg-background px-6 py-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-border bg-card/80 p-10 shadow-lg shadow-black/5">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">ONE Studio</p>
            <h1 className="mt-3 text-4xl font-semibold text-foreground">Build your enterprise workspace</h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              Launch a workspace, continue a recent studio session, or create a new application-ready project.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <Card key={workspace.id} className="bg-background/70">
                  <CardHeader>
                    <CardTitle>{workspace.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{workspace.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {workspace.recent.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                    <Button className="mt-4" onClick={() => onOpenWorkspace(workspace.id)}>
                      Open {workspace.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-background/60 p-6">
              <div className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Quick start</div>
              <div className="mt-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Continue where you left off</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Pick an existing workspace and jump straight into the editor.</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Create a new workspace</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Start a fresh application workspace from scratch.</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Import modules</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Bring in existing entities, templates and workflows.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
