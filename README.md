# Sahayak-Drishti 👁
### A "No-App" Audio Guidance System for Public Spaces
**Team Innovix | BIT Mesra, Off Campus Jaipur | NSS IDP SP-2026**

---

## Project Structure

```
sahayak-drishti/
├── pom.xml                                         ← Maven build config
├── qr_generator.py                                 ← Python QR printer script
│
├── src/main/java/com/innovix/sahayak/
│   ├── SahayakApplication.java                     ← Spring Boot entry point
│   ├── model/
│   │   └── Location.java                           ← JPA Entity
│   ├── repository/
│   │   └── LocationRepository.java                 ← Spring Data JPA
│   ├── dto/
│   │   └── LocationDTO.java                        ← Request / Response DTOs
│   ├── service/
│   │   ├── LocationService.java                    ← Business logic
│   │   └── QRCodeService.java                      ← ZXing QR generation
│   ├── controller/
│   │   ├── LocationController.java                 ← Public REST API
│   │   └── AdminController.java                    ← Protected Admin REST API
│   └── config/
│       ├── SecurityConfig.java                     ← Spring Security
│       └── GlobalExceptionHandler.java             ← Global error handling
│
├── src/main/resources/
│   ├── application.properties                      ← App configuration
│   ├── data.sql                                    ← Seed data (14 locations)
│   └── static/
│       ├── index.html                              ← QR scan landing page
│       ├── admin.html                              ← Admin CRUD panel
│       ├── manifest.json                           ← PWA manifest
│       ├── sw.js                                   ← Service Worker (offline)
│       ├── css/
│       │   ├── style.css                           ← Guide page styles
│       │   └── admin.css                           ← Admin panel styles
│       └── js/
│           ├── app.js                              ← Speech API + fetch logic
│           └── admin.js                            ← Admin CRUD JavaScript
│
└── src/test/
    └── SahayakApplicationTests.java                ← JUnit 5 tests
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2 |
| REST API | Spring Web MVC |
| Security | Spring Security (HTTP Basic Auth) |
| ORM | Spring Data JPA + Hibernate |
| Database | H2 (dev) / MySQL (production) |
| QR Generation | ZXing (Java), qrcode library (Python) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Speech | Web Speech API (SpeechSynthesis) |
| PWA | Service Worker + Cache API |
| Build | Maven |

---

## REST API Endpoints

### Public (No Auth Required)
```
GET  /api/location                    → List all active locations
GET  /api/location/{key}              → Get location by key (QR scan)
GET  /api/location/{key}/qr           → Get QR code PNG image
GET  /api/location/{key}/qr/download  → Download QR code PNG
GET  /api/location/{key}/url          → Get scan URL string
```

### Admin (HTTP Basic Auth)
```
GET    /api/admin/stats               → Dashboard stats
GET    /api/admin/locations           → All locations (incl. inactive)
GET    /api/admin/locations/{id}      → Single location
POST   /api/admin/locations           → Create new location
PUT    /api/admin/locations/{id}      → Update location
PATCH  /api/admin/locations/{id}/activate   → Re-enable location
PATCH  /api/admin/locations/{id}/deactivate → Soft-disable location
DELETE /api/admin/locations/{id}      → Hard delete
GET    /api/admin/search?q=keyword    → Search locations
```

---

## Setup & Run

### Prerequisites
- Java 17+ (`java -version`)
- Maven 3.8+ (`mvn -version`)
- Python 3.8+ (for QR generator only)

### 1. Clone / Download
```bash
cd sahayak-drishti
```

### 2. Run the Backend
```bash
mvn spring-boot:run
```

Server starts at: **http://localhost:8080**

### 3. Access the App
| URL | Description |
|---|---|
| http://localhost:8080 | Public guide page (scan landing) |
| http://localhost:8080/admin.html | Admin panel |
| http://localhost:8080/h2-console | H2 DB console (dev) |
| http://localhost:8080/index.html?loc=library_entry | Test a QR scan |

### 4. Admin Login
```
Username: admin
Password: Innovix@2026
```
> Change in `application.properties` before production.

### 5. Run Tests
```bash
mvn test
```

### 6. Generate QR Stickers
```bash
pip install qrcode[pil] Pillow
# Edit SERVER_URL in qr_generator.py to your server IP
python qr_generator.py
# PNG files → ./qr_output/
```

---

## Production Deployment

### Switch to MySQL
In `application.properties`, uncomment:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sahayakdb
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

And in `pom.xml`, uncomment the MySQL dependency.

### Build JAR
```bash
mvn clean package -DskipTests
java -jar target/sahayak-drishti-1.0.0.jar
```

### Update QR Base URL
```properties
sahayak.qr.base-url=http://YOUR_DOMAIN_OR_IP:8080
```

---

## How It Works

```
[QR Sticker at Campus Location]
         ↓  (user scans)
[Phone Camera → Opens Browser]
         ↓
[GET /index.html?loc=library_entry]
         ↓
[JavaScript → GET /api/location/library_entry]
         ↓
[Spring Boot → H2/MySQL → Returns JSON]
         ↓
[JavaScript → Web Speech API]
         ↓
🔊 "You are at the Main Library entrance..."
```

---

*Sahayak-Drishti — Empowering independent navigation for all.*
