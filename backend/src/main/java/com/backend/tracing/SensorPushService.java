package com.backend.tracing;

import com.backend.sensor.SensorData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SensorPushService {

    private final SimpMessagingTemplate messagingTemplate;

    public void pushSensorData(SensorData data) {
        messagingTemplate.convertAndSend("/topic/sensor", data);
        log.info("센서 데이터 WebSocket 푸시: temp={}, humidity={}, lux={}, co2={}",
                data.getTemperature(), data.getHumidity(), data.getLux(), data.getCo2());
    }
}
