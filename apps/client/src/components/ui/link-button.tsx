import { Link as RouterLink, type LinkProps } from 'react-router'
import { type ButtonVariants, buttonVariants } from '@heroui/styles'

export const LinkButton = (props: ButtonVariants & LinkProps) => {
    return (
        <RouterLink
            to={props.to}
            className={buttonVariants({ ...props })}
        >
            {props.children}
        </RouterLink>
    )
}
