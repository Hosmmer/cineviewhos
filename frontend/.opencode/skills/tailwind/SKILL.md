---
name: tailwind-design
description: "Use when building UI components, layouts, or styling the frontend. Covers the CineViewHos design system: Tailwind CSS dark cinema theme, component patterns, responsive design, animations, and UX conventions."
metadata:
  version: "1.0.0"
  domain: frontend
  stack: Tailwind CSS 3 + React 18 + TypeScript
  triggers: Tailwind, CSS, design, style, layout, responsive, theme, dark mode, UI, component, card, button, modal, form, animation, cinema
  role: specialist
  scope: implementation
  output-format: code
---

# Tailwind Design System Expert (CineViewHos)

Senior UI specialist — Tailwind CSS + dark cinema theme + React components.

## When to Use This Skill

- Designing or styling any page or component
- Creating reusable UI components (cards, buttons, modals, forms)
- Implementing responsive layouts
- Adding animations or transitions
- Ensuring visual consistency across the app
- Building auth pages with cinematic full-screen backgrounds

## Design System: CineViewHos Dark Cinema Theme

### Color Palette

| Token | Class | Usage |
|-------|-------|-------|
| Background (primary) | `bg-gray-900` | Main page backgrounds, auth pages |
| Background (secondary) | `bg-gray-800` | Cards, modals, sidebars, navbars |
| Background (tertiary) | `bg-gray-700` | Inputs, hover states, dividers |
| Border | `border-gray-600` | Input borders, card borders |
| Border (subtle) | `border-gray-700` | Navbar borders, subtle separators |
| Text (primary) | `text-white` | Headings, important text |
| Text (secondary) | `text-gray-300` | Body text, descriptions |
| Text (muted) | `text-gray-400` | Placeholders, secondary info |
| Text (subtle) | `text-gray-500` | Disabled text, meta info |
| Accent (primary) | `red-600` | Primary buttons, links, active states |
| Accent (hover) | `red-700` | Button hover, link hover |
| Accent (light) | `red-500` | Focus rings, highlights |
| Error (bg) | `bg-red-500/10` | Error alert background |
| Error (border) | `border-red-500` | Error alert border |
| Error (text) | `text-red-400` | Error messages |
| Success (text) | `text-green-400` | Success messages, toast |
| Warning (text) | `text-yellow-400` | Warning messages |

### Typography

- **Font**: Default system font stack (Tailwind default)
- **Headings**: `text-3xl font-bold text-white` (page), `text-xl font-semibold text-white` (card)
- **Body**: `text-gray-300`
- **Small**: `text-sm text-gray-400`

### Spacing

- **Page padding**: `px-4` (mobile), `px-6` (desktop)
- **Card padding**: `p-6`
- **Section gap**: `space-y-6` or `gap-6`
- **Auth card**: `p-8` with `max-w-md`

## Component Patterns

### Auth Page (full-screen cinematic)

```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
  <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white">CineViewHos</h1>
      <p className="text-gray-400 mt-2">Tu cine, tu catálogo</p>
    </div>
    {children}
  </div>
</div>
```

### Standard Page Layout

```tsx
<div className="min-h-screen bg-gray-900">
  <Navbar />
  <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    {children}
  </main>
</div>
```

### Card (base)

```tsx
<div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
  {children}
</div>
```

### Card (hoverable / clickable)

```tsx
<div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-red-500/50 transition-colors cursor-pointer">
  {children}
</div>
```

### Movie Card (with poster)

```tsx
<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-red-500/50 transition-colors">
  <div className="aspect-[2/3] bg-gray-700">
    {posterUrl && <img src={posterUrl} alt={title} className="w-full h-full object-cover" />}
  </div>
  <div className="p-4">
    <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
    <p className="text-sm text-gray-400 mt-1">{year} · {genre}</p>
  </div>
</div>
```

### Button (primary)

```tsx
<button
  onClick={handleClick}
  disabled={loading}
  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? 'Cargando...' : label}
</button>
```

### Button (secondary / outline)

```tsx
<button
  onClick={handleClick}
  className="w-full border border-gray-600 hover:border-red-500 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
>
  {label}
</button>
```

### Button (danger)

```tsx
<button
  onClick={handleDelete}
  className="bg-red-500/10 border border-red-500 text-red-400 hover:bg-red-500/20 font-semibold py-2 px-4 rounded-lg transition-colors"
>
  Eliminar
</button>
```

### Button (small / icon)

```tsx
<button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

### Input (text)

```tsx
<input
  type="text"
  value={value}
  onChange={e => setValue(e.target.value)}
  placeholder="Placeholder"
  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
/>
```

### Input (with label)

```tsx
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    {label}
  </label>
  <input
    type="text"
    value={value}
    onChange={e => setValue(e.target.value)}
    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
  />
</div>
```

### Input (with error)

```tsx
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
  <input
    type="email"
    className="w-full px-4 py-3 bg-gray-700 border border-red-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
  />
  <p className="text-red-400 text-sm mt-1">Correo inválido</p>
</div>
```

### Select

```tsx
<select
  value={value}
  onChange={e => setValue(e.target.value)}
  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
