import type { DeviceType } from '@smart-home/packages/devices'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import OutletIcon from '@mui/icons-material/Outlet'

const deviceIcons: Record<DeviceType, React.ComponentType<SvgIconProps>> = {
    light: LightbulbIcon,
    plug: OutletIcon,
}

interface DeviceIconProps extends SvgIconProps {
    deviceType: DeviceType
}

export const DeviceIcon = ({ deviceType, ...props }: DeviceIconProps) => {
    const Icon = deviceIcons[deviceType]
    return <Icon {...props} />
}
