package com.backend.util;

import java.util.UUID;

/**
 * UUID 앞 4자리 기반 UID 생성기.
 * UUID는 충분히 난수성이 높아 4자리 추출 시 실용적 충돌 확률이 매우 낮습니다.
 * 단, 서비스 레이어에서 DB UNIQUE 제약 위반 시 1회 재시도를 권장합니다.
 */
public class IdGenerator {

    private IdGenerator() {}

    public static String generateWorkflowUid() {
        return "WF-" + shortUuid();
    }

    public static String generateDeviceUid() {
        return "DEV-" + shortUuid();
    }

    public static String generateDeployUid() {
        return "DEP-" + shortUuid();
    }

    public static String generateUserUid() {
        // users 테이블 uid 형식: FF+6자리
        return "FF-" + shortUuid(6);
    }

    public static String generateGreenhouseUid() {
        return "GH-" + shortUuid(6);
    }

    private static String shortUuid() {
        return shortUuid(4);
    }

    private static String shortUuid(int length) {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, length)
                .toUpperCase();
    }
}