>
  <option value="">Seleccionar...</option>
  {options.map(opt => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
```

### Textarea

```tsx
<textarea
  value={value}
  onChange={e => setValue(e.target.value)}
  rows={4}
  placeholder="Descripción..."
  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
/>
```

### Modal

```tsx
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

    {/* Content */}
    <div className="relative bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
      </div>
      {children}
    </div>
  </div>
)}
```

### Table

```tsx
<div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Nombre</th>
          <th className="text-left text-sm font-medium text-gray-400 px-6 py-4">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
            <td className="px-6 py-4 text-white">{item.name}</td>
            <td className="px-6 py-4">
              {/* actions */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {items.length === 0 && (
    <div className="text-center py-12 text-gray-400">No hay datos disponibles.</div>
  )}
</div>
```

### Badge / Tag

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
  {label}
</span>
```

### Tabs

```tsx
<div className="border-b border-gray-700 mb-6">
  <nav className="flex gap-4">
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => setActive(tab.key)}
        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
          active === tab.key
            ? 'border-red-500 text-white'
            : 'border-transparent text-gray-400 hover:text-gray-300'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </nav>
</div>
```

### Admin Sidebar / Navigation

```tsx
<aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen p-4">
  <div className="mb-8">
    <h2 className="text-xl font-bold text-white">CineViewHos</h2>
    <p className="text-sm text-gray-400">Panel Admin</p>
  </div>
  <nav className="space-y-1">
    {links.map(link => (
      <NavLink
        key={link.to}
        to={link.to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
          }`
        }
      >
        {link.icon}
        {link.label}
      </NavLink>
    ))}
  </nav>
</aside>
```

### Loading Skeleton

```tsx
<div className="animate-pulse space-y-4">
  <div className="bg-gray-700 rounded-lg h-48" />
  <div className="bg-gray-700 rounded h-4 w-3/4" />
  <div className="bg-gray-700 rounded h-4 w-1/2" />
</div>
```

### Error Alert

```tsx
{error && (
  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
    {error}
  </div>
)}
```

### Success Alert

```tsx
{message && (
  <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">
    {message}
  </div>
)}
```

### Empty State

```tsx
<div className="text-center py-12">
  <div className="text-gray-500 text-5xl mb-4">🎬</div>
  <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
  <p className="text-gray-400">{description}</p>
  {action && (
    <button onClick={action.onClick} className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-colors">
      {action.label}
    </button>
  )}
</div>
```

### Pagination

```tsx
<div className="flex items-center justify-between mt-6">
  <p className="text-sm text-gray-400">
    Mostrando {start}-{end} de {total}
  </p>
  <div className="flex gap-2">
    <button
      onClick={prev}
      disabled={page === 1}
      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Anterior
    </button>
    <button
      onClick={next}
      disabled={!hasMore}
      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Siguiente
    </button>
  </div>
</div>
```

## Responsive Design

### Breakpoints

| Breakpoint | Prefix | Min Width |
|------------|--------|-----------|
| Default (mobile) | (none) | 0px |
| Small | `sm:` | 640px |
| Medium | `md:` | 768px |
| Large | `lg:` | 1024px |
| Extra Large | `xl:` | 1280px |
| 2XL | `2xl:` | 1536px |

### Grid Layout (movie cards)

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
  {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
</div>
```

### Stack (vertical list)

```tsx
<div className="space-y-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

### Flex Row (horizontal)

```tsx
<div className="flex items-center gap-4 flex-wrap">
  {children}
</div>
```

### Two-column (form + sidebar)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* main */}</div>
  <div className="lg:col-span-1">{/* sidebar */}</div>
</div>
```

## Animations & Transitions

### Hover transitions

Add `transition-colors` to any interactive element:
```tsx
className="... hover:bg-gray-700 hover:text-white transition-colors"
className="... hover:border-red-500/50 transition-colors"
```

### Fade in on mount

```tsx
className="opacity-0 animate-[fadeIn_0.2s_ease-in_forwards]"
```

Add to `index.css`:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Spinner

```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />

// Centered full-page
<div className="flex justify-center items-center min-h-screen bg-gray-900">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
</div>
```

### Pulse (skeleton loading)

```tsx
<div className="animate-pulse bg-gray-700 rounded-lg h-48" />
```

## Form Patterns

### Login / Register Form

```tsx
<form onSubmit={handleSubmit} className="space-y-5">
  {error && (
    <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
      {error}
    </div>
  )}

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
    <input
      type="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      required
      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      placeholder="tu@email.com"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? 'Cargando...' : 'Iniciar sesión'}
  </button>

  <p className="text-center text-gray-400 text-sm">
    ¿No tienes cuenta?{' '}
    <Link to="/register" className="text-red-500 hover:text-red-400">Regístrate</Link>
  </p>
</form>
```

## Constraints

### MUST DO
- **Tailwind classes only** — no inline styles, no CSS modules, no separate .css files except `index.css`
- **Dark theme always** — never use white/light backgrounds
- **`red-600` as primary accent** — never use blue/green/other as primary CTA
- **Responsive by default** — mobile-first, use `sm:`, `md:`, `lg:` breakpoints
- **Consistent spacing** — `p-4`/`p-6`/`p-8`, `gap-4`/`gap-6`, `space-y-4`/`space-y-6`
- **Smooth transitions** — `transition-colors` on all interactive elements
- **Disabled states** — `disabled:opacity-50 disabled:cursor-not-allowed` on all buttons

### MUST NOT DO
- **NO Bootstrap classes** — not `btn`, `container`, `row`, `col`, `card`, `form-control`, etc.
- **NO inline styles** (`style={{}}`) except for dynamic values
- **NO white backgrounds** (`bg-white`, `bg-gray-100`, etc.)
- **NO light text on light backgrounds**
- **NO hardcoded pixel widths** — use Tailwind's spacing scale or `max-w-*`
- **NO custom CSS classes** — use Tailwind utility classes
- **NO blue or green primary buttons** — always red for primary actions
