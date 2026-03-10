package com.innovix.sahayak;

import com.innovix.sahayak.dto.LocationDTO;
import com.innovix.sahayak.model.Location;
import com.innovix.sahayak.repository.LocationRepository;
import com.innovix.sahayak.service.LocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Sahayak-Drishti REST API.
 * Uses H2 in-memory database (same config as development).
 */
@SpringBootTest
@AutoConfigureMockMvc
class SahayakApplicationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private LocationRepository locationRepository;
    @Autowired private LocationService locationService;

    @BeforeEach
    void setUp() {
        // Insert a test location
        if (!locationRepository.existsByLocationKey("test_location")) {
            Location loc = Location.builder()
                .locationKey("test_location")
                .nameEn("Test Location")
                .nameHi("परीक्षण स्थान")
                .scriptEn("You are at the test location.")
                .scriptHi("आप परीक्षण स्थान पर हैं।")
                .floor("Ground")
                .building("Test Block")
                .active(true)
                .build();
            locationRepository.save(loc);
        }
    }

    // ── Context loads ──────────────────────────────────────
    @Test
    @DisplayName("Spring context loads without errors")
    void contextLoads() {
        assertNotNull(locationRepository);
        assertNotNull(locationService);
    }

    // ── Public API ─────────────────────────────────────────
    @Test
    @DisplayName("GET /api/location/{key} — returns location for valid key")
    void getLocationByValidKey() throws Exception {
        mockMvc.perform(get("/api/location/test_location")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locationKey", is("test_location")))
                .andExpect(jsonPath("$.nameEn", is("Test Location")))
                .andExpect(jsonPath("$.scriptEn", not(emptyString())))
                .andExpect(jsonPath("$.scriptHi", not(emptyString())));
    }

    @Test
    @DisplayName("GET /api/location/{key} — returns 404 for unknown key")
    void getLocationByInvalidKey() throws Exception {
        mockMvc.perform(get("/api/location/nonexistent_key")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("LOCATION_NOT_FOUND")));
    }

    @Test
    @DisplayName("GET /api/location — returns active locations list")
    void getAllActiveLocations() throws Exception {
        mockMvc.perform(get("/api/location")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))));
    }

    // ── Admin API (protected) ──────────────────────────────
    @Test
    @DisplayName("GET /api/admin/stats — 401 without credentials")
    void adminStatsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/admin/stats — returns stats with ADMIN role")
    void adminStatsAuthorized() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLocations", greaterThan(0)))
                .andExpect(jsonPath("$.activeLocations", greaterThan(0)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/admin/locations — creates new location")
    void createLocation() throws Exception {
        String json = """
            {
              "locationKey": "new_test_loc",
              "nameEn": "New Test",
              "nameHi": "नया परीक्षण",
              "scriptEn": "You are at the new test location.",
              "scriptHi": "आप नए परीक्षण स्थान पर हैं।",
              "floor": "Ground",
              "building": "Test Block",
              "active": true
            }
            """;

        mockMvc.perform(post("/api/admin/locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.locationKey", is("new_test_loc")))
                .andExpect(jsonPath("$.id", notNullValue()));

        // Cleanup
        locationRepository.findByLocationKeyAndActiveTrue("new_test_loc")
                .ifPresent(l -> locationRepository.deleteById(l.getId()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/admin/locations — rejects duplicate key")
    void createDuplicateLocationKey() throws Exception {
        String json = """
            {
              "locationKey": "test_location",
              "nameEn": "Duplicate",
              "nameHi": "डुप्लीकेट",
              "scriptEn": "Script.",
              "scriptHi": "स्क्रिप्ट।",
              "active": true
            }
            """;

        mockMvc.perform(post("/api/admin/locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("DUPLICATE_KEY")));
    }

    // ── Service layer ──────────────────────────────────────
    @Test
    @DisplayName("LocationService.getByKey — returns DTO for valid key")
    void serviceGetByKey() {
        LocationDTO.Response result = locationService.getByKey("test_location");
        assertNotNull(result);
        assertEquals("test_location", result.getLocationKey());
        assertEquals("Test Location", result.getNameEn());
    }

    @Test
    @DisplayName("LocationService.getByKey — throws for unknown key")
    void serviceGetByKeyNotFound() {
        assertThrows(LocationService.LocationNotFoundException.class,
                () -> locationService.getByKey("does_not_exist"));
    }

    @Test
    @DisplayName("LocationService.getStats — returns valid stats object")
    void serviceGetStats() {
        LocationDTO.Stats stats = locationService.getStats();
        assertNotNull(stats);
        assertTrue(stats.getTotalLocations() > 0);
        assertTrue(stats.getActiveLocations() >= 0);
        assertEquals(stats.getTotalLocations(), stats.getActiveLocations() + stats.getInactiveLocations());
    }
}
