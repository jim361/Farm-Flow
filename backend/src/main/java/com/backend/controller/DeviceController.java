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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(
        name = "FR-DEV: 기기 관리",
        description = "온실 단위 기기 등록, 조회, 상태 변경, 삭제 API입니다."
)
@RestController
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @Operation(summary = "온실별 기기 목록 조회")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공")})
    @GetMapping("/api/v1/greenhouses/{greenhouseUid}/devices")
    public ResponseEntity<List<DeviceResponse>> getDevicesByGreenhouse(
            @Parameter(description = "온실 UID", example = "GH-001")
            @PathVariable String greenhouseUid) {
        return ResponseEntity.ok(deviceService.getDevicesByGreenhouse(greenhouseUid));
    }

    @Operation(summary = "온실별 기기 등록")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "등록 성공"),
            @ApiResponse(responseCode = "400", description = "필수값 누락 또는 잘못된 deviceType")
    })
    @PostMapping("/api/v1/greenhouses/{greenhouseUid}/devices")
    public ResponseEntity<DeviceResponse> createDevice(
            @Parameter(description = "온실 UID", example = "GH-001")
            @PathVariable String greenhouseUid,
            @RequestBody DeviceRequest request) {
        return ResponseEntity.ok(deviceService.createDevice(greenhouseUid, request));
    }

    @Operation(summary = "온실별 기기 상태 변경")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 status 값"),
            @ApiResponse(responseCode = "404", description = "기기 없음")
    })
    @PatchMapping("/api/v1/greenhouses/{greenhouseUid}/devices/{deviceUid}/status")
    public ResponseEntity<DeviceResponse> updateStatus(
            @PathVariable String greenhouseUid,
            @PathVariable String deviceUid,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(deviceService.updateStatus(greenhouseUid, deviceUid, body.get("status")));
    }

    @Operation(summary = "온실별 기기 삭제")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "기기 없음")
    })
    @DeleteMapping("/api/v1/greenhouses/{greenhouseUid}/devices/{deviceUid}")
    public ResponseEntity<Void> deleteDevice(
            @PathVariable String greenhouseUid,
            @PathVariable String deviceUid) {
        deviceService.deleteDevice(greenhouseUid, deviceUid);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "전체 기기 목록 조회")
    @GetMapping("/api/v1/devices")
    public ResponseEntity<List<DeviceResponse>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @Operation(summary = "타입별 기기 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 deviceType")
    })
    @GetMapping("/api/v1/devices/filter")
    public ResponseEntity<List<DeviceResponse>> getDevicesByType(
            @Parameter(description = "기기 타입", example = "SENSOR",
                    schema = @Schema(allowableValues = {"SENSOR", "ACTUATOR"}))
            @RequestParam String deviceType) {
        return ResponseEntity.ok(deviceService.getDevicesByDeviceType(deviceType));
    }
}
