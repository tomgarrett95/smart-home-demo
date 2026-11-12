export const paths = {
    home: {
        path: '/',
        getHref: () => '/',
    },

    app: {
        root: {
            path: '/app/devices',
            getHref: () => '/app/devices',
        },
        devices: {
            path: '',
            getHref: () => '/app/devices',
        },
        device: {
            path: ':deviceId',
            getHref: (id: number) => `/app/devices/${id}`,
        },
    },
} as const
