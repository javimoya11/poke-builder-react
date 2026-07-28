# Poké Builder

A Pokémon team builder for creating, managing, and exporting competitive Pokémon teams, built with React, TypeScript, and the [PokéAPI](https://pokeapi.co).

## Features

- **Browse the Pokédex** — search by name and load Pokémon generation by generation, including alternate forms and regional variants.
- **Build a full competitive set** — nickname, level, held item, ability, nature, Tera type, gender, shiny flag, EVs/IVs per stat, and up to 4 moves, with validation.
- **Manage teams** — create multiple teams of up to 6 Pokémon each, edit or move a Pokémon between teams, delete teams or individual members.
- **Export your team**
  - As a shareable **PNG image**, with Basic and Extended (full set details) preview modes.
  - As **Pokémon Showdown**-formatted text, copyable per Pokémon or for the whole team at once.
- **Accounts** — email/password authentication (via Supabase) to save teams to your profile.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/) for auth and data storage
- [TanStack Query](https://tanstack.com/query) for data fetching/caching
- [Zustand](https://github.com/pmndrs/zustand) for global state
- [PokéAPI](https://pokeapi.co/) as the Pokémon data source
- [html-to-image](https://github.com/bubkoo/html-to-image) for PNG export

## Getting started

> This is a personal project, published for portfolio purposes. It isn't currently open to external contributions, but feel free to fork it.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your Supabase project credentials:
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_PUBLISHABLE_KEY=
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run preview`.

## License

[MIT](./LICENSE) © Javier Moya Serrano
