# Dotformer Platform Architecture

## System Overview

Dotformer is a file transformation platform that allows users to upload, transform, and manage digital assets. The system consists of four main components:

1. **Backend (BE)**: A Node.js/Express API server
2. **Frontend (FE)**: A Next.js web application
3. **JavaScript SDK**: A library for programmatic access to the platform
4. **Transformer Service**: A dedicated service for image processing

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  Frontend   │◄────►│   Backend   │◄────►│    File     │
│  (Next.js)  │      │  (Express)  │      │   Storage   │
│             │      │             │      │             │
└─────────────┘      └──────┬──────┘      └─────────────┘
       ▲                    │
       │                    ▼
       │              ┌─────────────┐
┌──────┴──────┐       │             │
│             │       │ Transformer │
│  JS SDK     │       │  Service    │
│             │       │             │
└─────────────┘       └─────────────┘
```

## Authentication System

The platform uses two authentication mechanisms:

1. **JWT Tokens** for web users
2. **API Keys** for programmatic access via the SDK

### JWT Authentication Flow

1. User logs in with email/password
2. Backend validates credentials and issues a JWT
3. Frontend stores JWT in a cookie
4. JWT is included in the Authorization header for subsequent requests
5. Express middleware validates JWT for protected routes

### API Key Authentication Flow

1. Authenticated users generate API keys in the dashboard
2. API keys are stored in the database
3. Requests include X-API-Key header
4. Express middleware validates API key for protected routes
5. Rate limiting applied to API key usage

## Database Schema

The platform uses PostgreSQL via Prisma ORM with the following models:

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│    User    │       │   Asset    │       │   ApiKey   │
├────────────┤       ├────────────┤       ├────────────┤
│ id         │       │ id         │       │ id         │
│ email      │       │ fileName   │       │ name       │
│ password   │       │ fileSize   │       │ key        │
│ name       │       │ fileType   │       │ lastUsed   │
│ createdAt  │       │ url        │       │ expiresAt  │
│ updatedAt  │◄──────┤ userId     │       │ isActive   │
└────────────┘       │ createdAt  │       │ createdAt  │
                     │ updatedAt  │       │ userId     │
                     └────────────┘       └────────────┘
```

## Backend (BE) Structure

```
be/
├── prisma/                 # Database schema & migrations
├── src/                    # Main source code directory
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   └── index.ts            # Application entry point
├── dist/                   # Compiled JavaScript code
├── docs/                   # API documentation
├── .env                    # Environment variables
└── package.json            # Dependencies and scripts
```

### Key Backend Components

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Implement business logic and interact with the database
3. **Middlewares**: Validate requests and enforce security
4. **Routes**: Define API endpoints and connect to controllers
5. **Utils**: Provide helper functions for common operations

## Frontend (FE) Structure

```
fe/
├── app/                    # Next.js app router
│   ├── dashboard/          # Authenticated pages
│   │   ├── api-keys/       # API key management UI
│   │   ├── assets/         # File listing UI
│   │   ├── upload/         # File upload UI
│   │   └── settings/       # User settings
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/             # Reusable React components
│   └── ui/                 # UI components (shadcn/ui)
├── lib/                    # Utilities and helpers
│   ├── api.ts              # API client
│   ├── authContext.ts      # Auth state management
│   └── utils.ts            # General utilities
└── public/                 # Static assets
```

### Frontend Features

1. **Authentication**: Login, registration, and session management
2. **File Management**: Upload, view, delete files
3. **File Transformation**: Web interface for transforming images
4. **API Key Management**: Create, delete, and manage API keys

## JavaScript SDK

The SDK provides a clean API for interacting with the Dotformer platform programmatically.

```
dotformer-sdk/
├── index.js                # Main SDK implementation
├── package.json            # Dependencies and metadata
├── README.md               # Documentation
├── test.js                 # General testing script
└── tests/                  # Test directory
    ├── transform-test.js   # Image transformation tests
    └── output/             # Test outputs
```

### SDK Features

1. **Authentication**: API key-based authentication
2. **File Operations**: Upload, list, get, and delete files
3. **Transformations**: Apply image transformations
4. **Cross-platform**: Works in both browser and Node.js environments

### SDK Usage Example

