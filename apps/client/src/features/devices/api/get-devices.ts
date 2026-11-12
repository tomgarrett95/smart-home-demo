import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import type { QueryConfig } from '@/lib/react-query'
import { type Device } from '@smart-home/packages/devices'

export const getDevices = (): Promise<Device[]> => {
    return api.get(`/devices`)
}

export const getDevicesQueryOptions = () => {
    return queryOptions({
        queryKey: ['devices'],
        queryFn: getDevices,
    })
}

type UseDevicesOptions = {
    queryConfig?: QueryConfig<typeof getDevicesQueryOptions>
}

export const useDevices = ({ queryConfig }: UseDevicesOptions) => {
    return useQuery({
        ...getDevicesQueryOptions(),
        ...queryConfig,
    })
}
