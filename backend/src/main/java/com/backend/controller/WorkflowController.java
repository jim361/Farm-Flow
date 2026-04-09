package com.backend.controller;

import com.backend.entity.Workflow;
import com.backend.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // [추가] 리액트 서버 접속 허용
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping("/init")
    public Workflow initWorkflow() {
        return workflowService.initWorkflow();
    }

    @PatchMapping("/{id}/data")
    public Workflow saveWorkflowData(@PathVariable Long id, @RequestBody String flowData) {
        return workflowService.saveWorkflowData(id, flowData);
    }

    @GetMapping
    public List<Workflow> getAllWorkflows() {
        return workflowService.getAllWorkflows();
    }
}