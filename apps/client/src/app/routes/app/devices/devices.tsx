import { QueryClient } from '@tanstack/react-query'
import { getDevicesQueryOptions } from '@/features/devices/api/get-devices'
import { DevicesList } from '@/features/devices/components/devices-list'
import { ContentLayout } from '@/components/layouts'

export const clientLoader = (queryClient: QueryClient) => async () => {
    const queryOptions = getDevicesQueryOptions()

    return (
        queryClient.getQueryData(queryOptions.queryKey) ??
        (await queryClient.query(queryOptions))
    )
}

const DevicesRoute = () => {
    return (
        <ContentLayout title={'Your Devices'}>
            <DevicesList />
        </ContentLayout>
    )
}

export default DevicesRoute
