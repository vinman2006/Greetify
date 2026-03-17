# 🎂 Greetify

> **A luxury, data-driven birthday dashboard** — built on a polyglot microservice architecture with a Java Spring Boot UI layer and a Node.js/MongoDB API backend, orchestrated via Docker Compose.

---

## ✨ What Is Greetify?

Greetify is a real-time birthday tracking and greeting assistant. It reads contact records from **MongoDB Atlas**, exposes them through a **Node.js REST API**, and renders a polished, animated dashboard through a **Java Spring Boot** application. The UI automatically classifies contacts into Today, Upcoming (7-day), Future Radar (30-day), and Missed birthday buckets — all with live data.

---

## 🗂️ Project Structure

```
Greetify/
├── backend-node/                  # Node.js REST API service
│   ├── controllers/
│   │   └── contactController.js   # Handles GET /api/contacts
│   ├── models/
│   │   └── contactModel.js        # Mongoose schema for contacts
│   ├── services/                  # (extensible service layer)
│   ├── uploads/                   # File upload staging directory
│   ├── server.js                  # Express app entry point
│   ├── package.json               # Node dependencies
│   ├── .env                       # MONGO_URI & PORT config
│   └── Dockerfile                 # Node service container definition
│
├── frontend-java/                 # Java Spring Boot UI service
│   ├── src/main/
│   │   ├── java/com/vinman/greetify/
│   │   │   ├── GreetifyApplication.java     # Spring Boot main class
│   │   │   └── controller/
│   │   │       └── UIController.java        # MVC + Proxy controller
│   │   └── resources/
│   │       ├── application.properties       # Port, API URL config
│   │       ├── templates/
│   │       │   └── index.html               # Thymeleaf dashboard template
│   │       └── static/
│   │           ├── css/
│   │           │   └── greetify.css         # Full Anti-Gravity design system
│   │           ├── js/
│   │           │   ├── greetify.js          # Core data fetch + DOM logic
│   │           │   └── animations.js        # GSAP animation sequences
│   │           ├── fonts/                   # Local font assets
│   │           └── assets/                  # Static image/icon assets
│   ├── pom.xml                    # Maven build & dependency config
│   └── Dockerfile                 # Java service container definition
│
├── sample-data/                   # Sample MongoDB import data
├── docker-compose.yml             # Multi-service orchestration
├── run.sh                         # Local dev helper script
├── production-deploy.md           # Production deployment notes
└── README.md
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│              User's Browser                 │
└────────────────────┬────────────────────────┘
                     │ HTTP :8080
┌────────────────────▼────────────────────────┐
│       Java Spring Boot (frontend-java)      │
│                                             │
│  GET /           → Serves index.html        │
│  GET /proxy/contacts → Proxies to Node API  │
└────────────────────┬────────────────────────┘
                     │ HTTP :4000
┌────────────────────▼────────────────────────┐
│         Node.js / Express (backend-node)    │
│                                             │
│  GET /api/contacts → contactController.js   │
└────────────────────┬────────────────────────┘
                     │ Mongoose / TLS
┌────────────────────▼────────────────────────┐
│              MongoDB Atlas                  │
│       db: greetify  •  collection: contacts │
└─────────────────────────────────────────────┘
```

The Java layer acts as both a **UI server** and an **API proxy** — the browser never talks to Node.js directly. This decouples the backend and allows independent scaling.

---

## ☕ Java Frontend — Deep Dive (`frontend-java/`)

### Tech Stack

| Technology | Version | Role |
|---|---|---|
| **Java** | 17 | Language runtime |
| **Spring Boot** | 3.2.3 | Application framework |
| **Spring Web MVC** | (via Boot) | MVC routing, `RestTemplate` proxy |
| **Thymeleaf** | (via Boot) | Server-side HTML templating |
| **Spring Boot DevTools** | (via Boot) | Hot-reload in development |
| **Lombok** | Latest | Boilerplate reduction (annotations) |
| **Maven** | 3.x | Build tool & dependency management |
| **GSAP** | 3.12.5 | Animation library (CDN, client-side) |
| **Vanilla CSS** | — | Custom Anti-Gravity design system |
| **Vanilla JS (ES6+)** | — | Client-side data fetch & DOM logic |

### Maven Configuration (`pom.xml`)

- **Group ID**: `com.vinman.greetify`
- **Artifact ID**: `frontend-java`
- **Version**: `1.0.0-PROD`
- **Packaged as**: Executable JAR via `spring-boot-maven-plugin`

**Key Dependencies:**

```xml
spring-boot-starter-web        <!-- HTTP server + RestTemplate -->
spring-boot-starter-thymeleaf <!-- Template engine -->
spring-boot-devtools           <!-- Dev hot-reload (optional) -->
lombok                         <!-- @Data, @Slf4j etc. (optional scope) -->
spring-boot-starter-test       <!-- JUnit / Mockito (test scope) -->
```

### Application Configuration (`application.properties`)

```properties
spring.application.name=greetify
server.port=8080
api.base.url=http://localhost:4000/api      # Overridden by Docker env var
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

> In Docker Compose, `API_BASE_URL` overrides `api.base.url` so that the Java container resolves the Node container by its service name (`nodeapi`).

### Controller — `UIController.java`

The single controller handles two responsibilities:

**1. Page Route**
```java
@GetMapping("/")
public String index(Model model) {
    return "index"; // → resolves to templates/index.html
}
```

**2. API Proxy**
```java
@GetMapping("/proxy/contacts")
@ResponseBody
public ResponseEntity<String> getContacts() {
    // Reads api.base.url from application.properties / env
    // Forwards GET to Node.js → /api/contacts
    // Returns raw JSON to browser
}
```

The proxy uses Spring's `RestTemplate` with structured logging via **SLF4J**. Errors fall back gracefully to an empty JSON array `[]`.

### Thymeleaf Template — `index.html`

The dashboard template is composed of:

| Section | ID | Description |
|---|---|---|
| Nav Island | `#typewriter-nav` | Animated status + pulse dot |
| Hero | `#hero-title` | Main heading + contact count |
| Stats Bar | `#stats-bar` | Total / Today / This Week / Missed pills |
| Today Section | `#today-section` | Birthday cards for today |
| Upcoming 7-Day | `#upcoming-7d` | Timeline cards for next 7 days |
| Future Radar 30-Day | `#upcoming-30d` | Timeline cards for next 30 days |
| Missed | `#missed-list` | Contacts whose birthday passed this year |

