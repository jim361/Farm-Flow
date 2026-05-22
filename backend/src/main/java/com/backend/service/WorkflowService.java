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

    @Transactional
    public WorkflowResponse createWorkflow(WorkflowRequest request, CustomUserDetails userDetails) {
        String uid;
        do {
            uid = IdGenerator.generateWorkflowUid();
        } while (workflowRepository.findByUid(uid).isPresent());

        String flowData = (request.getFlowData() != null && !request.getFlowData().isBlank())
                ? request.getFlowData() : "{}";
        String ruleData = (request.getRuleData() != null && !request.getRuleData().isBlank())
                ? request.getRuleData() : "{}";

        Workflow workflow = Workflow.builder()
                .uid(uid)
                .user(userDetails.getUser())
                .name(request.getName() != null ? request.getName() : "새 워크플로우")
                .description(request.getDescription())
                .flowData(flowData)
                .ruleData(ruleData)
                .status(WorkflowStatus.DRAFT)
                .version(1)
                .build();

        return toResponse(workflowRepository.save(workflow));
    }

    public List<WorkflowResponse> getAllWorkflows(CustomUserDetails userDetails) {
        return workflowRepository.findByUser(userDetails.getUser())
                .stream()
                .filter(w -> w.getStatus() != WorkflowStatus.INACTIVE)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public WorkflowResponse getWorkflowByUid(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        return toResponse(workflow);
    }

    @Transactional
    public WorkflowResponse updateWorkflow(String uid, WorkflowRequest request,
                                           CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);

        if (request.getName() != null)        workflow.setName(request.getName());
        if (request.getDescription() != null) workflow.setDescription(request.getDescription());
        if (request.getFlowData() != null)    workflow.setFlowData(request.getFlowData());
        if (request.getRuleData() != null)    workflow.setRuleData(request.getRuleData());
        workflow.setVersion(workflow.getVersion() + 1);

        return toResponse(workflow);
    }

    @Transactional
    public void deleteWorkflow(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        // 관련 배포 이력 먼저 삭제 (FK 제약 해결)
        deployRepository.deleteByWorkflow(workflow);
        // 실제 DB 삭제
        workflowRepository.delete(workflow);
    }

    @Transactional
    public WorkflowResponse deployWorkflow(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        workflow.setStatus(WorkflowStatus.ACTIVE);
        saveDeployHistory(workflow, userDetails.getUser(), "DEPLOY", workflow.getRuleData());
        return toResponse(workflow);
    }

    @Transactional
    public WorkflowResponse stopWorkflow(String uid, CustomUserDetails userDetails) {
        Workflow workflow = findAndCheckOwner(uid, userDetails);
        workflow.setStatus(WorkflowStatus.INACTIVE);
        saveDeployHistory(workflow, userDetails.getUser(), "STOP", null);
        return toResponse(workflow);
    }

    @Transactional
    public WorkflowResponse createWorkflowFromTemplate(Template template,
                                                       String greenhouseUid,
                                                       CustomUserDetails userDetails) {
        String uid;
        do {
            uid = IdGenerator.generateWorkflowUid();
        } while (workflowRepository.findByUid(uid).isPresent());

        String flowData = (template.getFlowData() != null && !template.getFlowData().isBlank())
                ? template.getFlowData() : "{}";
        String ruleData = (template.getRuleData() != null && !template.getRuleData().isBlank())
                ? template.getRuleData() : "{}";

        Workflow workflow = Workflow.builder()
                .uid(uid)
                .user(userDetails.getUser())
                .name("[템플릿] " + template.getName())
                .description(template.getDescription())
                .flowData(flowData)
                .ruleData(ruleData)
                .status(WorkflowStatus.DRAFT)
                .version(1)
                .build();

        return toResponse(workflowRepository.save(workflow));
    }

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
                .status(w.getStatus() != null ? w.getStatus().name() : "DRAFT")
                .version(w.getVersion())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}