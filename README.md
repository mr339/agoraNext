## Frontend NextJS BaseCode

## Getting Started

First, run the development server:

```bash
npm install
# or 
yarn install

npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Installing Story Book(if needed)

```bash

npx sb init 
npm run storybook
# or
yarn run storybook

```

## Setting environment variable for client side

Add publicRuntimeConfig in your next.config.js:

```bash
 publicRuntimeConfig: {
   testenv_var: process.env.testenv_var
 }
```

Then on your JS file you can access it as such:

```bash
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();
publicRuntimeConfig.testenv_var;
```

Finally, add that variable into your .env.local file and restart the server.

## Merge request/ Pull request steps that the requester should follow

```bash
1. The title should be in the format 
   <work-item-id>-<work-item-type>: title of the work item
   For Example: 1875-feature: Edit summary page
2. The description should describe the work in that pull request with proper context
3. The people assigned to review the code should be added as reviewers.
4. The work item to which the current pull request is associated should be included.

```