All data is hydrated **client-side** via `fetch('/proxy/contacts')` — Thymeleaf is used for static layout only.

### Static Assets (`src/main/resources/static/`)

| File | Purpose |
|---|---|
| `css/greetify.css` | Full Anti-Gravity design system — dark glassmorphism, section accents, stat pills, responsive layout |
| `js/greetify.js` | Core logic: fetches contacts, classifies by date, renders cards, handles empty states |
| `js/animations.js` | GSAP timeline sequences for hero entrance, card stagger, typewriter effect, pulse dot |
| `fonts/` | Self-hosted web fonts (avoids external CDN in offline/Docker environments) |
| `assets/` | Icons and static image assets |

### Building the JAR

```bash
cd frontend-java
mvn clean package -DskipTests
java -jar target/frontend-java-1.0.0-PROD.jar
```

The Spring Boot Maven Plugin produces a **fat executable JAR** with an embedded Tomcat server — no separate server installation required.

---

## 🟢 Node.js Backend — Deep Dive (`backend-node/`)

### Tech Stack

| Technology | Version | Role |
|---|---|---|
| **Node.js** | ≥18 | Runtime |
| **Express** | ^5.2.1 | HTTP framework |
| **Mongoose** | ^9.3.0 | MongoDB ODM |
| **dotenv** | ^17.3.1 | Environment variable loader |
| **cors** | ^2.8.6 | Cross-origin resource sharing |
| **morgan** | ^1.10.1 | HTTP request logger |
| **multer** | ^2.1.1 | Multipart file upload handling |
| **xlsx** | ^0.18.5 | Excel file parsing (spreadsheet import) |
| **nodemon** | ^3.1.14 | Dev auto-restart |

### Database Model — `contactModel.js`

```js
{
  name:           String  (required),  // Full name
  phone:          String  (required),  // Contact number
  dob:            String  (required),  // "YYYY-MM-DD"
  type:           String  (default: 'student'), // Relationship category
  wished:         Boolean (default: false),     // Greeted this year?
  lastWishedYear: Number  (default: null)       // Year last wished
}
```

Collection: `contacts` in database `greetify` on MongoDB Atlas.

### API Endpoints

| Method | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/` | inline | Health check — returns `"Greetify API Running"` |
| `GET` | `/api/contacts` | `contactController.getAllContacts` | Returns all contact records as JSON |

### Environment Variables (`.env`)

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/greetify
PORT=4000
```

---

## 🐳 Docker Setup

Both services are containerised and orchestrated with **Docker Compose 3.8**.

### `docker-compose.yml` — Services

| Service | Build Context | Port | Environment |
|---|---|---|---|
| `nodeapi` | `./backend-node` | `4000:4000` | `MONGO_URI`, `PORT` |
| `javaui` | `./frontend-java` | `8080:8080` | `API_BASE_URL=http://nodeapi:4000/api` |

`javaui` depends on `nodeapi` — Docker Compose ensures startup order.

### One-Command Start

```bash
# Set MONGO_URI in backend-node/.env first, then:
docker-compose up --build
```

Visit → **[http://localhost:8080](http://localhost:8080)**

---

## 🚀 Manual (Local Dev) Setup

### 1. Start the Node API

```bash
cd backend-node
cp .env.example .env       # Fill in MONGO_URI
npm install
npm run dev                # Hot-reload with nodemon on :4000
```

### 2. Start the Java UI

```bash
cd frontend-java
mvn clean package -DskipTests
java -jar target/frontend-java-1.0.0-PROD.jar
# OR for hot-reload during dev:
mvn spring-boot:run
```

App runs at **[http://localhost:8080](http://localhost:8080)**

---

## 🔗 Data Flow (End-to-End)

```
MongoDB Atlas (contacts collection)
    ↓  Mongoose query
Node.js GET /api/contacts
    ↓  JSON array of all contacts
Java Spring Boot GET /proxy/contacts (RestTemplate)
    ↓  Raw JSON forwarded to browser
Browser greetify.js
    ↓  Classifies contacts by date (today / 7d / 30d / missed)
    ↓  Renders cards into DOM sections
GSAP animations.js
    ↓  Entrance animations, typewriter, pulse dot
Final rendered dashboard
```

---

## 📦 Tech Stack Summary

| Layer | Technology |
|---|---|
| **UI Framework** | Java 17 + Spring Boot 3.2.3 |
| **Templating** | Thymeleaf |
| **Build Tool** | Apache Maven |
| **Animations** | GSAP 3.12.5 |
| **Styling** | Vanilla CSS (custom design system) |
| **Client Logic** | Vanilla JavaScript (ES6+) |
| **API Server** | Node.js + Express 5 |
| **Database ODM** | Mongoose 9 |
| **Database** | MongoDB Atlas |
| **Containerization** | Docker + Docker Compose 3.8 |
| **Dev Tools** | Spring Boot DevTools, Nodemon |

---

## 📄 License

MIT — see [LICENSE](./LICENSE)
