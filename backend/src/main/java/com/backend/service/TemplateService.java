package com.backend.service;

import com.backend.dto.TemplateResponse;
import com.backend.entity.Template;
import com.backend.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;

    // 모든 샘플 템플릿 목록 조회
    @Transactional(readOnly = true)
    public List<TemplateResponse> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(this::convertToResponse)
                .toList();
    }

    // 특정 템플릿 상세 조회 (추가됨)
    @Transactional(readOnly = true)
    public TemplateResponse getTemplateById(Long id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 템플릿을 찾을 수 없습니다. id=" + id));
        return convertToResponse(template);
    }

    // 엔티티를 DTO 응답 객체로 변환
    private TemplateResponse convertToResponse(Template template) {
        return TemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .flowData(template.getFlowData())
                .ruleData(template.getRuleData())
                .scheduleData(template.getScheduleData())
                .build();
    }
}