import { QueryClient } from '@tanstack/react-query'
import { getDevicesQueryOptions } from '@/features/devices/api/get-devices'
import { DevicesList } from '@/features/devices/components/devices-list'
import { ContentLayout } from '@/components/layouts'
import { CreateDevice } from '@/features/devices/components/create-device'

export const clientLoader = (queryClient: QueryClient) => async () => {
    const queryOptions = getDevicesQueryOptions()

    return (
        queryClient.getQueryData(queryOptions.queryKey) ??
        (await queryClient.query(queryOptions))
    )
}

const DevicesRoute = () => {
    return (
        <ContentLayout
            title={'Your Devices'}
            header={
                <div className={'flex items-center justify-between'}>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Your Devices
                    </h1>
                    <CreateDevice />
                </div>
            }
        >
            <DevicesList />
        </ContentLayout>
    )
}

export default DevicesRoute
