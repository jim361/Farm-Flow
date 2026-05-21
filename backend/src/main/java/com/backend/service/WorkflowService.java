package com.backend.service;

import com.backend.dto.WorkflowRequest;
import com.backend.dto.WorkflowResponse;
import com.backend.entity.*;
import com.backend.repository.WorkflowDeployRepository;
import com.backend.repository.WorkflowRepository;
import com.backend.security.CustomUserDetails;
import com.backend.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowDeployRepository deployRepository;

    /** FR-WB-002: 워크플로우 저장 (로그인 사용자 소유로 생성) */
    @Transactional
    public WorkflowResponse createWorkflow(WorkflowRequest request, CustomUserDetails userDetails) {
        String uid;
        do {
            uid = IdGenerator.generateWorkflowUid();
        } while (workflowRepository.findByUid(uid).isPresent());

        Workflow workflow = Workflow.builder()
                .uid(uid)
                .user(userDetails.getUser())
                .name(request.getName() != null ? request.getName() : "새 워크플로우")
                .description(request.getDescription() != null ? request.getDescription() : "나만의 커스텀 로직을 설계하세요.")
                .flowData(request.getFlowData() != null ? request.getFlowData() : "{}")
                .ruleData(request.getRuleData() != null ? request.getRuleData() : "{}")
                .status(WorkflowStatus.DRAFT)
                .version(1)
                .build();

        return toResponse(workflowRepository.save(workflow));
    }

    /** FR-ALGO-001: 내 워크플로우 목록 (본인 소유만) */
    public List<WorkflowResponse> getAllWorkflows(CustomUserDetails userDetails) {
        return workflowRepository.findByUser(userDetails.getUser())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** FR-ALGO-001: 워크플로우 상세 (본인 소유 검증) */
    public WorkflowResponse getWorkflowByUid(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        return toResponse(workflow);
    }

    /** FR-WB-003: 워크플로우 수정 (version 증가) */
    @Transactional
    public WorkflowResponse updateWorkflow(String uid, WorkflowRequest request,
                                           CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);

        if (request.getName() != null)        workflow.setName(request.getName());
        if (request.getDescription() != null) workflow.setDescription(request.getDescription());
        if (request.getFlowData() != null)    workflow.setFlowData(request.getFlowData());
        if (request.getRuleData() != null)    workflow.setRuleData(request.getRuleData());
        workflow.setVersion(workflow.getVersion() + 1);
        // 더티체킹으로 자동 저장됨

        return toResponse(workflow);
    }

    /** FR-ALGO-003: 워크플로우 삭제 (소프트 삭제 — ACTIVE 시 400) */
    @Transactional
    public void deleteWorkflow(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        if (WorkflowStatus.ACTIVE == workflow.getStatus()) {
            throw new IllegalStateException("배포 중인 워크플로우는 삭제할 수 없습니다. 먼저 중지해주세요.");
        }
        // 소프트 삭제: status=INACTIVE (workflow_deploys 이력 유지)
        workflow.setStatus(WorkflowStatus.INACTIVE);
    }

    /**
     * FR-ALGO-002: 워크플로우 배포
     * - status → ACTIVE
     * - workflow_deploys INSERT (action=DEPLOY, snapshot=rule_data)
     */
    @Transactional
    public WorkflowResponse deployWorkflow(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        workflow.setStatus(WorkflowStatus.ACTIVE);

        saveDeployHistory(workflow, userDetails.getUser(), "DEPLOY", workflow.getRuleData());

        return toResponse(workflow);
    }

    /**
     * FR-ALGO-003: 워크플로우 중지
     * - status → INACTIVE
     * - workflow_deploys INSERT (action=STOP)
     */
    @Transactional
    public WorkflowResponse stopWorkflow(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        workflow.setStatus(WorkflowStatus.INACTIVE);

        saveDeployHistory(workflow, userDetails.getUser(), "STOP", null);

        return toResponse(workflow);
    }

    /** FR-TPL-002: 템플릿으로부터 워크플로우 복사 생성 */
    @Transactional
    public WorkflowResponse createWorkflowFromTemplate(com.backend.entity.Template template,
                                                       String greenhouseUid,
                                                       CustomUserDetails userDetails) {
        String uid;
        do {
            uid = IdGenerator.generateWorkflowUid();
        } while (workflowRepository.findByUid(uid).isPresent());

        Workflow workflow = Workflow.builder()
                .uid(uid)
                .user(userDetails.getUser())
                .name("[템플릿] " + template.getName())
                .description(template.getDescription())
                .flowData(template.getFlowData() != null ? template.getFlowData() : "{}")
                .ruleData(template.getRuleData() != null ? template.getRuleData() : "{}")
                .status(WorkflowStatus.DRAFT)
                .version(1)
                .build();

        return toResponse(workflowRepository.save(workflow));
    }

    // ── 내부 유틸 ─────────────────────────────────────────────────────────────

    /** UID로 조회 + 소유자 검증 (본인 아니면 403) */
    private Workflow findAndCheckOwner(String uid, CustomUserDetails userDetails) {
        Workflow workflow = workflowRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("워크플로우를 찾을 수 없습니다. UID: " + uid));

        if (!workflow.getUser().getUid().equals(userDetails.getUid())) {
            throw new AccessDeniedException("본인 소유의 워크플로우만 접근할 수 있습니다.");
        }
        return workflow;
    }

    private void saveDeployHistory(Workflow workflow, User deployedBy,
                                   String action, String snapshot) {
        // UUID 기반 생성이라 실용적 충돌 확률 무시 가능
        String depUid = IdGenerator.generateDeployUid();

        WorkflowDeploy deploy = WorkflowDeploy.builder()
                .uid(depUid)
                .workflow(workflow)
                .deployedBy(deployedBy)
                .action(action)
                .snapshot(snapshot)
                .build();
        deployRepository.save(deploy);
    }

    private WorkflowResponse toResponse(Workflow w) {
        return WorkflowResponse.builder()
                .uid(w.getUid())
                .name(w.getName())
                .description(w.getDescription())
                .flowData(w.getFlowData())
                .ruleData(w.getRuleData())
                .status(w.getStatus().name())
                .version(w.getVersion())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}