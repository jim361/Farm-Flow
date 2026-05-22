package com.backend.service;

import com.backend.dto.TemplateApplyRequest;
import com.backend.dto.TemplateResponse;
import com.backend.dto.WorkflowRequest;
import com.backend.dto.WorkflowResponse;
import com.backend.entity.Template;
import com.backend.repository.TemplateRepository;
import com.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final WorkflowService workflowService;

    /** FR-TPL-001: 전체 목록 조회 */
    @Transactional(readOnly = true)
    public List<TemplateResponse> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /** FR-TPL-001: crop_type 필터 조회 */
    @Transactional(readOnly = true)
    public List<TemplateResponse> getTemplatesByCropType(String cropType) {
        return templateRepository.findByCropType(cropType).stream()
                .map(this::toResponse)
                .toList();
    }

    /** FR-TPL-001: 특정 템플릿 상세 조회 (uid 기반) */
    @Transactional(readOnly = true)
    public TemplateResponse getTemplateByUid(String uid) {
        Template template = templateRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("템플릿을 찾을 수 없습니다. UID: " + uid));
        return toResponse(template);
    }

    /**
     * FR-TPL-002: 템플릿 적용
     * - flow_data + rule_data 복사 → 새 Workflow 생성
     * - download_cnt +1
     * - 생성된 workflow uid 반환
     */
    @Transactional
    public WorkflowResponse applyTemplate(String uid, TemplateApplyRequest request,
                                          CustomUserDetails userDetails) {
        if (request.getGreenhouseUid() == null || request.getGreenhouseUid().isBlank()) {
            throw new IllegalStateException("적용할 하우스(greenhouseUid)를 선택해주세요.");
        }

        Template template = templateRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("템플릿을 찾을 수 없습니다. UID: " + uid));

        // download_cnt +1 (더티체킹)
        template.incrementDownloadCnt();

        // 워크플로우 복사 생성
        WorkflowRequest workflowRequest = new WorkflowRequest();
        // WorkflowRequest는 @Getter + @NoArgsConstructor 이므로 리플렉션 없이
        // 별도 빌더 패턴을 쓰기 어려움 → 내부 팩토리 메서드로 처리
        return workflowService.createWorkflowFromTemplate(template, request.getGreenhouseUid(), userDetails);
    }

    private TemplateResponse toResponse(Template template) {
        return TemplateResponse.builder()
                .uid(template.getUid())
                .name(template.getName())
                .description(template.getDescription())
                .cropType(template.getCropType())
                .author(template.getAuthor())
                .downloadCnt(template.getDownloadCnt())
                .flowData(template.getFlowData())
                .ruleData(template.getRuleData())
                .scheduleData(template.getScheduleData())
                .build();
    }
}