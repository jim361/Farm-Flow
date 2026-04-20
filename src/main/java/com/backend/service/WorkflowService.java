package com.backend.service;

import com.backend.entity.Workflow;
import com.backend.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkflowService {

    private final WorkflowRepository workflowRepository;

    // 1. 새 워크플로우 생성 (필드명 name 반영)
    @Transactional
    public Workflow initWorkflow() {
        Workflow workflow = Workflow.builder()
                .name("새 워크플로우")
                .description("나만의 커스텀 로직을 설계하세요.")
                .flowData("{}")
                .ruleData("{}")
                .build();
        return workflowRepository.save(workflow);
    }

    // 2. 빌더 설계 데이터 저장
    @Transactional
    public Workflow saveWorkflowData(Long id, String flowData) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("워크플로우를 찾을 수 없습니다. ID: " + id));

        workflow.setFlowData(flowData);
        return workflow;
    }

    @Transactional
    public Workflow createWorkflow(String name, String flowData) {
        Workflow workflow = Workflow.builder()
                .name(name)
                .flowData(flowData)
                .ruleData("{}")       // ← 이 줄 추가
                .build();
        return workflowRepository.save(workflow);
    }

    // Service에서는 이렇게
    @Transactional
    public void deleteWorkflow(Long id) {
        if (!workflowRepository.existsById(id)) {
            throw new IllegalArgumentException("워크플로우를 찾을 수 없습니다. ID: " + id);
        }
        workflowRepository.deleteById(id);
    }




    // 3. 전체 목록 조회
    public List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
    }
}