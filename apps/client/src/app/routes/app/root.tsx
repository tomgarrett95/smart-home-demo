import { Outlet } from 'react-router'
import { BaseLayout } from '@/components/layouts'

const AppRoot = () => {
    return (
        <BaseLayout>
            <Outlet />
        </BaseLayout>
    )
}

export default AppRoot
