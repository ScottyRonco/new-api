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
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GeneralError } from '../general-error'

describe('general error page', () => {
  it('offers only in-app recovery actions without external issue links', async () => {
    const router = createRouter({
      routeTree: createRootRoute({ component: GeneralError }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)

    const actions = await screen.findAllByRole('button')
    expect(actions.map((action) => action.textContent)).toEqual([
      'Go Back',
      'Back to Home',
    ])
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
