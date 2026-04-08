# InfinityFree Deployment

This project now uses the same deployment-oriented structure as `ghanaian-shepherd-main`:

- the built React app lives in the web root
- the PHP backend lives in `/backend`
- uploaded files live in `/uploads`

## 1. Prepare the deployment bundle

From the project root run:

```powershell
npm.cmd run deploy:infinityfree
```

This creates:

```text
deploy/infinityfree
```

Upload the contents of that folder into your InfinityFree `public_html` directory.

## 2. Create the MySQL database

In InfinityFree:

1. Create a MySQL database.
2. Open phpMyAdmin.
3. Import `backend/database.sql`.

## 3. Update database credentials

Edit the uploaded `backend/config.php` on the host and set:

```php
'host' => 'YOUR_INFINITYFREE_DB_HOST',
'user' => 'YOUR_INFINITYFREE_DB_USER',
'password' => 'YOUR_INFINITYFREE_DB_PASSWORD',
'name' => 'YOUR_INFINITYFREE_DB_NAME',
```

## 4. Security-related host settings

For production, also review the allowlists in `backend/config.php` or your root `.env`:

- `APP_URL=https://your-domain.example`
- `ALLOWED_ORIGINS=https://your-domain.example`
- `ALLOWED_REDIRECT_HOSTS=your-domain.example,facebook.com,instagram.com,youtube.com`
- `ALLOWED_EMBED_HOSTS=your-domain.example,google.com,maps.google.com,youtube.com`

These values control CORS, CMS-managed public links, and approved embed providers.

## 5. Upload checklist

Make sure these exist in `public_html` after upload:

```text
backend/
uploads/
assets/
index.html
.htaccess
404.html
```

## 6. Smoke test after upload

Check:

- `https://your-domain.example/`
- `https://your-domain.example/backend/site/bootstrap?scope=settings`

If the backend loads but app routes 404, the usual cause is that the latest root `.htaccess` was not uploaded.
