package com.backend.controller;

import com.backend.dto.WorkflowRequest;
import com.backend.dto.WorkflowResponse;
import com.backend.security.CustomUserDetails;
import com.backend.service.WorkflowService;
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

@Tag(name = "FR-WB / FR-ALGO: 워크플로우 빌더 및 CRUD",
        description = """
                워크플로우 저장·수정·삭제·배포·중지·목록/상세 조회.
                본인 소유 워크플로우만 접근 가능. 배포 시 workflow_deploys 이력 자동 기록.
                [플로우] 저장(POST) → 수정(PUT) → 배포(deploy) → 중지(stop)
                """)
@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    @Operation(summary = "워크플로우 저장",
            description = "로직 빌더에서 설계 완료 후 저장. UID(WF-+4자리) 자동 생성. 로그인 사용자 소유로 등록.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "저장 성공")})
    @PostMapping
    public ResponseEntity<WorkflowResponse> createWorkflow(
            @RequestBody WorkflowRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(workflowService.createWorkflow(request, userDetails));
    }

    @Operation(summary = "워크플로우 목록 조회",
            description = "내 워크플로우 목록만 반환 (본인 소유 한정). 내부 id 미노출.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "조회 성공")})
    @GetMapping
    public ResponseEntity<List<WorkflowResponse>> getAllWorkflows(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(workflowService.getAllWorkflows(userDetails));
    }

    @Operation(summary = "워크플로우 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "본인 소유 아님"),
            @ApiResponse(responseCode = "404", description = "워크플로우 없음")
    })
    @GetMapping("/{uid}")
    public ResponseEntity<WorkflowResponse> getWorkflow(
            @Parameter(description = "워크플로우 UID", example = "WF-A1B2")
            @PathVariable String uid,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(workflowService.getWorkflowByUid(uid, userDetails));
    }

    @Operation(summary = "워크플로우 수정",
            description = "수정 시 version이 1 증가합니다. 본인 소유 아니면 403.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "본인 소유 아님"),
            @ApiResponse(responseCode = "404", description = "워크플로우 없음")
    })
    @PutMapping("/{uid}")
    public ResponseEntity<WorkflowResponse> updateWorkflow(
            @Parameter(description = "워크플로우 UID", example = "WF-A1B2")
            @PathVariable String uid,
            @RequestBody WorkflowRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(workflowService.updateWorkflow(uid, request, userDetails));
    }

    @Operation(summary = "워크플로우 삭제",
            description = "소프트 삭제 (status=INACTIVE). workflow_deploys 이력 유지. ACTIVE 상태면 400.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "400", description = "배포 중인 워크플로우 삭제 불가"),
            @ApiResponse(responseCode = "403", description = "본인 소유 아님"),
            @ApiResponse(responseCode = "404", description = "워크플로우 없음")
    })
    @DeleteMapping("/{uid}")
    public ResponseEntity<Void> deleteWorkflow(
            @Parameter(description = "워크플로우 UID", example = "WF-A1B2")
            @PathVariable String uid,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        workflowService.deleteWorkflow(uid, userDetails);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "워크플로우 배포",
            description = "status → ACTIVE. workflow_deploys INSERT (action=DEPLOY, snapshot=rule_data).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "배포 성공"),
            @ApiResponse(responseCode = "403", description = "본인 소유 아님"),
            @ApiResponse(responseCode = "404", description = "워크플로우 없음")
    })
    @PostMapping("/{uid}/deploy")
    public ResponseEntity<WorkflowResponse> deployWorkflow(
            @Parameter(description = "워크플로우 UID", example = "WF-A1B2")
            @PathVariable String uid,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(workflowService.deployWorkflow(uid, userDetails));
    }

    @Operation(summary = "워크플로우 중지",
            description = "status → INACTIVE. workflow_deploys INSERT (action=STOP).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "중지 성공"),
            @ApiResponse(responseCode = "403", description = "본인 소유 아님"),
            @ApiResponse(responseCode = "404", description = "워크플로우 없음")
    })
    @PostMapping("/{uid}/stop")
    public ResponseEntity<WorkflowResponse> stopWorkflow(
            @Parameter(description = "워크플로우 UID", example = "WF-A1B2")
            @PathVariable String uid,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(workflowService.stopWorkflow(uid, userDetails));
    }
}