# MintMoments - Web

### Workspace Folder Structure

The webapp is organized as follows:

Here's the structure of your web application:

```bash
.
├── /app
│   ├── /(auth-pages) # Authentication-related pages
│   │   └── sign-in
│   │       └── otp
│   ├── /auth
│   │   └── confirm
│   │       └── user
│   ├── /css # Stylesheets
│   ├── /events
│   │   └── [slug]
│   │       └── @modal
│   │           └── (...)(auth-pages)
│   │               └── sign-in
│   ├── /api
│   │   └── chat
│   ├── /profile
│   │   └── [username]
│   └── /error
├── /components
│   ├── /pages # Page main sections components
│   │   └── sign-in
│   │       └── otp
│   ├── /ui # UI components coming from shadcn/ui
│   ├── /icons # SVG custom icons outside Lucide Icons
│   └── /shared
├── /lib
│   ├── /constants
│   ├── /hooks
│   ├── /supabase
│   └── utils.ts # Utility functions
├── /server # Socket.io server
├── /services # Supabase + Other services
├── /types
├── components.json
├── middleware.ts
├── next.config.js
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.server.json
└── tsconfig.tsbuildinfo
```

### How to Run Locally

1. **Clone the repository**:

   ```sh
   git clone https://github.com/andlerrl/MintMoments.git mint-moments
   cd mint-moments
   ```

2. **Install dependencies**:

   ```sh
   bun install
   ```

3. **Set up environment variables**:

   - Copy [`.env.example`](/.env.example) to [`.env`](./.env) and populate it with your environment-specific values.

4. **Run the development server**:

   ```sh
   bun run dev
   ```

5. **Build the project**:

   ```sh
   bun run build
   ```

6. **Start the production server**:

   ```sh
   bun start
   ```

### Dependencies

The project uses the following dependencies:

- **tailwindcss**: CSS theme and styling [Documentation](https://tailwindcss.com/docs)
- **clsx**: `cn()` utility function for conditional className clauses [Documentation](https://github.com/lukeed/clsx)
- **cva**: Class Variant Authority for classNames [Documentation](https://cva.style/docs)
- **framer-motion**: Smooth animations [Documentation](https://www.framer.com/api/motion/)
- **shadcn/ui**: Set of re-usable components [Documentation](https://shadcn.com/docs)
- **@supabase/ssr**: Supabse for database fetching and subscription [Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- **socket.io**: Real-time communication [Documentation](https://socket.io/docs/v4)

For a complete list of dependencies, refer to the [`package.json`](./apps/web/package.json") file.
