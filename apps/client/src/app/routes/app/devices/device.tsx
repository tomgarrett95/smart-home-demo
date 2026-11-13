import { QueryClient } from '@tanstack/react-query'
import { ContentLayout } from '@/components/layouts'
import { type LoaderFunctionArgs, useParams } from 'react-router'
import { getDeviceQueryOptions, useDevice } from '@/features/devices/api/get-device'
import { Separator, Spinner } from '@heroui/react'
import { LinkButton } from '@/components/ui'
import { paths } from '@/config/paths'
import { ArrowBackIos } from '@mui/icons-material'
import { UpdateDevice } from '@/features/devices/components/update-device'
import { DeleteDevice } from '@/features/devices/components/delete-device'
import { DeviceIcon } from '@/features/devices/components/device-icon'

export const clientLoader =
    (queryClient: QueryClient) =>
    async ({ params }: LoaderFunctionArgs) => {
        const deviceId = params.deviceId as string

        const queryOptions = getDeviceQueryOptions(deviceId)

        return (
            queryClient.getQueryData(queryOptions.queryKey) ??
            (await queryClient.query(queryOptions))
        )
    }

const DeviceRoute = () => {
    const params = useParams()
    const deviceId = params.deviceId as string
    const deviceQuery = useDevice({ deviceId })

    if (deviceQuery.isLoading) {
        return (
            <div className="flex h-48 w-full items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    const device = deviceQuery.data

    if (!device) return null

    return (
        <ContentLayout
            title={device.name}
            header={
                <div className={'flex flex-col gap-y-2'}>
                    <LinkButton
                        to={paths.app.devices.getHref()}
                        variant={'ghost'}
                    >
                        <ArrowBackIos fontSize={'small'} />
                        All devices
                    </LinkButton>
                    <div className={'flex items-center gap-x-2 text-slate-900'}>
                        <DeviceIcon deviceType={device.deviceType} />
                        <h1 className="text-2xl font-semibold">{device.name}</h1>
                    </div>
                </div>
            }
        >
            <div className={'flex flex-col gap-y-8'}>
                <UpdateDevice />
                <Separator />
                <DeleteDevice />
            </div>
        </ContentLayout>
    )
}

export default DeviceRoute
