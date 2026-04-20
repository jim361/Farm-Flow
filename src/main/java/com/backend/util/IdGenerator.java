package com.backend.util;

import java.util.Random;

public class IdGenerator {
    private static final String CHARACTERS = "0123456789";
    private static final int UID_LENGTH = 6;
    private static final Random random = new Random();

    public static String generateWorkflowUid() {
        StringBuilder sb = new StringBuilder("FF-"); // 워크플로우는 FF로 시작
        for (int i = 0; i < UID_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}