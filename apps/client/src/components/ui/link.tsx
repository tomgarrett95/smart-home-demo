import { Link as RouterLink, type LinkProps } from 'react-router'
import { Link as HeroLink } from '@heroui/react'
import { linkVariants } from '@heroui/styles'

export const Link = ({ className, children, ...props }: LinkProps) => {
    const slots = linkVariants()

    return (
        <RouterLink
            className={slots.base({ className })}
            {...props}
        >
            {children}
            <HeroLink.Icon className={slots.icon()} />
        </RouterLink>
    )
}
