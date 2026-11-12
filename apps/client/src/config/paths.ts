export const paths = {
    home: {
        path: '/',
        getHref: () => '/',
    },

    app: {
        root: {
            path: '/devices',
            getHref: () => '/devices',
        },
        devices: {
            path: '',
            getHref: () => '/devices',
        },
        device: {
            path: ':deviceId',
            getHref: (id: number) => `/app/devices/${id}`,
        },
    },
} as const
