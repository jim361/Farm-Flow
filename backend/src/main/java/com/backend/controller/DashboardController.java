package com.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private static final String METRICS_KEY = "dashboard:metrics";
    private static final String ALERTS_KEY = "dashboard:alerts";
    private static final String DEFAULT_GREENHOUSE_UID = "GH-001";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @GetMapping("/metrics")
    public ResponseEntity<List<MetricItem>> getMetrics(
            @RequestParam(defaultValue = DEFAULT_GREENHOUSE_UID) String greenhouseUid) {
        String normalizedGreenhouseUid = normalizeGreenhouseUid(greenhouseUid);
        String stored = redisTemplate.opsForValue().get(metricsKey(normalizedGreenhouseUid));
        if ((stored == null || stored.isBlank()) && DEFAULT_GREENHOUSE_UID.equals(normalizedGreenhouseUid)) {
            stored = redisTemplate.opsForValue().get(METRICS_KEY);
        }
        if (stored != null && !stored.isBlank()) {
            try {
                return ResponseEntity.ok(objectMapper.readValue(stored, new TypeReference<List<MetricItem>>() {}));
            } catch (Exception ignored) {
                // Fall through to defaults when demo data is malformed.
            }
        }
        return ResponseEntity.ok(defaultMetrics());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertItem>> getAlerts(
            @RequestParam(defaultValue = DEFAULT_GREENHOUSE_UID) String greenhouseUid) {
        String normalizedGreenhouseUid = normalizeGreenhouseUid(greenhouseUid);
        List<String> stored = redisTemplate.opsForList().range(alertsKey(normalizedGreenhouseUid), 0, 49);
        if ((stored == null || stored.isEmpty()) && DEFAULT_GREENHOUSE_UID.equals(normalizedGreenhouseUid)) {
            stored = redisTemplate.opsForList().range(ALERTS_KEY, 0, 49);
        }
        if (stored == null || stored.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<AlertItem> alerts = new ArrayList<>();
        for (String item : stored) {
            try {
                alerts.add(objectMapper.readValue(item, AlertItem.class));
            } catch (Exception ignored) {
                // Ignore malformed demo alert entries.
            }
        }
        return ResponseEntity.ok(alerts);
    }

    @DeleteMapping("/alerts/{alertId}")
    public ResponseEntity<Void> acknowledgeAlert(
            @PathVariable String alertId,
            @RequestParam(defaultValue = DEFAULT_GREENHOUSE_UID) String greenhouseUid) {
        String normalizedGreenhouseUid = normalizeGreenhouseUid(greenhouseUid);
        removeAlertById(alertsKey(normalizedGreenhouseUid), alertId);
        if (DEFAULT_GREENHOUSE_UID.equals(normalizedGreenhouseUid)) {
            removeAlertById(ALERTS_KEY, alertId);
        }
        return ResponseEntity.noContent().build();
    }

    private String normalizeGreenhouseUid(String greenhouseUid) {
        String normalized = greenhouseUid == null ? "" : greenhouseUid.trim();
        return normalized.isBlank() ? DEFAULT_GREENHOUSE_UID : normalized;
    }

    private String metricsKey(String greenhouseUid) {
        return METRICS_KEY + ":" + greenhouseUid;
    }

    private String alertsKey(String greenhouseUid) {
        return ALERTS_KEY + ":" + greenhouseUid;
    }

    private void removeAlertById(String key, String alertId) {
        List<String> stored = redisTemplate.opsForList().range(key, 0, -1);
        if (stored == null || stored.isEmpty()) {
            return;
        }

        List<String> remaining = new ArrayList<>();
        for (String item : stored) {
            try {
                AlertItem alert = objectMapper.readValue(item, AlertItem.class);
                if (!alertId.equals(alert.id())) {
                    remaining.add(item);
                }
            } catch (Exception ignored) {
                remaining.add(item);
            }
        }

        redisTemplate.delete(key);
        if (!remaining.isEmpty()) {
            redisTemplate.opsForList().rightPushAll(key, remaining);
            redisTemplate.opsForList().trim(key, 0, 49);
        }
    }

    private List<MetricItem> defaultMetrics() {
        return List.of(
                new MetricItem("temp", "온도", "°C", 24.1, 0.7, "stable"),
                new MetricItem("humidity", "습도", "%", 63.0, -1.2, "stable"),
                new MetricItem("co2", "CO2", "ppm", 892.0, 4.5, "warning"),
                new MetricItem("light", "조도", "lux", 12740.0, 3.3, "stable")
        );
    }

    public record MetricItem(
            String id,
            String label,
            String unit,
            double value,
            double trend,
            String state
    ) {}

    public record AlertItem(
            String id,
            String title,
            String message,
            String time,
            String source,
            String deviceUid,
            String command,
            String topic
    ) {}
}
