import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'
import type { QueryConfig } from '@/lib/react-query'
import { type Room } from '@smart-home/packages/rooms'

export const getRooms = (): Promise<Room[]> => {
    return api.get(`/rooms`)
}

export const getRoomsQueryOptions = () => {
    return queryOptions({
        queryKey: ['rooms'],
        queryFn: getRooms,
    })
}

type UseRoomsOptions = {
    queryConfig?: QueryConfig<typeof getRoomsQueryOptions>
}

export const useRooms = ({ queryConfig }: UseRoomsOptions) => {
    return useQuery({
        ...getRoomsQueryOptions(),
        ...queryConfig,
    })
}
