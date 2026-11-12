import { Outlet } from 'react-router'
import { BaseLayout } from '@/components/layouts'

export const ErrorBoundary = () => {
    return <div>Something went wrong!</div>
}

const AppRoot = () => {
    return (
        <BaseLayout>
            <Outlet />
        </BaseLayout>
    )
}

export default AppRoot
