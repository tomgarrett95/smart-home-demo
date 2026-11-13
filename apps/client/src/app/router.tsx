import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { paths } from '@/config/paths'

import { MainErrorFallback } from '@/components/errors/main'
import AppRoot from '@/app/routes/app/root'

const convert = (queryClient: QueryClient) => (m: any) => {
    const { clientLoader, clientAction, default: Component, ...rest } = m
    return {
        ...rest,
        loader: clientLoader?.(queryClient),
        action: clientAction?.(queryClient),
        Component,
    }
}

export const createAppRouter = (queryClient: QueryClient) =>
    createBrowserRouter([
        {
            path: paths.home.path,
            lazy: () => import('./routes/landing').then(convert(queryClient)),
        },
        {
            path: paths.app.root.path,
            element: <AppRoot />,
            ErrorBoundary: MainErrorFallback,
            children: [
                {
                    path: paths.app.device.path,
                    lazy: () =>
                        import('./routes/app/devices/device').then(convert(queryClient)),
                },
                {
                    path: paths.app.devices.path,
                    lazy: () =>
                        import('./routes/app/devices/devices').then(convert(queryClient)),
                },
            ],
        },
        {
            path: '*',
            lazy: () => import('./routes/not-found').then(convert(queryClient)),
        },
    ])

export const AppRouter = () => {
    const queryClient = useQueryClient()

    const router = useMemo(() => createAppRouter(queryClient), [queryClient])

    return <RouterProvider router={router} />
}
