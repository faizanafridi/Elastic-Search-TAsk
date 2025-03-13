# Movie Search Application

A scalable, high-performance movie search application with distributed caching, full-text search, and automated data updates.

## System Architecture

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: '#ffcc00'
    edgeLabelBackground: '#ffffff'
    tertiaryColor: '#ffffff'
  flowchart:
    curve: stepAfter
---
flowchart TB
  subgraph Client
    Browser["fa:fa-chrome Web Browser"]
  end
  subgraph Load_Balancer
    NGINX["fa:fa-server NGINX Proxy<br>Rate Limiting"]
  end
  subgraph Application_Layer
    Backend1["fa:fa-code Backend Instance 1"]
    Backend2["fa:fa-code Backend Instance 2"]
  end
  subgraph ThirdParty_API
    OMDb["fa:fa-film OMDb API"]
  end
  subgraph Database_Layer
    PrimaryDB["fa:fa-database MongoDB Primary"]
    SecondaryDB1["fa:fa-database MongoDB Secondary"]
    SecondaryDB2["fa:fa-database MongoDB Secondary"]
  end
  subgraph Search_Layer
    ES_Node1["fa:fa-search Elasticsearch Node 1"]
    ES_Node2["fa:fa-search Elasticsearch Node 2"]
    ES_Node3["fa:fa-search Elasticsearch Node 3"]
  end
  subgraph Caching_Layer
    RedisMaster["fa:fa-database Redis Master"]
    RedisSlave1["fa:fa-database Redis Slave 1"]
    RedisSlave2["fa:fa-database Redis Slave 2"]
  end

  Browser --> NGINX
  NGINX == Load Balancing ==> Backend1 & Backend2
  
  Backend1 -.-> OMDb
  Backend2 -.-> OMDb
  OMDb --> Backend1 & Backend2
  
  Backend1 -->|Store| PrimaryDB
  Backend2 -->|Store| PrimaryDB
  Backend1 -->|Index| ES_Node1
  Backend2 -->|Index| ES_Node1

  PrimaryDB -->|Replication| SecondaryDB1 & SecondaryDB2
  Backend1 -->|Query| RedisMaster
  Backend2 -->|Query| RedisMaster
  RedisMaster -->|Cache Miss| ES_Node1 & ES_Node2 & ES_Node3
  RedisMaster -->|Replication| RedisSlave1 & RedisSlave2

  classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px
  classDef loadbalancer fill:#ffe6cc,stroke:#ff9900,stroke-width:2px
  classDef application fill:#e6f7ff,stroke:#3399ff,stroke-width:2px
  classDef thirdparty fill:#fff2e6,stroke:#ff6600,stroke-width:2px
  classDef database fill:#e6ffe6,stroke:#33cc33,stroke-width:2px
  classDef search fill:#fff0f5,stroke:#ff66b2,stroke-width:2px
  classDef caching fill:#ffffe6,stroke:#ffff66,stroke-width:2px
  linkStyle default stroke:#ff9900,stroke-width:2px,fill:none

  Browser:::client
  NGINX:::loadbalancer
  Backend1:::application
  Backend2:::application
  OMDb:::thirdparty
  PrimaryDB:::database
  SecondaryDB1:::database
  SecondaryDB2:::database
  ES_Node1:::search
  ES_Node2:::search
  ES_Node3:::search
  RedisMaster:::caching
  RedisSlave1:::caching
  RedisSlave2:::caching
```

## Features

- **High Availability**: Distributed architecture with no single point of failure
- **Scalable Backend**: Multiple Node.js instances behind NGINX load balancer
- **Distributed Caching**: Redis master-slave replication for fast data access
- **Full-Text Search**: Elasticsearch cluster for efficient movie searches
- **Persistent Storage**: MongoDB replica set for data durability
- **Rate Limiting**: API request throttling via NGINX
- **Automated Updates**: Scheduled movie data fetching from OMDB API

## Prerequisites

- Docker and Docker Compose
- Node.js 18+
- OMDB API Key (get one from http://www.omdbapi.com/)
- At least 8GB RAM for running all services

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd Elastic-Search-TAsk
```

2. Create `.env` file from example:
```bash
cp var.env.example .env
```

3. Update the environment variables in `.env`:
```env
# Required configurations
OMDB_API_KEY=your_api_key_here
REDIS_PASSWORD=your_secure_password
!! Currently I have added OMDB_API_KEY and REDIS_PASSWORD variables no need to add any change anything.
```

4. Run the setup script (Linux/macOS):
```bash
sudo ./scripts/setup-host.sh
```

5. Start the application:
```bash
docker-compose up --scale backend=2 -d
```

The application will be available at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:80
- Elasticsearch: http://localhost:9200

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://mongodb1:27017,... |
| ELASTICSEARCH_NODES | Elasticsearch nodes | http://es01:9200,... |
| REDIS_PASSWORD | Redis authentication | required |
| OMDB_API_KEY | OMDB API key | required |
| PORT | Backend port | 5000 |
| NODE_ENV | Environment | production |

## Project Structure

```
movie-search/
├── docker-compose.yml      # Docker services configuration
├── .env                 # Environment variables
├── backend/               
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── config/        # Configurations
│   └── tests/             # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   └── services/      # API clients
│   └── tests/             # Frontend tests
└── nginx/                 # NGINX configuration
```

## API Endpoints

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| /api/movies/search | GET | Search movies | 100/min |
| /api/movies/fetch | POST | Update movie database | 1/hour |

## Development

1. Install dependencies:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

2. Run tests:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Monitoring

- NGINX logs: `./logs/nginx/`
- Application logs: `./logs/app/`
- MongoDB logs: `./logs/mongodb/`

## Security

- NGINX rate limiting
- Redis password authentication
- Environment variable encryption
- No sensitive data in logs
- Secure communication between services

## Performance

- Redis caching for frequent searches
- Elasticsearch for fast full-text search
- MongoDB replica set for read scaling
- NGINX load balancing
- Response time optimization

## Using the Application

1. When the application starts, it automatically fetches space-themed movies from 2020 from the OMDB API
2. Use the search bar to search for movies by:
   - Title
   - Director
   - Plot
3. Results will display:
   - Movie poster
   - Title
   - Director
   - Plot

## Development

- Frontend code is in the `frontend` directory
- Backend code is in the `backend` directory
- Tests can be run using `npm test` in respective directories

