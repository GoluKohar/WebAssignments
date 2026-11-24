### What did StrictMode's double invocation teach you?

React StrictMode helps developers identify potential problems in their applications during development.

It runs certain functions and lifecycle-related operations an additional time in development to help detect unexpected side effects.

For example, React performs an additional setup and cleanup cycle for effects when a component mounts in development.

This taught me that:
- Effects should have proper cleanup functions.
- Event listeners should be removed when components unmount.
- Effects should not create duplicate subscriptions.
- Components should be written in a predictable and safe way.

StrictMode's additional checks happen in development and do not mean that production applications run every effect twice.