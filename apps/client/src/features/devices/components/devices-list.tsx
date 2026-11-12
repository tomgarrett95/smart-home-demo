import { useDevices } from '../api/get-devices'
import type { Device } from '@smart-home/packages/devices'
import { Card, Spinner } from '@heroui/react'
import { DeviceIcon } from '@/features/devices/components/device-icon'
import { cn } from '@/utils/cn'
import { ArrowOutward } from '@mui/icons-material'
import { LinkButton } from '@/components/ui/link-button'
import { paths } from '@/config/paths'

const deviceCardVariants = {
    enabled: 'bg-amber-200',
    disabled: 'bg-slate-200',
}

type DeviceCardProps = {
    device: Device
    variant?: keyof typeof deviceCardVariants
}

const DeviceCard = ({ device, variant = 'disabled' }: DeviceCardProps) => {
    return (
        <Card
            className={cn('h-32 w-60 flex-row items-center', deviceCardVariants[variant])}
        >
            <DeviceIcon
                deviceType={device.deviceType}
                fontSize={'large'}
                className={'text-slate-900'}
            />
            <LinkButton
                to={paths.app.device.getHref(device.id)}
                isIconOnly={true}
                aria-label="Go to device"
                className="absolute inset-e-3 top-3 cursor-pointer"
                variant={'ghost'}
            >
                <ArrowOutward />
            </LinkButton>
            <div className="flex flex-1 flex-col gap-2">
                <Card.Header>
                    <Card.Title>{device.name}</Card.Title>
                </Card.Header>
            </div>
        </Card>
    )
}

export const DevicesList = () => {
    const devicesQuery = useDevices({})

    if (devicesQuery.isLoading) {
        return (
            <div className="flex h-48 w-full items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    const devices = devicesQuery.data

    if (!devices) return null

    const devicesByRoom = devices.reduce(
        (acc, device) => {
            const roomName = device.room.name
            if (!acc[roomName]) {
                acc[roomName] = []
            }
            acc[roomName].push(device)
            return acc
        },
        {} as Record<string, Device[]>
    )

    return (
        <div className={'flex flex-col gap-8'}>
            {Object.entries(devicesByRoom ?? {}).map(([roomName, devices]) => (
                <div key={roomName}>
                    <h2 className={'mb-2'}>{roomName}</h2>
                    <div className={'flex flex-wrap gap-2'}>
                        {devices.map((device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
