# Knowledge Hub Pro

Build a complete, modern, production-quality frontend for my existing Knowledge Repository backend.

IMPORTANT:

This is NOT a mock/demo application. The frontend must be designed to consume my existing REST APIs. Do not create fake/local JSON data for the main functionality.

BACKEND:

Production API base URL:

https://knowledge-repository.onrender.com


The backend is already fully implemented, deployed, and tested.

TECH STACK:

- React

- javaScript

- Vite

- React Router

- Axios for API communication

- Modern responsive CSS/Tailwind

- Component-based architecture

- Clean reusable components

- No unnecessary libraries unless genuinely useful

PROJECT PURPOSE:

This is an internal Knowledge Repository system where users can upload, organize, search, view, download, update, and delete company documents.

MAIN FEATURES:

1. AUTHENTICATION

Create:

- Login page

- Register page

- Logout functionality

- Protected routes

- Store authentication information securely on the frontend

- Handle unauthorized/expired sessions gracefully

2. DASHBOARD

Create a professional dashboard showing:

- Total documents

- Categories

- Tags

- Recent documents

- Quick upload button

- Search bar

- Useful document statistics

The dashboard should feel like a real enterprise knowledge-management application.

3. DOCUMENT MANAGEMENT

Create a Documents page with:

- Document list/table or attractive card layout

- Document title

- Description

- Category

- Tags

- File type

- File size

- Created date

- Actions

Actions:

- View

- Download

- Edit

- Delete

4. DOCUMENT UPLOAD

Create a professional upload form supporting:

- Title

- Description

- Category selection

- Multiple tags

- File upload

Allowed file types:

- PDF

- DOC

- DOCX

- PPT

- PPTX

Maximum file size:

10 MB

Use multipart/form-data when communicating with the backend.

Show:

- Upload progress/loading state

- Validation errors

- Success notification

- Backend error messages

5. DOCUMENT DETAILS

Create a document details page/modal showing:

- Title

- Description

- Category

- Tags

- Original filename

- MIME type

- File size

- Created date

- Updated date

Provide:

- Open/View

- Download

- Edit

- Delete

6. EDIT DOCUMENT

Allow users to:

- Update metadata without uploading a new file

OR

- Update metadata and replace the existing file

The UI must support both cases.

7. SEARCH

Create a prominent search bar.

Search should call the backend search API rather than filtering only the currently loaded frontend data.

Support searching by:

- Title

- Description

- Category

- Tags

Show:

- Loading state

- No-results state

- Search results

8. PAGINATION

Implement server-side pagination.

The backend supports:

?page=1&limit=10

Create:

- Previous

- Next

- Page numbers where appropriate

- Current page indicator

- Total documents

- Page size

Do not load all documents just to perform frontend pagination.

9. SORTING

Implement server-side sorting.

The backend supports:

sortBy

order

Provide sorting options such as:

- Newest

- Oldest

- Title A-Z

- Title Z-A

10. CATEGORIES

Create a category management UI where appropriate.

Categories are referenced by MongoDB ObjectId.

Do not hardcode category names.

11. TAGS

Create a tag selection UI.

Tags are referenced by MongoDB ObjectId.

Do not hardcode tag IDs.

12. DOWNLOAD HISTORY

The backend records document downloads.

The frontend should provide clean download functionality and handle download errors properly.

13. ERROR HANDLING

Create a reusable API error-handling system.

Handle:

- 400 validation errors

- 401 unauthorized

- 403 forbidden

- 404 not found

- 409 conflicts

- 500 server errors

- Network errors

Never silently fail.

14. UI/UX

Design style:

- Professional enterprise SaaS

- Clean

- Modern

- Minimal but visually attractive

- Good spacing

- Excellent typography

- Responsive

- Desktop-first but mobile-friendly

Suggested layout:

Sidebar:

- Dashboard

- Documents

- Categories

- Tags

- Upload

- Download History

- Profile/Settings

- Logout

Top bar:

- Search

- User information

- Notifications if useful

Main content:

- Clean cards

- Tables where appropriate

- Empty states

- Loading skeletons

- Toast notifications

- Confirmation dialogs for destructive actions

Use icons instead of excessive emojis.

Use a consistent design system throughout the application.

15. IMPORTANT API INTEGRATION RULES

Create a centralized Axios API client.

Do NOT scatter:

axios.get(...)

axios.post(...)

throughout components.

Create an organized API layer such as:

src/

  api/

    apiClient.ts

    authApi.ts

    documentApi.ts

    categoryApi.ts

    tagApi.ts

    downloadHistoryApi.ts

Create reusable hooks/services where appropriate.

16. ENVIRONMENT CONFIGURATION

Do NOT hardcode the backend URL throughout the application.

Use:

VITE_API_BASE_URL

For production:

VITE_API_BASE_URL=https://knowledge-repository.onrender.com

Make the application easy to switch between local development and production.

17. DOCUMENT API STRUCTURE

The backend uses document-related endpoints for:

- Upload

- Get documents

- Get document by ID

- Update document

- Delete document

- Search documents

- Download document

Do not invent different backend endpoints.

If an endpoint is uncertain, centralize it in the API layer so it can easily be adjusted.

18. IMPORTANT

Do not:

- Create fake backend responses

- Use mock documents as the primary data source

- Hardcode MongoDB IDs

- Hardcode categories/tags

- Replace the existing backend architecture

- Create a separate backend

- Use localStorage as a fake database

- Implement frontend-only search instead of calling the backend

- Implement frontend-only pagination instead of server-side pagination

The backend is already deployed and is the source of truth.

19. CODE QUALITY

Structure the project professionally.

Suggested structure:

src/

  api/

  components/

  hooks/

  layouts/

  pages/

  routes/

  services/

  types/

  utils/

  App.tsx

  main.tsx

Use TypeScript types/interfaces for API responses.

Create reusable components for:

- DocumentCard

- DocumentTable

- SearchBar

- Pagination

- FileUpload

- TagSelector

- CategorySelector

- LoadingSpinner/Skeleton

- ConfirmDialog

- Toast/Notification

20. RESPONSIVENESS

The application must work properly on:

- Desktop

- Laptop

- Tablet

- Mobile

Prioritize the desktop experience because this is an internal knowledge-management application.

21. FINAL REQUIREMENT

First build the complete frontend UI and architecture.

Then connect each feature to the real backend API.

Do not stop after creating only the dashboard.

The final application should feel like a complete enterprise Knowledge Repository product, not a student/demo CRUD application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://company-knowledge-link.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4733bbf0-8976-497a-982a-5553f0e29996).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
