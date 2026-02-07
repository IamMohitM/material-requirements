# MRMS Web Dashboard

Material Requirements Management System - React Web Application

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env .env.local

# Start development
npm start
```

Opens at http://localhost:3001

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run test suite |
| `npm run lint` | Check code style |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Check TypeScript |

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── services/       # API integration
├── store/          # Redux state management
├── styles/         # CSS stylesheets
├── types/          # TypeScript interfaces
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
├── App.tsx         # Main app component
└── index.tsx       # Entry point
```

## Pages

- **LoginPage** - Authentication page
- **Dashboard** - Overview with quick stats
- **RequestsPage** - Material requests management
- **QuotesPage** - Vendor quotes comparison
- **POsPage** - Purchase orders management
- **VendorsPage** - Vendor database

## State Management

Uses Redux Toolkit with slices:
- **authSlice** - User authentication state
- **uiSlice** - UI state (sidebar, notifications)
- **requestsSlice** - Requests data (to be implemented)
- **quotesSlice** - Quotes data (to be implemented)
- **posSlice** - POs data (to be implemented)

## API Integration

- **api.ts** - Axios instance with interceptors
- **auth.ts** - Authentication API calls
- **requests.ts** - Requests API calls (stub)
- **quotes.ts** - Quotes API calls (stub)
- **pos.ts** - POs API calls (stub)

## Environment Variables

Create `.env.local`:
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Building

```bash
# Production build
npm run build

# Output in build/ directory
# Optimized and minified

# Serve locally
npx serve -s build
```

## Key Features

- ✅ React 18 with hooks
- ✅ TypeScript strict mode
- ✅ Redux Toolkit for state
- ✅ React Router for navigation
- ✅ Bootstrap for styling
- ✅ Axios for API calls
- ✅ React Hook Form for forms
- ✅ Responsive design

## Development Tips

- Use React Developer Tools browser extension
- Use Redux DevTools for state debugging
- Check browser console for errors
- Hot reload works for code changes
- Keep components focused and reusable

## Component Structure

```tsx
// Functional component with hooks
function ComponentName({ prop1, prop2 }: Props) {
  // Hooks
  const [state, setState] = useState('');
  const dispatch = useDispatch();

  // Effects
  useEffect(() => {
    // Setup
    return () => { /* cleanup */ };
  }, []);

  // Handlers
  const handleClick = () => { /* ... */ };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Adding New Pages

1. Create component in `src/pages/PageName.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link if needed
4. Import required services/hooks
5. Add to sidebar/navigation

## Adding New API Calls

1. Add function to service file `src/services/`
2. Create Redux slice if needed `src/store/slices/`
3. Use in component with `useDispatch` and `useSelector`
4. Handle loading and error states
5. Add tests

## Styling

- Bootstrap for layout and components
- Custom CSS in `src/styles/`
- CSS Modules for component-specific styles
- TailwindCSS available (configure if needed)

## Common Issues

**"Cannot find module"**
- Check import paths
- Reinstall: `npm install`

**"API call fails"**
- Check backend is running: `http://localhost:3000`
- Check token is valid: `localStorage.getItem('accessToken')`
- Check CORS headers

**"Hot reload not working"**
- Restart dev server: `npm start`
- Clear browser cache

**"Build fails"**
- Check TypeScript errors: `npm run typecheck`
- Check console for errors
- Try clearing node_modules

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (responsive)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Mobile accessible

## Performance

- Code splitting by route
- Lazy loading components
- Redux selector memoization
- Image optimization
- Production build optimization

## Next Steps

1. Read CLAUDE.md for project guidelines
2. Check docs/requirements.md for features
3. Implement missing pages (Requests, Quotes, POs)
4. Add comprehensive tests
5. Add form validation
6. Connect to API endpoints
7. Add error handling
8. Add loading states

## Dependencies

- **react** - UI library
- **react-router-dom** - Routing
- **@reduxjs/toolkit** - State management
- **axios** - HTTP client
- **bootstrap** - CSS framework
- **react-hook-form** - Form handling
- **date-fns** - Date utilities

## Support

- Check CLAUDE.md for project context
- Check docs/ for documentation
- Review existing pages for patterns
- Check browser console for errors

---

**Phase:** Foundation MVP
**Status:** In Development
**Last Updated:** 2026-02-06
