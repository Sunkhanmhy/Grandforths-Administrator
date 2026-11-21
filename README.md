# Grandforth Legal Practitioners Administrator App

A production-oriented administrator portal for Grandforth Legal Practitioners It uses React + TypeScript + Vite and is designed to connect to Supabase for authentication, secure data storage, and role-based controls.

## Features

- secure sign-in and administrator sign-up flow
- role-based layout for Super Admin, HR, IT Support, Finance, and Operations
- Supabase-ready session and auth helpers
- RBAC and permission structure with SQL schema in `supabase/admin_schema.sql`
- production deployment configuration for Railway

## Local setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL and anon key.
3. Run: `npm install`
4. Run: `npm run dev`

## Supabase setup

Apply the SQL in `supabase/admin_schema.sql` to your Supabase project before using the admin dashboard in production.

## Security notes

- Admin accounts should be created through a trusted admin bootstrap flow.
- Super Admin is the only role allowed to invite additional admin users.
- Role permissions are enforced through database policies and application guards.

## Deployment

The app is configured for Railway with `railway.json`.
