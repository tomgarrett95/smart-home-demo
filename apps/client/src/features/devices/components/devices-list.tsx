import { useDevices } from '../api/get-devices'
import type { Device, DeviceStatus } from '@smart-home/packages/devices'
import { Card, Spinner, Switch } from '@heroui/react'
import { DeviceIcon } from '@/features/devices/components/device-icon'
import { cn } from '@/utils/cn'
import { ArrowOutward } from '@mui/icons-material'
import { LinkButton } from '@/components/ui/link-button'
import { paths } from '@/config/paths'
import { useUpdateDevice } from '@/features/devices/api/update-device'

const deviceCardVariants: Record<DeviceStatus, string> = {
    on: 'bg-amber-200',
    off: 'bg-slate-200',
}

type DeviceCardProps = {
    device: Device
    variant?: keyof typeof deviceCardVariants
}

const DeviceCard = ({ device }: DeviceCardProps) => {
    const updateDiscussionMutation = useUpdateDevice({
        mutationConfig: {},
    })

    return (
        <Card
            className={cn(
                'h-32 w-60 flex-row items-center',
                deviceCardVariants[device.status]
            )}
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
                <Card.Content>
                    <Switch
                        size="lg"
                        isSelected={device.status === 'on'}
                        onChange={() =>
                            updateDiscussionMutation.mutate({
                                deviceId: String(device.id),
                                data: { status: device.status === 'on' ? 'off' : 'on' },
                            })
                        }
                        aria-label="Toggle device status"
                    >
                        <Switch.Content>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch.Content>
                    </Switch>
                </Card.Content>
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
