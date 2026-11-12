import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'

const docsLinks = [
    { href: 'https://vite.dev/', label: 'Explore Vite', image: viteLogo },
    { href: 'https://react.dev/', label: 'Learn more', image: reactLogo },
]

const socialLinks = [
    { href: 'https://github.com/vitejs/vite', label: 'GitHub', icon: 'github-icon' },
    { href: 'https://chat.vite.dev/', label: 'Discord', icon: 'discord-icon' },
    { href: 'https://x.com/vite_js', label: 'X.com', icon: 'x-icon' },
    { href: 'https://bsky.app/profile/vite.dev', label: 'Bluesky', icon: 'bluesky-icon' },
]

export function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="mx-auto flex min-h-svh w-[1126px] max-w-full flex-col border-x border-gray-200 text-center font-sans text-gray-500">
            <section className="flex grow flex-col place-content-center place-items-center gap-[18px] px-5 pt-8 pb-6 lg:gap-[25px] lg:p-0">
                <div className="relative">
                    <img
                        src={heroImg}
                        className="relative inset-x-0 z-0 mx-auto w-[170px]"
                        width="170"
                        height="179"
                        alt=""
                    />
                    <img
                        src={reactLogo}
                        className="absolute inset-x-0 top-[34px] z-1 mx-auto h-7 transform-[perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
                        alt="React logo"
                    />
                    <img
                        src={viteLogo}
                        className="absolute inset-x-0 top-[107px] z-0 mx-auto h-[26px] w-auto transform-[perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
                        alt="Vite logo"
                    />
                </div>
                <div>
                    <h1 className="my-8 text-4xl font-medium tracking-tight text-gray-950 lg:text-6xl">
                        Get started
                    </h1>
                    <p>
                        Edit{' '}
                        <code className="rounded-sm bg-stone-100 px-2 py-1 font-mono text-[15px] text-gray-950">
                            src/App.tsx
                        </code>{' '}
                        and save to test{' '}
                        <code className="rounded-sm bg-stone-100 px-2 py-1 font-mono text-[15px] text-gray-950">
                            HMR
                        </code>
                    </p>
                </div>
                <button
                    type="button"
                    className="mb-6 rounded-[5px] border-2 border-transparent bg-purple-500/10 px-2.5 py-[5px] text-base text-purple-500 transition-colors duration-300 hover:border-purple-500/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
                    onClick={() => setCount((count) => count + 1)}
                >
                    Count is {count}
                </button>
            </section>

            <Ticks />

            <section className="flex flex-col border-t border-gray-200 text-center lg:flex-row lg:text-left">
                <div className="flex-1 border-b border-gray-200 px-5 py-6 lg:border-r lg:border-b-0 lg:p-8">
                    <SectionIcon id="documentation-icon" />
                    <h2 className="mb-2 text-2xl font-medium text-gray-950">
                        Documentation
                    </h2>
                    <p>Your questions, answered</p>
                    <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:mt-8 lg:flex-nowrap lg:justify-start">
                        {docsLinks.map((link) => (
                            <li
                                key={link.href}
                                className="flex-[1_1_calc(50%-8px)] lg:flex-none"
                            >
                                <a
                                    href={link.href}
                                    target="_blank"
                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-stone-100/50 px-3 py-1.5 text-base text-gray-950 no-underline transition-shadow duration-300 hover:shadow-lg lg:w-auto lg:justify-start"
                                >
                                    <img
                                        className="h-[18px]"
                                        src={link.image}
                                        alt=""
                                    />
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex-1 px-5 py-6 lg:p-8">
                    <SectionIcon id="social-icon" />
                    <h2 className="mb-2 text-2xl font-medium text-gray-950">
                        Connect with us
                    </h2>
                    <p>Join the Vite community</p>
                    <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:mt-8 lg:flex-nowrap lg:justify-start">
                        {socialLinks.map((link) => (
                            <li
                                key={link.href}
                                className="flex-[1_1_calc(50%-8px)] lg:flex-none"
                            >
                                <a
                                    href={link.href}
                                    target="_blank"
                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-stone-100/50 px-3 py-1.5 text-base text-gray-950 no-underline transition-shadow duration-300 hover:shadow-lg lg:w-auto lg:justify-start"
                                >
                                    <svg
                                        className="size-[18px]"
                                        role="presentation"
                                        aria-hidden="true"
                                    >
                                        <use href={`/icons.svg#${link.icon}`}></use>
                                    </svg>
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <Ticks />
            <section className="h-12 border-t border-gray-200 lg:h-[88px]"></section>
        </div>
    )
}

// Small triangles at each end of a divider line
function Ticks() {
    return (
        <div className="relative w-full before:absolute before:top-[-4.5px] before:left-0 before:border-[5px] before:border-transparent before:border-l-gray-200 after:absolute after:top-[-4.5px] after:right-0 after:border-[5px] after:border-transparent after:border-r-gray-200"></div>
    )
}

function SectionIcon({ id }: { id: string }) {
    return (
        <svg
            className="mx-auto mb-4 size-[22px] lg:mx-0"
            role="presentation"
            aria-hidden="true"
        >
            <use href={`/icons.svg#${id}`}></use>
        </svg>
    )
}
