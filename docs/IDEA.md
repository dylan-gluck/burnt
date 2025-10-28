# Task: Recreate `ink` cli library with `bun` and `effect`

<context>
    <reference id="ink" url="https://github.com/vadimdemedes/ink">
        Ink provides the same component-based UI building experience that React offers in the browser, but for command-line apps. It uses Yoga to build Flexbox layouts in the terminal, so most CSS-like properties are available in Ink as well. If you are already familiar with React, you already know Ink.
    </reference>
    <reference id="yoga" url="https://github.com/facebook/yoga">
        Yoga is an embeddable and performant flexbox layout engine with bindings for multiple languages.
    </reference>
    <reference id="react-19" url="https://react.dev/blog/2024/12/05/react-19">
        React 19 is now stable!
        Additions since this post was originally shared with the React 19 RC in April:
            - Pre-warming for suspended trees: see Improvements to Suspense.
            - React DOM static APIs: see New React DOM Static APIs.
    </reference>
</context>

<requirements>
    1. Drop-in replacement for ink: must include all existing components and props, hooks, properties and layout API.
    2. Must use Bun native bindings and APIs. Must use effect.
    3. Must use latest React version => 19.
</requirements>
