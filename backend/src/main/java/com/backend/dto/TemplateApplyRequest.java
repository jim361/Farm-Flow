package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "템플릿 적용 요청")
@Getter
@NoArgsConstructor
public class TemplateApplyRequest {

    @Schema(description = "적용할 하우스 외부 UID", example = "GH-001",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private String greenhouseUid;
}