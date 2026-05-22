package com.backend.controller;

import com.backend.dto.DeviceRequest;
import com.backend.dto.DeviceResponse;
import com.backend.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "FR-DEV: 기기 관리",
        description = "하우스 하위 기기(센서/액추에이터) 등록·조회·상태 변경·삭제. mqtt_topic 자동 생성.")
@RestController
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    // ── 하우스 하위 엔드포인트 ────────────────────────────────────────────────

    @Operation(summary = "기기 목록 조회 (하우스별)",
            description = "특정 하우스에 등록된 기기 목록을 반환합니다.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공")})
    @GetMapping("/api/v1/greenhouses/{greenhouseUid}/devices")
    public ResponseEntity<List<DeviceResponse>> getDevicesByGreenhouse(
            @Parameter(description = "하우스 외부 UID", example = "GH-001")
            @PathVariable String greenhouseUid) {
        return ResponseEntity.ok(deviceService.getDevicesByGreenhouse(greenhouseUid));
    }

    @Operation(summary = "기기 등록",
            description = "하우스에 센서 또는 제어기를 등록합니다. uid(DEV-+4자리)와 mqtt_topic이 자동 생성됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "400", description = "필수값 누락 또는 잘못된 deviceType")
    })
    @PostMapping("/api/v1/greenhouses/{greenhouseUid}/devices")
    public ResponseEntity<DeviceResponse> createDevice(
            @Parameter(description = "하우스 외부 UID", example = "GH-001")
            @PathVariable String greenhouseUid,
            @RequestBody DeviceRequest request) {
        return ResponseEntity.ok(deviceService.createDevice(greenhouseUid, request));
    }

    // ── 기기 단독 엔드포인트 ──────────────────────────────────────────────────

    @Operation(summary = "기기 상태 변경",
            description = "기기 상태를 ACTIVE / INACTIVE / ERROR 중 하나로 변경합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 status 값"),
            @ApiResponse(responseCode = "404", description = "기기 없음")
    })
    @PatchMapping("/api/v1/devices/{deviceUid}/status")
    public ResponseEntity<DeviceResponse> updateStatus(
            @Parameter(description = "기기 외부 UID", example = "DEV-A3X9")
            @PathVariable String deviceUid,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(deviceService.updateStatus(deviceUid, status));
    }

    @Operation(summary = "기기 삭제")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "기기 없음")
    })
    @DeleteMapping("/api/v1/devices/{deviceUid}")
    public ResponseEntity<Void> deleteDevice(
            @Parameter(description = "기기 외부 UID", example = "DEV-A3X9")
            @PathVariable String deviceUid) {
        deviceService.deleteDevice(deviceUid);
        return ResponseEntity.noContent().build();
    }

    // ── 로직 빌더 전용 (하우스 무관 전체 목록) ────────────────────────────────

    @Operation(summary = "전체 기기 목록 조회 (로직 빌더용)",
            description = "로직 빌더 장치 라이브러리에서 SENSOR/ACTUATOR 구분 없이 전체 목록을 표시할 때 호출됩니다.")
    @GetMapping("/api/v1/devices")
    public ResponseEntity<List<DeviceResponse>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @Operation(summary = "타입별 기기 조회 (로직 빌더용)",
            description = "SENSOR 또는 ACTUATOR 타입으로 필터링합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 deviceType (SENSOR 또는 ACTUATOR만 허용)")
    })
    @GetMapping("/api/v1/devices/filter")
    public ResponseEntity<List<DeviceResponse>> getDevicesByType(
            @Parameter(description = "장치 타입", example = "SENSOR",
                    schema = @Schema(allowableValues = {"SENSOR", "ACTUATOR"}))
            @RequestParam String deviceType) {
        return ResponseEntity.ok(deviceService.getDevicesByDeviceType(deviceType));
    }
}