# Dotformer

Dotformer is a powerful file transformation platform that allows users to upload, transform, and manage digital assets. It provides both a web interface and a JavaScript SDK for programmatic access.

## Features

- **File Management**: Upload, view, and delete files
- **Image Transformation**: Resize, convert formats, adjust quality, and apply effects
- **Authentication**: JWT-based web authentication and API key-based programmatic access
- **File Storage**: AWS S3 integration with support for both public and private files
- **Cross-platform SDK**: JavaScript SDK for both browser and Node.js environments

## Project Structure

```
.
├── be/                    # Backend (Express.js)
├── fe/                    # Frontend (Next.js)
├── dotformer-sdk/         # JavaScript SDK
├── transformer/           # Image transformation service
└── docs/                  # Documentation
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- AWS S3 account (for file storage)
- npm or yarn

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd be
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dotformer"
   JWT_SECRET="your-jwt-secret"
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="your-aws-region"
   AWS_BUCKET_NAME="your-s3-bucket-name"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Transformer Service Setup

1. Navigate to the transformer directory:
   ```bash
   cd transformer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   PORT=3002
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_REGION="your-aws-region"
   AWS_BUCKET_NAME="your-s3-bucket-name"
   ```

4. Start the service:
   ```bash
   npm run dev
   ```

## Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write tests for your changes
5. Submit a pull request

### Development Guidelines

- Follow the existing code style and architecture
- Write clear commit messages
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a PR

### Testing

Run tests for each component:

```bash
# Backend tests
cd be
npm test

# Frontend tests
cd fe
npm test

# SDK tests
cd dotformer-sdk
npm test

# Transformer service tests
cd transformer
npm test
```

## API Documentation

The API documentation is available in the `docs` directory. Key endpoints include:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT
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

## Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- API keys can be revoked and have expiration dates
- Rate limiting is enforced (60 requests/minute)
- File uploads are validated for type and size
- Private files require authentication

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## CI/CD Pipeline

Dotformer uses GitHub Actions for CI/CD to automatically test, build, and deploy the backend and transformer services to AWS EC2 instances.

### CI Pipeline

The CI pipeline is triggered on pushes to the `main` and `development` branches, as well as pull requests to these branches. It:

1. Runs tests for both backend and transformer services
2. Builds Docker images for validation

### CD Pipeline

The CD pipeline is triggered after a successful CI run on the `main` branch. It:

1. Builds and pushes Docker images to Docker Hub
2. Deploys the images to AWS EC2 instances
3. Manages container lifecycle (stopping, removing, and starting new containers)

### Local Docker Development

You can use Docker Compose for local development:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Deployment to AWS

To set up AWS deployment:

1. Configure the required GitHub repository secrets (see `.github/workflows/README.md`)
2. Create repositories on Docker Hub for the images
3. Set up EC2 instance with Docker installed
4. Run the EC2 setup script: `bash scripts/ec2-setup.sh`

For more details, see the [CI/CD documentation](.github/workflows/README.md). 