import { useQuery, queryOptions, useSuspenseQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import type { QueryConfig } from '@/lib/react-query'
import type { Device } from '@smart-home/packages/devices'

export const getDevice = ({ deviceId }: { deviceId: string }): Promise<Device> => {
    return api.get(`/devices/${deviceId}`)
}

export const getDeviceQueryOptions = (deviceId: string) => {
    return queryOptions({
        queryKey: ['devices', deviceId],
        queryFn: () => getDevice({ deviceId }),
    })
}

type UseDeviceOptions = {
    deviceId: string
    queryConfig?: QueryConfig<typeof getDeviceQueryOptions>
}

export const useDevice = ({ deviceId, queryConfig }: UseDeviceOptions) => {
    return useQuery({
        ...getDeviceQueryOptions(deviceId),
        ...queryConfig,
    })
}

export const useSuspenseDevice = ({ deviceId, queryConfig }: UseDeviceOptions) => {
    return useSuspenseQuery({
        ...getDeviceQueryOptions(deviceId),
        ...queryConfig,
    })
}
