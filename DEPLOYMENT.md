# Deployment Guide for Femora

Femora is a client-side application that can be deployed easily to various platforms.

## GitHub Pages (Recommended)

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select source branch: `main`
   - Select folder: `/ (root)`
   - Click "Save"

2. **Your site will be live at**:
   ```
   https://LABOSO123.github.io/Femora/
   ```

## Netlify

1. **Drag and Drop**:
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drag your `Femora` folder
   - Your site is live!

2. **Git Integration**:
   - Connect your GitHub repository
   - Netlify will auto-deploy on every push

## Vercel

1. **Import Project**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Deploy!

## Local Development Server

For local testing with a server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if http-server is installed)
npm start

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

## Important Notes

- **No Build Process**: Femora runs directly in the browser, no build step needed
- **No Backend Required**: All data is stored locally using localStorage
- **HTTPS Recommended**: For production, use HTTPS (all platforms above provide this)
- **CORS**: No CORS issues since everything is client-side

## Custom Domain

You can add a custom domain to any of the platforms above:
- GitHub Pages: Settings → Pages → Custom domain
- Netlify: Domain settings → Add custom domain
- Vercel: Project settings → Domains

## Troubleshooting

**Issue**: Features not working after deployment
- **Solution**: Ensure all files are in the root directory, not in a subfolder

**Issue**: Logo not showing
- **Solution**: Check that `Femora logo.png` is in the root directory

**Issue**: Styles not loading
- **Solution**: Verify CSS file paths are correct (relative paths work best)

