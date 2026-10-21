/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '@/context/theme-provider'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { Home } from '..'

const slogan = 'All rivers flow to the sea, opening infinite possibilities'
let client: QueryClient

beforeEach(() => {
  window.localStorage.clear()
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.spyOn(api, 'get').mockImplementation(async (url) => {
    if (url === '/api/home_page_content') {
      return { data: { success: true, data: '' } }
    }
    throw new Error(`Unexpected home request: ${url}`)
  })
})

afterEach(() => {
  client.clear()
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  window.localStorage.clear()
})

async function renderHome() {
  const router = createRouter({
    routeTree: createRootRoute({ component: Home }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('default home page', () => {
  it('shows only the slogan and a sign-in link when signed out', async () => {
    await renderHome()

    expect(
      await screen.findByRole('heading', { level: 1, name: slogan })
    ).toBeInTheDocument()
    const actions = screen.getAllByRole('button')
    expect(actions).toHaveLength(1)
    expect(actions[0]).toHaveAccessibleName('Sign In')
    expect(actions[0]).toHaveAttribute('href', '/sign-in')
  })

  it('links to the dashboard instead of sign-in when signed in', async () => {
    useAuthStore.getState().auth.setUser({
      id: 1,
      username: 'home-user',
      role: 1,
      quota: 0,
      used_quota: 0,
      request_count: 0,
    })
    await renderHome()

    expect(
      await screen.findByRole('button', { name: 'Go to Dashboard' })
    ).toHaveAttribute('href', '/dashboard')
    expect(
      screen.queryByRole('button', { name: 'Sign In' })
    ).not.toBeInTheDocument()
  })

  it('uses the new logo until an administrator configures a custom logo', async () => {
    const view = await renderHome()
    expect(await screen.findByRole('img')).toHaveAttribute(
      'src',
      '/baichuan-logo.png'
    )
    view.unmount()

    useSystemConfigStore.getState().setConfig({ logo: '/custom-logo.png' })
    await renderHome()
    expect(await screen.findByRole('img')).toHaveAttribute(
      'src',
      '/custom-logo.png'
    )
  })
})
