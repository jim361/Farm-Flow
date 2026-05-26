package com.backend.controller;

import com.backend.dto.TemplateApplyRequest;
import com.backend.dto.TemplateResponse;
import com.backend.dto.WorkflowResponse;
import com.backend.security.CustomUserDetails;
import com.backend.service.TemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "FR-TPL: 샘플 템플릿",
        description = "작물별 검증된 자동화 템플릿 조회 및 1-클릭 적용 (워크플로우 복사 생성).")
@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @Operation(summary = "템플릿 전체 목록 조회",
            description = "crop_type 파라미터로 작물별 필터링 지원. 이름·작물·다운로드 수·작성자 포함.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공")})
    @GetMapping
    public ResponseEntity<List<TemplateResponse>> getAllTemplates(
            @Parameter(description = "작물 타입 필터 (선택)", example = "strawberry")
            @RequestParam(required = false) String cropType) {
        if (cropType != null && !cropType.isBlank()) {
            return ResponseEntity.ok(templateService.getTemplatesByCropType(cropType));
        }
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @Operation(summary = "특정 템플릿 상세 조회",
            description = "템플릿 uid로 flowData, ruleData, scheduleData 전체 반환.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "템플릿 없음")
    })
    @GetMapping("/{uid}")
    public ResponseEntity<TemplateResponse> getTemplateByUid(
            @Parameter(description = "템플릿 외부 UID", example = "TPL-0001")
            @PathVariable String uid) {
        return ResponseEntity.ok(templateService.getTemplateByUid(uid));
    }

    @Operation(summary = "템플릿 적용",
            description = "flow_data + rule_data 복사하여 새 워크플로우 생성. download_cnt +1. 대상 하우스 필수.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "적용 성공 — 생성된 workflow uid 반환"),
            @ApiResponse(responseCode = "400", description = "하우스 미선택"),
            @ApiResponse(responseCode = "404", description = "템플릿 없음")
    })
    @PostMapping("/{uid}/apply")
    public ResponseEntity<WorkflowResponse> applyTemplate(
            @Parameter(description = "템플릿 외부 UID", example = "TPL-0001")
            @PathVariable String uid,
            @RequestBody TemplateApplyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(templateService.applyTemplate(uid, request, userDetails));
    }
}