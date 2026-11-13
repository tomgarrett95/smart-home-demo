export const paths = {
    landing: {
        path: '/',
        getHref: () => '/',
    },

    myHome: {
        root: {
            path: '/my-home',
            getHref: () => '/my-home',
        },
        devices: {
            path: 'devices',
        },
        device: {
            path: 'devices/:deviceId',
            getHref: (id: number) => `/my-home/devices/${id}`,
        },
    },
} as const
