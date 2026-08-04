'use client'

import PlatformInitializer from '@/components/platform-initializer'
import PlatformShell from '@/components/platform-shell'
import PlatformStudio from '@/components/platform-studio'

export default function Page() {
  return (
    <PlatformInitializer>
      <PlatformShell title="ONE Studio">
        <PlatformStudio />
      </PlatformShell>
    </PlatformInitializer>
  )
}