```javascript
import DotformerSDK from 'dotformer-sdk';

// Initialize with API key
const sdk = new DotformerSDK({
  apiKey: 'your-api-key'
});

// Upload a file
const uploadResult = await sdk.uploadFile(fileObject);

// Transform the file
const transformResult = await sdk.transformFile(uploadResult.asset.id, {
  width: 300,
  height: 200,
  format: 'webp',
  quality: 80
});
```

## Transformer Service Structure

The transformer service is responsible for processing and transforming images according to requested parameters.

```
transformer/
├── src/                    # Source code directory
│   ├── controllers/        # Request handlers
│   ├── services/           # Transformation logic
│   ├── utils/              # Helper utilities
│   └── index.ts            # Service entry point
├── dist/                   # Compiled JavaScript code
├── .env                    # Environment variables
└── package.json            # Dependencies and scripts
```

### Transformer Service Features

1. **Image Resizing**: Change dimensions while maintaining aspect ratio
2. **Format Conversion**: Convert between image formats (JPEG, PNG, WebP)
3. **Quality Adjustment**: Compress images to reduce file size
4. **Effects**: Apply visual effects like grayscale
5. **Rotation**: Rotate images to different angles
6. **Caching**: Cache transformed images for performance

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create a new user
- `POST /api/auth/login` - Authenticate and get JWT
- `GET /api/auth/me` - Get current user profile

### Files

- `POST /api/files/upload` - Upload a file
- `GET /api/files` - List all files
- `GET /api/files/:fileId` - Get specific file
- `DELETE /api/files/:fileId` - Delete a file
- `POST /api/files/transform/:fileId` - Transform a file

### API Keys

- `POST /api/api-keys` - Create a new API key
- `GET /api/api-keys` - List all API keys
- `PUT /api/api-keys/:keyId` - Update an API key
- `DELETE /api/api-keys/:keyId` - Delete an API key

### API v1 (SDK Endpoints)

All endpoints at `/api/v1/*` mirror the standard API but require API key authentication and include rate limiting:

- `POST /api/v1/files/upload` - Upload a file via API key
- `GET /api/v1/files` - List files via API key
- `GET /api/v1/files/:fileId` - Get file via API key
- `DELETE /api/v1/files/:fileId` - Delete file via API key
- `POST /api/v1/files/transform/:fileId` - Transform file via API key

## Security Measures

1. **Authentication**:
   - Password hashing
   - JWT with expiration
   - API key validation

2. **API Security**:
   - Rate limiting (60 requests/minute)
   - API keys with expiration
   - API key deactivation

3. **File Security**:
   - File size limits
   - File type validation
   - Public/private file options

## Data Flow Examples

### File Upload Flow

1. User selects a file in frontend or via SDK
2. Authentication header (JWT or API key) is attached to request
3. Backend validates authentication
4. File is processed by middleware (size/type validation)
5. File is uploaded to storage service
6. File metadata is stored in database
7. Response with file details is returned

### Image Transformation Flow

1. User specifies transformation parameters
2. Request is sent to transformation endpoint
3. Backend validates parameters
4. Transformation service processes the image
5. Transformed image is stored or returned
6. Response with transformed image URL is returned

## Extension Points

The architecture allows for several extension points:

1. **Additional Authentication Methods**: OAuth, SAML, etc.
2. **New Transformation Types**: Video, audio, document formats
3. **Advanced Storage Options**: Multi-region, CDN integration
4. **Webhooks**: Event notifications for upload/transformation completion
5. **User Roles**: Admin, editor, viewer permissions

## Development Environment

1. **Local Development**:
   - Backend: `npm run dev` in `/be`
   - Frontend: `npm run dev` in `/fe`
   - SDK tests: `npm test` in `/dotformer-sdk`

2. **Environment Variables**:
   - Database connection string
   - JWT secret
   - Storage service credentials
   - Rate limiting configuration

## Deployment Architecture

The platform can be deployed in various configurations:

1. **Monolithic**: All components on a single server
2. **Microservices**: Separate services for auth, file storage, transformation
3. **Serverless**: API endpoints as functions, storage on cloud services
4. **Containerized**: Docker containers orchestrated with Kubernetes

Each component can scale independently based on load. 